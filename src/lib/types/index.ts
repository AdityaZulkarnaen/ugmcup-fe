// ================== MASTER DATA ==================

export interface Institution {
  id: string;
  name: string;
  type: "UNIVERSITAS" | "SMA";
  logoUrl?: string;
  createdAt: string;
}

export interface Athlete {
  id: string;
  institutionId: string;
  name: string;
  gender: "LAKI_LAKI" | "PEREMPUAN";
  studentId?: string;
  photoUrl?: string;
  createdAt: string;
  institution?: Institution;
}

export interface Category {
  id: string;
  name: string;
}

export interface Discipline {
  id: string;
  categoryId: string;
  name: string;
  type: string;
  isTeamEvent: boolean;
  category?: Category;
}

export interface ParticipantAthlete {
  id: string;
  participantId: string;
  athleteId: string;
  athlete?: Athlete;
}

export interface Participant {
  id: string;
  disciplineId: string;
  institutionId: string;
  seedNumber?: number;
  discipline?: Discipline;
  institution?: Institution;
  athletes?: ParticipantAthlete[];
}

export interface TeamMember {
  id: string;
  teamId: string;
  athleteId: string;
  assignedSlot: string;
  athlete?: Athlete;
}

export interface Team {
  id: string;
  disciplineId: string;
  institutionId: string;
  seedNumber?: number;
  discipline?: Discipline;
  institution?: Institution;
  members?: TeamMember[];
}

// ================== MATCH ==================

export type MatchStatus = "SCHEDULED" | "ONGOING" | "FINISHED" | "RETIRED";
export type MatchType = "INDIVIDUAL" | "TEAM";
export type MatchStage = "GROUP" | "KNOCKOUT";

export interface MatchSet {
  id: string;
  matchId: string;
  setNumber: number;
  scoreA: number;
  scoreB: number;
  isFinished: boolean;
  durationSeconds?: number;
  timerStatus?: "STOPPED" | "RUNNING";
  timerStartedAt?: string;
}

export interface Match {
  id: string;
  disciplineId: string;
  parentMatchId?: string;
  slotType?: string;
  matchType: MatchType;
  stage: MatchStage;
  roundName: string;
  groupName?: string;
  participantAId?: string;
  participantBId?: string;
  teamAId?: string;
  teamBId?: string;
  courtNumber?: number;
  scheduledTime?: string;
  status: MatchStatus;
  winnerParticipantId?: string;
  winnerTeamId?: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  sets?: MatchSet[];
  participantA?: Participant;
  participantB?: Participant;
  teamA?: Team;
  teamB?: Team;
  discipline?: Discipline;
  childMatches?: Match[];
}

// ================== BRACKET ==================

export interface BracketNode {
  id: string;
  matchId: string;
  disciplineId: string;
  position: number;
  nextNodeId?: string;
  nextSlot?: "A" | "B";
  match?: Match;
}

// ================== STANDING ==================

export interface Standing {
  id: string;
  disciplineId: string;
  groupName: string;
  participantId?: string;
  teamId?: string;
  played: number;
  won: number;
  lost: number;
  gameWon: number;
  gameLost: number;
  setWon: number;
  setLost: number;
  pointWon: number;
  pointLost: number;
  rank: number;
  form?: Array<"W" | "L">;
  updatedAt: string;
  participant?: Participant;
  team?: Team;
}

// ================== ADMIN & AUDIT ==================

export type AdminRole = "SUPER_ADMIN" | "EDITOR_KONTEN";

export interface AdminUser {
  id: string;
  username: string;
  role: AdminRole;
}

export interface AuditLog {
  id: string;
  adminId: string;
  action: string;
  entity: string;
  entityId: string;
  oldValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  isUndone?: boolean;
  createdAt: string;
  admin?: { username: string; role: string };
}

// ================== CONTENT ==================

export interface News {
  id: string;
  title: string;
  content: string;
  coverImage?: string;
  publishedAt?: string;
  createdAt: string;
}

export interface Media {
  id: string;
  imageUrl: string;
  caption?: string;
  category?: string;
  createdAt: string;
}



export interface Faq {
  id: string;
  question: string;
  answer: string;
  order: number;
}

// ================== AUTH ==================

export interface AuthState {
  token: string | null;
  user: AdminUser | null;
  isAuthenticated: boolean;
}

// ================== REALTIME ==================

export interface ScoreUpdatePayload {
  matchId: string;
  setNumber: number;
  scoreA: number;
  scoreB: number;
}

export interface MatchFinishedPayload {
  matchId: string;
  winnerParticipantId?: string;
  winnerTeamId?: string;
}

export interface MatchHistoryEntry {
  id: string;
  action: "UPDATE_SCORE" | "UNDO_SCORE";
  setNumber?: number;
  scoreA?: number;
  scoreB?: number;
  elapsedSeconds: number | null;
  isUndone?: boolean;
  createdAt: string;
}
