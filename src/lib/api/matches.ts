import { apiRequest } from "./client";
import type { Match, MatchStatus } from "@/lib/types";

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

export const updateMatchSchedule = (
  id: string,
  data: { courtNumber?: number; scheduledTime?: string }
) =>
  apiRequest<Match>(`/admin/matches/${id}/schedule`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

export const startMatch = (id: string) =>
  apiRequest<Match>(`/admin/matches/${id}/start`, { method: "PATCH", body: JSON.stringify({}) });

export const finishMatch = (
  id: string,
  data: { walkover?: boolean; winnerParticipantId?: string; winnerTeamId?: string }
) =>
  apiRequest<Match>(`/admin/matches/${id}/finish`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

export const updateScore = (
  id: string,
  data: {
    setNumber: number;
    scoreA: number;
    scoreB: number;
    version: number;
  }
) =>
  apiRequest<Match>(`/admin/matches/${id}/score`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
