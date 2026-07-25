"use client";

import { useEffect, useState } from "react";
import { StatCard } from "@/components/dashboard/StatCard";
import { getMatches } from "@/lib/api/matches";

export function PanitiaHome() {
  const [stats, setStats] = useState({ scheduled: 0, ongoing: 0, finished: 0 });

  useEffect(() => {
    async function load() {
      const matches = await getMatches().catch(() => []);
      const today = new Date().toDateString();
      const todayMatches = matches.filter(m => m.scheduledTime && new Date(m.scheduledTime).toDateString() === today);
      setStats({
        scheduled: todayMatches.filter(m => m.status === "SCHEDULED").length,
        ongoing: matches.filter(m => m.status === "ONGOING").length,
        finished: todayMatches.filter(m => m.status === "FINISHED").length,
      });
    }
    load();
  }, []);

  return (
    <div>
      <h2 className="mb-6 text-xl font-black italic text-white">Selamat datang, Panitia 👋</h2>
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Match Terjadwal Hari Ini" value={stats.scheduled} icon="🗓️" accent="violet" />
        <StatCard label="Match Sedang Berlangsung" value={stats.ongoing} icon="⚡" accent="mint" />
        <StatCard label="Match Selesai Hari Ini" value={stats.finished} icon="✅" />
      </div>
      <div className="mt-8 rounded-2xl border p-6" style={{ borderColor: "rgba(255,255,255,0.08)", background: "var(--dash-card-bg)" }}>
        <h3 className="mb-3 text-sm font-bold text-white">Alur Kerja Panitia Lapangan</h3>
        <ul className="space-y-2 text-sm" style={{ color: "#9D9DB6" }}>
          <li className="flex gap-2"><span style={{ color: "#66FFB4" }}>1.</span> Buka <strong className="text-white">Jadwal</strong> untuk melihat match hari ini.</li>
          <li className="flex gap-2"><span style={{ color: "#66FFB4" }}>2.</span> Klik <strong className="text-white">Mulai Match</strong> saat pertandingan akan dimulai di lapangan.</li>
          <li className="flex gap-2"><span style={{ color: "#66FFB4" }}>3.</span> Buka tab <strong className="text-white">Match Aktif</strong> lalu input skor tiap set secara real-time.</li>
          <li className="flex gap-2"><span style={{ color: "#66FFB4" }}>4.</span> Klik <strong className="text-white">Selesaikan Match</strong> untuk menutup pertandingan. Bracket & klasemen otomatis ter-update.</li>
        </ul>
      </div>
    </div>
  );
}
