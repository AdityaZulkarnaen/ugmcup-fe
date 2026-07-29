"use client";

import { useEffect, useState, useCallback } from "react";
import { getMatches } from "@/lib/api/matches";
import type { Match } from "@/lib/types";
import { LiveScoreCard } from "./LiveScoreCard";
import { SkeletonPanel } from "@/components/ui/Skeleton";
import { LiveScoreCardSkeleton } from "./MatchSkeletons";
import { useGlobalPanitiaRoom } from "@/lib/hooks/useSocket";

interface LiveScorePanelProps {
  isLight?: boolean;
}

export function LiveScorePanel({ isLight = false }: LiveScorePanelProps) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { lastUpdate } = useGlobalPanitiaRoom();

  const fetchLiveMatches = useCallback(async () => {
    try {
      const data = await getMatches({ status: "ONGOING" });
      setMatches(data || []);
      setError(null);
    } catch (err: any) {
      console.error("Gagal mengambil match live:", err);
      setError("Gagal memuat pertandingan live.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLiveMatches();
  }, [fetchLiveMatches, lastUpdate]);

  // Polling fallback every 15 seconds
  useEffect(() => {
    const interval = setInterval(fetchLiveMatches, 15000);
    return () => clearInterval(interval);
  }, [fetchLiveMatches]);

  if (loading) {
    return (
      <SkeletonPanel label="Memuat live score…" isLight={isLight} className="gap-5">
        {[0, 1].map((i) => (
          <LiveScoreCardSkeleton key={i} isLight={isLight} delay={i * 180} />
        ))}
      </SkeletonPanel>
    );
  }

  if (error) {
    return (
      <div
        className={`flex min-h-40 items-center justify-center rounded-2xl border border-dashed p-10 text-center text-sm ${
          isLight
            ? "border-[rgba(0,0,0,0.08)] bg-[rgba(0,0,0,0.02)] text-[rgba(26,22,43,0.4)]"
            : "border-white/10 bg-white/[0.01] text-[#7A7A83]"
        }`}
      >
        {error}
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div
        className={`flex min-h-40 flex-col items-center justify-center rounded-2xl border border-dashed p-10 text-center text-sm ${
          isLight
            ? "border-[rgba(0,0,0,0.08)] bg-[rgba(0,0,0,0.02)]"
            : "border-white/10 bg-white/[0.01]"
        }`}
      >
        <p
          className={`font-semibold ${isLight ? "text-[#1a162b]" : "text-white"}`}
        >
          Tidak ada pertandingan yang sedang berlangsung
        </p>
        <p
          className={`mt-1 text-xs ${
            isLight ? "text-[rgba(26,22,43,0.4)]" : "text-[#6B6B73]"
          }`}
        >
          Silakan cek tab Jadwal untuk melihat jadwal pertandingan mendatang.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {matches.map((match) => (
        <LiveScoreCard key={match.id} match={match} isLight={isLight} />
      ))}
    </div>
  );
}
