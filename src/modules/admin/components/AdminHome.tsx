"use client";

import { useEffect, useState } from "react";
import { Building2, Trophy, CheckCircle, Newspaper } from "lucide-react";
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
      <div className="mb-6">
        <h2 className="text-xl font-bold" style={{ color: "#111827" }}>Ringkasan Sistem</h2>
        <p className="mt-0.5 text-sm" style={{ color: "#6B7280" }}>Dashboard admin UGM CUP 2026</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard label="Institusi Terdaftar" value={stats.institutions} icon={<Building2 size={20} />} />
        <StatCard label="Match Hari Ini" value={stats.matchesToday} icon={<Trophy size={20} />} />
        <StatCard label="Match Selesai" value={stats.matchFinished} icon={<CheckCircle size={20} />} accentColor="#059669" />
      </div>

      <div className="mt-6 rounded-lg border bg-white p-5" style={{ borderColor: "#E5E7EB" }}>
        <h3 className="mb-3 text-sm font-semibold" style={{ color: "#111827" }}>Panduan Alur Kerja</h3>
        <ol className="space-y-2 text-sm" style={{ color: "#6B7280" }}>
          {[
            ["Tambahkan Institusi", "peserta terlebih dahulu"],
            ["Daftarkan Atlet", "dari setiap institusi"],
            ["Buat Peserta/Tim", "yang akan berlomba (individu atau beregu)"],
            ["Buat Jadwal Pertandingan", "untuk tiap match"],
            ["Setup Bracket", "fase gugur setelah grup selesai"],
          ].map(([bold, rest], i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white" style={{ background: "#6C47D1" }}>
                {i + 1}
              </span>
              <span><strong style={{ color: "#111827" }}>{bold}</strong> {rest}.</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
