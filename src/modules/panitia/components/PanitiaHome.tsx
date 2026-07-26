"use client";

import { useEffect, useState } from "react";
import { Calendar, Zap, CheckCircle } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { getMatches } from "@/lib/api/matches";
import { useGlobalPanitiaRoom } from "@/lib/hooks/useSocket";

export function PanitiaHome() {
  const [stats, setStats] = useState({ scheduled: 0, ongoing: 0, finished: 0 });
  const { lastUpdate } = useGlobalPanitiaRoom();

  useEffect(() => {
    async function load() {
      const matches = await getMatches().catch(() => []);

      const today = new Date().toDateString();
      const finishedToday = matches.filter(m =>
        m.status === "FINISHED" && m.scheduledTime && new Date(m.scheduledTime).toDateString() === today
      ).length;

      setStats({
        scheduled: matches.filter(m => m.status === "SCHEDULED").length,
        ongoing: matches.filter(m => m.status === "ONGOING").length,
        finished: finishedToday,
      });
    }
    load();
  }, [lastUpdate]);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold" style={{ color: "#111827" }}>Selamat Datang</h2>
        <p className="mt-0.5 text-sm" style={{ color: "#6B7280" }}>Dashboard Panitia Lapangan UGM CUP 2026</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Match Hari Ini" value={stats.scheduled} icon={<Calendar size={20} />} />
        <StatCard label="Sedang Berlangsung" value={stats.ongoing} icon={<Zap size={20} />} accentColor="#DC2626" />
        <StatCard label="Selesai Hari Ini" value={stats.finished} icon={<CheckCircle size={20} />} accentColor="#059669" />
      </div>

      <div className="mt-6 rounded-lg border bg-white p-5" style={{ borderColor: "#E5E7EB" }}>
        <h3 className="mb-3 text-sm font-semibold" style={{ color: "#111827" }}>Alur Kerja</h3>
        <ol className="space-y-2 text-sm" style={{ color: "#6B7280" }}>
          {[
            ["Jadwal", "lihat daftar match hari ini"],
            ["Mulai Match", "klik saat pertandingan akan dimulai"],
            ["Match Aktif", "pilih match yang Anda awasi, input skor per set secara realtime"],
            ["Selesaikan", "klik tombol selesai > bracket & klasemen otomatis ter-update"],
          ].map(([bold, rest], i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white" style={{ background: "#6C47D1" }}>
                {i + 1}
              </span>
              <span><strong style={{ color: "#111827" }}>{bold}</strong> &gt; {rest}.</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
