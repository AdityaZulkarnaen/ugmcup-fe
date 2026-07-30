/**
 * Konfigurasi PM2 untuk UGM CUP 2026 frontend.
 *
 * File ini TIDAK ikut berpindah setiap rilis — ia tinggal permanen di
 * /srv/ugmcup-fe/ecosystem.config.js dan selalu menunjuk ke symlink `current`.
 * Kalau ia ikut masuk ke dalam folder rilis, PM2 akan memuat konfigurasi dari
 * rilis lama saat rollback dan hasilnya membingungkan.
 *
 * Pasang sekali:
 *   sudo cp deploy/ecosystem.config.js /srv/ugmcup-fe/ecosystem.config.js
 */
module.exports = {
  apps: [
    {
      name: "ugmcup-fe",

      // server.js dari output `standalone` Next.js. cwd wajib ikut menunjuk ke
      // symlink yang sama, karena server.js mencari .next/ dan public/ relatif
      // terhadap direktori kerjanya.
      script: "server.js",
      cwd: "/srv/ugmcup-fe/current",

      // Next.js sudah multi-threaded di dalam satu proses dan menyimpan cache
      // ISR di memori per-instance. Menjalankan beberapa instance di satu EC2
      // kecil justru memperebutkan RAM dan memecah cache, jadi satu saja.
      instances: 1,
      exec_mode: "fork",

      env: {
        NODE_ENV: "production",
        // Hanya dengarkan localhost — yang menghadap internet adalah nginx.
        HOSTNAME: "127.0.0.1",
        PORT: 3000,
      },

      // Semua NEXT_PUBLIC_* sudah ditanam ke dalam bundle saat build di CI,
      // jadi tidak ada yang perlu diisi di sini. Kalau nanti ada rahasia
      // server-side (bukan NEXT_PUBLIC_), taruh di /srv/ugmcup-fe/.env dan
      // muat lewat `env_file`.

      max_memory_restart: "512M",

      // Beri waktu Next.js menyelesaikan request yang masih berjalan sebelum
      // proses lama dimatikan saat reload.
      kill_timeout: 10000,
      wait_ready: false,
      listen_timeout: 15000,

      autorestart: true,
      // Kalau crash berulang cepat, berhenti mencoba daripada terjebak
      // restart-loop yang menghabiskan CPU.
      max_restarts: 10,
      min_uptime: "20s",

      merge_logs: true,
      time: true,
      out_file: "/srv/ugmcup-fe/logs/out.log",
      error_file: "/srv/ugmcup-fe/logs/error.log",
    },
  ],
};
