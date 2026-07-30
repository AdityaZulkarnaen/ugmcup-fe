#!/usr/bin/env bash
#
# Dijalankan DI EC2 oleh GitHub Actions lewat SSH.
#
# Pola rilis atomik: setiap deploy diekstrak ke folder baru, symlink `current`
# baru dipindahkan setelah paketnya utuh, lalu PM2 di-reload. Kalau situs tidak
# sehat sesudahnya, symlink dikembalikan ke rilis sebelumnya dan PM2 di-reload
# lagi — jadi deploy yang gagal tidak pernah meninggalkan situs mati.
#
# Argumen:
#   $1 = path tarball yang sudah diunggah
#   $2 = identitas rilis (commit SHA)
#
set -euo pipefail

TARBALL="${1:?tarball path wajib diisi}"
RELEASE_ID="${2:?release id wajib diisi}"

APP_DIR="/srv/ugmcup-fe"
RELEASES_DIR="$APP_DIR/releases"
CURRENT_LINK="$APP_DIR/current"
NEW_RELEASE="$RELEASES_DIR/$RELEASE_ID"
HEALTH_URL="http://127.0.0.1:3000/"
KEEP_RELEASES=5

log() { echo "==> $*"; }

# Rilis yang sedang aktif, dicatat sebelum apa pun berubah supaya rollback tahu
# harus kembali ke mana. Kosong pada deploy pertama.
PREVIOUS_RELEASE=""
if [ -L "$CURRENT_LINK" ]; then
  PREVIOUS_RELEASE="$(readlink -f "$CURRENT_LINK")"
fi

# Tunggu sampai server melayani request. Bukan sekadar "apakah proses hidup" —
# PM2 melaporkan proses online jauh sebelum Next.js siap menerima koneksi.
wait_until_healthy() {
  local attempt
  for attempt in $(seq 1 30); do
    if curl -fsS --max-time 5 -o /dev/null "$HEALTH_URL"; then
      return 0
    fi
    sleep 2
  done
  return 1
}

rollback() {
  log "DEPLOY GAGAL — mengembalikan ke rilis sebelumnya"

  if [ -z "$PREVIOUS_RELEASE" ] || [ ! -d "$PREVIOUS_RELEASE" ]; then
    log "Tidak ada rilis sebelumnya untuk dikembalikan. Situs kemungkinan mati — perlu tindakan manual."
    exit 1
  fi

  ln -sfn "$PREVIOUS_RELEASE" "$CURRENT_LINK"
  pm2 reload "$APP_DIR/ecosystem.config.js" --update-env || pm2 start "$APP_DIR/ecosystem.config.js"

  if wait_until_healthy; then
    log "Rollback berhasil, situs kembali jalan di $(basename "$PREVIOUS_RELEASE")"
  else
    log "Rollback JUGA gagal. Situs mati — perlu tindakan manual."
  fi

  # Buang rilis gagal supaya tidak tertukar nanti.
  rm -rf "$NEW_RELEASE"
  exit 1
}

log "Menyiapkan rilis $RELEASE_ID"
mkdir -p "$RELEASES_DIR" "$APP_DIR/logs"
rm -rf "$NEW_RELEASE"
mkdir -p "$NEW_RELEASE"
tar -xzf "$TARBALL" -C "$NEW_RELEASE"
rm -f "$TARBALL"

# Kalau tarball-nya rusak atau tidak lengkap, berhenti SEBELUM symlink dipindah —
# situs lama masih melayani dan tidak ada yang terganggu.
if [ ! -f "$NEW_RELEASE/server.js" ]; then
  log "Paket rilis tidak valid: server.js tidak ditemukan. Membatalkan, situs lama tetap jalan."
  rm -rf "$NEW_RELEASE"
  exit 1
fi

log "Memindahkan symlink current -> $RELEASE_ID"
ln -sfn "$NEW_RELEASE" "$CURRENT_LINK"

log "Reload PM2"
# `startOrReload` menangani dua kasus sekaligus: proses sudah ada (reload) dan
# belum pernah ada, misalnya sesudah EC2 reboot (start).
pm2 startOrReload "$APP_DIR/ecosystem.config.js" --update-env

log "Menunggu server sehat"
if ! wait_until_healthy; then
  rollback
fi

log "Sehat. Menyimpan konfigurasi PM2 supaya bertahan setelah reboot"
pm2 save --force

log "Membersihkan rilis lama, menyisakan $KEEP_RELEASES terbaru"
# `ls -1t` mengurutkan berdasarkan waktu ubah, jadi rilis aktif selalu di atas
# dan tidak akan ikut terhapus.
cd "$RELEASES_DIR"
ls -1t | tail -n "+$((KEEP_RELEASES + 1))" | while read -r old; do
  if [ "$RELEASES_DIR/$old" != "$(readlink -f "$CURRENT_LINK")" ]; then
    log "menghapus rilis lama: $old"
    rm -rf "${RELEASES_DIR:?}/$old"
  fi
done

log "Deploy $RELEASE_ID selesai"
