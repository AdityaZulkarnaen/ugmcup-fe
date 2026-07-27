import { apiRequest } from "./client";
import type {
  Institution,
  Athlete,
  Discipline,
  Participant,
  Team,
  AuditLog,
  BracketNode,
  Standing,
} from "@/lib/types";

// ================== INSTITUTIONS ==================

export const getInstitutions = (type?: string) =>
  apiRequest<Institution[]>(`/institutions${type ? `?type=${type}` : ""}`);

export const createInstitution = (data: {
  name: string;
  type: "UNIVERSITAS" | "SMA";
  logoUrl?: string;
}) =>
  apiRequest<Institution>("/admin/institutions", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const deleteInstitution = (id: string) =>
  apiRequest<void>(`/admin/institutions/${id}`, { method: "DELETE" });

// ================== ATHLETES ==================

export const getAthletes = (institutionId?: string) =>
  apiRequest<Athlete[]>(
    `/athletes${institutionId ? `?institutionId=${institutionId}` : ""}`
  );

export const createAthlete = (data: {
  institutionId: string;
  name: string;
  gender: "PUTRA" | "PUTRI";
  studentId?: string;
}) =>
  apiRequest<Athlete>("/admin/athletes", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const deleteAthlete = (id: string) =>
  apiRequest<void>(`/admin/athletes/${id}`, { method: "DELETE" });

// ================== DISCIPLINES & CATEGORIES ==================

export const getCategories = () => apiRequest<{ id: string; name: string }[]>("/categories");

export const getDisciplines = (categoryId?: string) =>
  apiRequest<Discipline[]>(
    `/disciplines${categoryId ? `?categoryId=${categoryId}` : ""}`
  );

// ================== PARTICIPANTS ==================

export const getParticipants = (disciplineId?: string) =>
  apiRequest<Participant[]>(
    `/participants${disciplineId ? `?disciplineId=${disciplineId}` : ""}`
  );

export const createParticipant = (data: {
  disciplineId: string;
  institutionId: string;
  athleteIds: string[];
  seedNumber?: number;
}) =>
  apiRequest<Participant>("/admin/participants", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const deleteParticipant = (id: string) =>
  apiRequest<void>(`/admin/participants/${id}`, { method: "DELETE" });

// ================== TEAMS ==================

export const getTeams = (disciplineId?: string) =>
  apiRequest<Team[]>(
    `/teams${disciplineId ? `?disciplineId=${disciplineId}` : ""}`
  );

export const createTeam = (data: {
  disciplineId: string;
  institutionId: string;
  seedNumber?: number;
  members: { athleteId: string; assignedSlot: string }[];
}) =>
  apiRequest<Team>("/admin/teams", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const deleteTeam = (id: string) =>
  apiRequest<void>(`/admin/teams/${id}`, { method: "DELETE" });

// ================== BRACKET ==================

export const getBracket = (disciplineId: string) =>
  apiRequest<BracketNode[]>(`/brackets/${disciplineId}`);

export const setupBracket = (data: {
  disciplineId: string;
  roundNames: string[];
  participantIds?: string[];
  teamIds?: string[];
}) =>
  apiRequest<BracketNode[]>("/admin/brackets/setup", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const reassignBracketNode = (
  nodeId: string,
  data: { participantAId?: string | null; participantBId?: string | null; teamAId?: string | null; teamBId?: string | null }
) =>
  apiRequest<BracketNode[]>(`/admin/brackets/nodes/${nodeId}/reassign`, {
    method: "POST",
    body: JSON.stringify(data),
  });

// ================== STANDINGS ==================

export const getStandings = (disciplineId: string, groupName?: string) =>
  apiRequest<Standing[]>(
    `/standings?disciplineId=${disciplineId}${groupName ? `&groupName=${groupName}` : ""}`
  );

// ================== AUDIT LOGS ==================

export const getAuditLogs = (filters?: {
  matchId?: string;
  adminId?: string;
  action?: string;
}) => {
  const params = new URLSearchParams();
  if (filters?.matchId) params.set("matchId", filters.matchId);
  if (filters?.adminId) params.set("adminId", filters.adminId);
  if (filters?.action) params.set("action", filters.action);
  const qs = params.toString();
  return apiRequest<AuditLog[]>(`/admin/audit-logs${qs ? `?${qs}` : ""}`);
};
