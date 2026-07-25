"use client";

import { useEffect, useState } from "react";
import { StatCard } from "@/components/dashboard/StatCard";
import { getInstitutions } from "@/lib/api/admin";
import { getMatches } from "@/lib/api/matches";
import { getNews } from "@/lib/api/content";

export function AdminHome() {
  const [stats, setStats] = useState({
    institutions: 0,
    matchesToday: 0,
    matchFinished: 0,
    news: 0,
  });

  useEffect(() => {
    async function load() {
      const [institutions, matches, news] = await Promise.allSettled([
        getInstitutions(),
        getMatches(),
        getNews(),
      ]);
      const today = new Date().toDateString();
      const allMatches = matches.status === "fulfilled" ? matches.value : [];
      setStats({
        institutions: institutions.status === "fulfilled" ? institutions.value.length : 0,
        matchesToday: allMatches.filter(
          (m) => m.scheduledTime && new Date(m.scheduledTime).toDateString() === today
        ).length,
        matchFinished: allMatches.filter((m) => m.status === "FINISHED").length,
        news: news.status === "fulfilled" ? news.value.length : 0,
      });
    }
    load();
  }, []);

  return (
    <div>
      <h2 className="mb-6 text-xl font-black italic text-white">Ringkasan Sistem</h2>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Institusi Terdaftar" value={stats.institutions} icon="🏛️" accent="violet" />
        <StatCard label="Match Hari Ini" value={stats.matchesToday} icon="🏸" accent="mint" />
        <StatCard label="Match Selesai" value={stats.matchFinished} icon="✅" />
        <StatCard label="Berita Diterbitkan" value={stats.news} icon="📰" />
      </div>

      <div className="mt-8 rounded-2xl border p-6" style={{ borderColor: "rgba(255,255,255,0.08)", background: "var(--dash-card-bg)" }}>
        <h3 className="mb-3 text-sm font-bold text-white">Panduan Cepat</h3>
        <ul className="space-y-2 text-sm" style={{ color: "#9D9DB6" }}>
          <li className="flex items-start gap-2"><span className="mt-0.5 text-[#66FFB4]">1.</span> Tambahkan <strong className="text-white">Institusi</strong> peserta terlebih dahulu.</li>
          <li className="flex items-start gap-2"><span className="mt-0.5 text-[#66FFB4]">2.</span> Daftarkan <strong className="text-white">Atlet</strong> dari setiap institusi.</li>
          <li className="flex items-start gap-2"><span className="mt-0.5 text-[#66FFB4]">3.</span> Buat <strong className="text-white">Peserta/Tim</strong> yang akan berlomba (individu atau beregu).</li>
          <li className="flex items-start gap-2"><span className="mt-0.5 text-[#66FFB4]">4.</span> Buat <strong className="text-white">Jadwal Pertandingan</strong> untuk tiap match.</li>
          <li className="flex items-start gap-2"><span className="mt-0.5 text-[#66FFB4]">5.</span> Setup <strong className="text-white">Bracket</strong> fase gugur setelah grup selesai.</li>
        </ul>
      </div>
    </div>
  );
}
