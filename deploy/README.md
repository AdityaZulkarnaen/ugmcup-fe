# Deploy — UGM CUP 2026 Frontend

CI/CD ke AWS EC2. Push ke `main` → GitHub Actions build & uji → kirim ke EC2 →
PM2 reload → cek kesehatan, rollback otomatis kalau gagal.

Isi folder ini:

| File | Tinggal di mana | Fungsi |
|---|---|---|
| `nginx/ugmcup2026.com.conf` | `/etc/nginx/sites-available/` di EC2 | Konsolidasi alamat + reverse proxy |
| `ecosystem.config.js` | `/srv/ugmcup-fe/` di EC2 | Konfigurasi PM2 (permanen, tidak ikut rilis) |
| `release.sh` | Dikirim dari repo tiap deploy | Rilis atomik + rollback |
| `../.github/workflows/deploy.yml` | GitHub | Pipeline-nya |

---

## Cara kerjanya

`next build` menghasilkan `.next/standalone` — server Node yang sudah lengkap
dengan `node_modules` seperlunya. Artinya **EC2 tidak pernah menjalankan `npm
install`, apalagi `next build`**. Build adalah bagian paling rakus RAM, dan
instance kecil sering kehabisan memori di tengah build; di sini semua itu
terjadi di runner GitHub, EC2 hanya menerima ±30 MB paket jadi.

Struktur di server:

```
/srv/ugmcup-fe/
├── current -> releases/<sha>     # symlink, dipindah saat rilis
├── releases/
│   ├── a1b2c3d…/                 # tiap rilis satu folder
│   └── e4f5g6h…/                 # 5 terakhir disimpan untuk rollback
├── ecosystem.config.js
└── logs/
```

Symlink baru dipindah **setelah** paket diekstrak utuh, dan dikembalikan kalau
health check gagal — jadi deploy yang rusak tidak pernah meninggalkan situs mati.

---

## Setup awal di EC2 (sekali saja)

Login ke EC2, lalu:

### 1. Siapkan folder

```bash
sudo mkdir -p /srv/ugmcup-fe/{releases,logs}
sudo chown -R $USER:$USER /srv/ugmcup-fe
```

### 2. Pasang konfigurasi PM2

Dari laptop, salin file dari repo:

```bash
scp deploy/ecosystem.config.js ubuntu@<EC2_HOST>:/srv/ugmcup-fe/ecosystem.config.js
```

### 3. Pastikan PM2 hidup lagi setelah EC2 reboot

```bash
pm2 startup            # jalankan perintah sudo yang dicetaknya
```

`pm2 save` sudah dijalankan otomatis oleh `release.sh` setiap deploy berhasil.

### 4. Pasang nginx

```bash
sudo cp deploy/nginx/ugmcup2026.com.conf /etc/nginx/sites-available/ugmcup2026.com
sudo ln -sf /etc/nginx/sites-available/ugmcup2026.com /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default      # penting: lihat catatan di bawah
sudo nginx -t && sudo systemctl reload nginx
```

> `sites-enabled/default` wajib dihapus. Selama ia masih ada, ia jadi
> `default_server` dan akan melayani situs lewat IP publik EC2 — persis
> duplikasi alamat yang mau kita hilangkan.

### 5. Sertifikat harus mencakup www

Blok redirect `www → apex` melakukan TLS handshake untuk `www.ugmcup2026.com`
lebih dulu. Kalau sertifikat tidak memuat nama itu, browser kena peringatan
sertifikat sebelum sempat di-redirect:

```bash
sudo certbot --nginx -d ugmcup2026.com -d www.ugmcup2026.com
sudo certbot renew --dry-run
```

### 6. DNS

Di Route 53 (atau registrar domainmu) pastikan **keduanya** ada:

| Record | Tipe | Nilai |
|---|---|---|
| `ugmcup2026.com` | A | IP publik EC2 (pakai Elastic IP!) |
| `www.ugmcup2026.com` | A / CNAME | IP yang sama, atau CNAME ke apex |

`www` tetap harus mengarah ke server — kalau tidak ada DNS-nya, redirect
`www → apex` tidak pernah terpanggil dan pengunjung yang mengetik `www` justru
dapat error DNS.

Pakai **Elastic IP**. Tanpa itu, IP publik EC2 berubah tiap kali instance
di-stop/start dan situs hilang.

### 7. Security group

Buka **80** dan **443** ke `0.0.0.0/0`. Port **3000 jangan dibuka** — Next.js
hanya mendengarkan `127.0.0.1`, dan yang menghadap internet cuma nginx.

---

## Setup di GitHub (sekali saja)

**Settings → Secrets and variables → Actions**

### Secrets (tab *Secrets*)

| Nama | Isi |
|---|---|
| `EC2_HOST` | IP Elastic atau hostname EC2 |
| `EC2_USER` | User SSH — biasanya `ubuntu` (Ubuntu AMI) atau `ec2-user` (Amazon Linux) |
| `EC2_SSH_KEY` | **Seluruh isi** private key, termasuk baris `-----BEGIN…` dan `-----END…` |
| `EC2_KNOWN_HOSTS` | Host key EC2 (lihat di bawah) |

Untuk `EC2_KNOWN_HOSTS`, jalankan di laptop lalu tempel hasilnya:

```bash
ssh-keyscan -H <EC2_HOST>
```

Ini opsional secara teknis — tanpa itu workflow tetap jalan dengan peringatan —
tapi isilah. Tanpa host key yang dipin, runner menerima begitu saja kunci apa pun
yang menjawab, dan itu celah MITM.

> **Sebaiknya buat SSH key khusus deploy**, jangan pakai key pribadimu:
> ```bash
> ssh-keygen -t ed25519 -C "github-actions-ugmcup" -f ~/.ssh/ugmcup_deploy
> ssh-copy-id -i ~/.ssh/ugmcup_deploy.pub ubuntu@<EC2_HOST>
> ```
> Isi `EC2_SSH_KEY` dengan `~/.ssh/ugmcup_deploy` (yang **tanpa** `.pub`).

### Variables (tab *Variables*)

Bukan rahasia — nilainya toh ikut tertanam di bundle JavaScript.

| Nama | Isi |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://ugmcup2026.com` |
| `NEXT_PUBLIC_API_URL` | `https://ugmcup.up.railway.app` |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | Kode dari Search Console (opsional) |
| `NEXT_PUBLIC_BING_SITE_VERIFICATION` | Kode dari Bing Webmaster (opsional) |

Semuanya punya nilai default di workflow, jadi pipeline tetap jalan walau belum
diisi. **Semua `NEXT_PUBLIC_*` ditanam saat build** — mengubahnya di EC2 tidak
berpengaruh sama sekali, harus diubah di sini lalu deploy ulang.

### Environment

Workflow memakai environment `production`. Buat di **Settings → Environments**.
Kalau mau deploy perlu persetujuan manual dulu, tambahkan *required reviewers*
di situ.

---

## Deploy pertama

Deploy pertama tidak punya rilis sebelumnya, jadi tidak ada yang bisa
di-rollback. Matikan dulu proses PM2 lama supaya port 3000 tidak bentrok:

```bash
pm2 delete all      # di EC2
```

Lalu push ke `main`, atau jalankan **Actions → CI / Deploy → Run workflow**.

---

## Operasional

```bash
pm2 status
pm2 logs ugmcup-fe --lines 100
pm2 monit
sudo tail -f /var/log/nginx/error.log
```

### Rollback manual

```bash
ls -1t /srv/ugmcup-fe/releases          # rilis terbaru di atas
ln -sfn /srv/ugmcup-fe/releases/<sha-lama> /srv/ugmcup-fe/current
pm2 reload /srv/ugmcup-fe/ecosystem.config.js --update-env
```

### Cek konsolidasi alamat masih benar

```bash
curl -sI http://ugmcup2026.com       | head -3   # 301 -> https://ugmcup2026.com
curl -sI http://www.ugmcup2026.com   | head -3   # 301 -> https://ugmcup2026.com
curl -sI https://www.ugmcup2026.com  | head -3   # 301 -> https://ugmcup2026.com
curl -sI https://ugmcup2026.com      | head -3   # 200
curl -sI http://<IP-EC2>             | head -3   # koneksi ditutup (444)
```

Tiga yang pertama harus **301 sekali lompat** ke `https://ugmcup2026.com`, bukan
berantai.

---

## Catatan

**Lint belum jadi pagar.** Saat pipeline ini dibuat, `npm run lint` menghasilkan
115 error yang sudah ada sebelumnya — sebagian besar
`react-hooks/set-state-in-effect` di komponen dashboard admin dan media. Kalau
lint dibuat memblokir, deploy pertama langsung gagal. Jadi step-nya diberi
`continue-on-error: true`: hasilnya tetap terlihat di log Actions, tapi tidak
menahan rilis. Yang benar-benar jadi pagar adalah `next build`, yang ikut
menjalankan pengecekan TypeScript.

Setelah tunggakan lint dibereskan, hapus `continue-on-error` di
`.github/workflows/deploy.yml`.

**Reload PM2 di fork mode berarti restart.** Ada jeda ±1–3 detik saat deploy.
Sudah sengaja dipilih fork mode karena paling sedikit kejutannya. Kalau nanti
mau benar-benar tanpa jeda, ubah `exec_mode` jadi `"cluster"` di
`ecosystem.config.js` — dengan `instances: 1` PM2 akan menyalakan proses baru
dulu baru mematikan yang lama. Coba setelah beberapa kali deploy berjalan mulus.

**Jangan deploy saat pertandingan sedang live.** Jeda restart itu kecil, tapi
halaman live score adalah halaman yang paling ramai justru di saat itu.

**Kalau `next.config.ts` diubah**, ia ikut terbaca saat build di CI dan ikut
terserialisasi ke dalam `server.js` standalone. Cukup deploy ulang, tidak ada
langkah tambahan di server.
