"use client";

import { useEffect, useState } from "react";
import { StatCard } from "@/components/dashboard/StatCard";
import { getNews, getMedia, getFaqs } from "@/lib/api/content";

export function MediaHome() {
  const [stats, setStats] = useState({ news: 0, media: 0, faqs: 0 });

  useEffect(() => {
    async function load() {
      const [n, m, f] = await Promise.allSettled([getNews(), getMedia(), getFaqs()]);
      setStats({
        news: n.status === "fulfilled" ? n.value.length : 0,
        media: m.status === "fulfilled" ? m.value.length : 0,
        faqs: f.status === "fulfilled" ? f.value.length : 0,
      });
    }
    load();
  }, []);

  return (
    <div>
      <h2 className="mb-6 text-xl font-black italic text-white">Portal Konten Media 🎬</h2>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Berita" value={stats.news} icon="📰" accent="violet" />
        <StatCard label="Foto Galeri" value={stats.media} icon="🖼️" accent="mint" />
        <StatCard label="FAQ" value={stats.faqs} icon="❓" />
      </div>
      <div className="mt-8 rounded-2xl border p-6" style={{ borderColor: "rgba(255,255,255,0.08)", background: "var(--dash-card-bg)" }}>
        <h3 className="mb-3 text-sm font-bold text-white">Panduan Editor Konten</h3>
        <ul className="space-y-2 text-sm" style={{ color: "#9D9DB6" }}>
          <li className="flex gap-2"><span style={{ color: "#66FFB4" }}>📰</span> <span><strong className="text-white">Berita</strong> — Tulis artikel/berita untuk ditampilkan di landing page dan halaman berita.</span></li>
          <li className="flex gap-2"><span style={{ color: "#66FFB4" }}>🖼️</span> <span><strong className="text-white">Galeri</strong> — Upload URL foto dokumentasi event per kategori (Opening Ceremony, Semifinal, dll).</span></li>
          <li className="flex gap-2"><span style={{ color: "#66FFB4" }}>❓</span> <span><strong className="text-white">FAQ</strong> — Tambah/edit pertanyaan & jawaban yang sering ditanyakan tamu.</span></li>
        </ul>
      </div>
    </div>
  );
}
