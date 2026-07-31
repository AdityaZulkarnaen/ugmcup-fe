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

export const uploadFile = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  
  const token = localStorage.getItem("ugmcup_token");
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/admin/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!res.ok) {
    // Guard against HTML error pages (e.g. 413 from proxy/nginx)
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const error = await res.json();
      throw new Error(error.message || "Gagal mengunggah file");
    }
    if (res.status === 413) {
      throw new Error("File terlalu besar. Maksimum ukuran file adalah 20 MB.");
    }
    throw new Error(`Upload gagal (HTTP ${res.status})`);
  }

  const data = await res.json();
  return data.url as string;
};

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

export const updateInstitution = (id: string, data: {
  name?: string;
  type?: "UNIVERSITAS" | "SMA";
  logoUrl?: string;
}) =>
  apiRequest<Institution>(`/admin/institutions/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

export const deleteInstitution = (id: string) =>
  apiRequest<void>(`/admin/institutions/${id}`, { method: "DELETE" });

// ================== ATHLETES ==================

export const getAthletes = (params?: { institutionId?: string; gender?: string; institutionType?: string }) => {
  const query = new URLSearchParams();
  if (params?.institutionId) query.append("institutionId", params.institutionId);
  if (params?.gender) query.append("gender", params.gender);
  if (params?.institutionType) query.append("institutionType", params.institutionType);
  const qStr = query.toString();
  return apiRequest<Athlete[]>(`/athletes${qStr ? `?${qStr}` : ""}`);
};

export const getAthlete = (id: string) =>
  apiRequest<any>(`/athletes/${id}`);

export const createAthlete = (data: Partial<Athlete>) =>
  apiRequest<Athlete>("/admin/athletes", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updateAthlete = (id: string, data: Partial<Athlete>) =>
  apiRequest<Athlete>(`/admin/athletes/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

export const deleteAthlete = (id: string) =>
  apiRequest<void>(`/admin/athletes/${id}`, { method: "DELETE" });

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

export const updateParticipant = (
  id: string,
  data: { disciplineId: string; institutionId: string; athleteIds: string[] }
) =>
  apiRequest<Participant>(`/admin/participants/${id}`, {
    method: "PATCH",
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
  members: { assignedSlot: string; athleteId: string }[];
}) =>
  apiRequest<Team>("/admin/teams", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updateTeam = (
  id: string,
  data: {
    disciplineId: string;
    institutionId: string;
    members: { assignedSlot: string; athleteId: string }[];
  }
) =>
  apiRequest<Team>(`/admin/teams/${id}`, {
    method: "PATCH",
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

export const deleteBracket = (disciplineId: string) =>
  apiRequest<{ message: string; deletedMatches: number }>(
    `/admin/brackets/${disciplineId}`,
    { method: "DELETE" }
  );

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

export const setupGroupStandings = (data: {
  disciplineId: string;
  groupName: string;
  teamIds: string[];
}) =>
  apiRequest<Standing[]>("/admin/standings/group", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const resetGroupStandings = (disciplineId: string) =>
  apiRequest<{ message: string; count: number }>(`/admin/standings/reset?disciplineId=${disciplineId}`, {
    method: "DELETE",
  });

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
