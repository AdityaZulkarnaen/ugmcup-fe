import { apiRequest } from "./client";
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

export const swapMatchSides = (id: string) =>
  apiRequest<Match>(`/admin/matches/${id}/swap-sides`, { method: "PATCH" });

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
