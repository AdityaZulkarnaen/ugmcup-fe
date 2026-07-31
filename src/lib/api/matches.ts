import { apiRequest } from "./client";
import { DUMMY_DATA } from "./dummy";
import type { Match, MatchStatus, MatchHistoryEntry } from "@/lib/types";

// ================== READ ==================

export const getMatches = (filters?: {
  disciplineId?: string;
  status?: MatchStatus;
  courtNumber?: number;
  stage?: string;
  groupName?: string;
}) => {
  const params = new URLSearchParams();
  if (filters?.disciplineId) params.set("disciplineId", filters.disciplineId);
  if (filters?.status) params.set("status", filters.status);
  if (filters?.courtNumber) params.set("courtNumber", String(filters.courtNumber));
  if (filters?.stage) params.set("stage", filters.stage);
  if (filters?.groupName) params.set("groupName", filters.groupName);
  const qs = params.toString();
  return apiRequest<Match[]>(`/matches${qs ? `?${qs}` : ""}`);
};

/**
 * Daftar pertandingan untuk halaman publik Pertandingan.
 *
 * Sengaja dipisah dari `getMatches` supaya data dummy tidak ikut terpakai di
 * dashboard admin — di sana aksi hapus/selesaikan match harus tetap menunjuk
 * ID asli. Saklar dummy-nya ada di src/lib/api/dummy.ts.
 */
export const getPublicMatches = (): Promise<Match[]> =>
  DUMMY_DATA.matches ? Promise.resolve(DUMMY_DATA.matches) : getMatches();

export const getMatch = (id: string) => apiRequest<Match>(`/matches/${id}`);

export const getMatchHistory = (id: string) =>
  apiRequest<MatchHistoryEntry[]>(`/matches/${id}/history`);

// ================== WRITE (admin/panitia) ==================

export const createMatch = (data: {
  disciplineId: string;
  matchType: "INDIVIDUAL" | "TEAM";
  stage: "GROUP" | "KNOCKOUT";
  roundName: string;
  groupName?: string;
  participantAId?: string;
  participantBId?: string;
  teamAId?: string;
  teamBId?: string;
  courtNumber?: number;
  scheduledTime?: string;
}) =>
  apiRequest<Match>("/admin/matches", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const createTeamMatch = (data: {
  disciplineId: string;
  stage: "GROUP" | "KNOCKOUT";
  roundName: string;
  groupName?: string;
  teamAId: string;
  teamBId: string;
  courtNumber?: number;
  scheduledTime?: string;
}) =>
  apiRequest<Match>("/admin/matches/team", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const deleteMatch = (id: string) =>
  apiRequest<void>(`/admin/matches/${id}`, { method: "DELETE" });

export const generateGroupMatches = (data: {
  disciplineId: string;
  groupName: string;
}) =>
  apiRequest<{ message: string; matches: Match[] }>("/admin/matches/generate-group", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updateMatchSchedule = (
  id: string,
  data: { courtNumber?: number; scheduledTime?: string }
) =>
  apiRequest<Match>(`/admin/matches/${id}/schedule`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

export const finishMatch = (
  id: string,
  data: { 
    status: 'FINISHED' | 'WALK_OVER' | 'RETIRED';
    winnerId: string;
    sets?: Array<{ setNumber: number; scoreA: number; scoreB: number }>;
  }
) =>
  apiRequest<Match>(`/admin/matches/${id}/finish`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
