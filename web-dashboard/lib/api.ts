// Thin client for the Core API (NestJS — docs/product-design FASE 4 §4.2).
// No real coach auth yet (M1.1 is unfinished for the web dashboard too): the
// coach id is entered manually and kept in localStorage — replace with a real
// session once Auth0/WorkOS is wired in for the B2B channel (FASE 4 §4.4).
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000";

export class ApiError extends Error {}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) {
    throw new ApiError(`Richiesta fallita (${res.status}): ${await res.text()}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export interface CoachAthleteEntry {
  link: { id: string; status: string; createdAt: string };
  athlete: { id: string; fullName: string; email: string };
  latestRisk: { riskLevel: "GREEN" | "YELLOW" | "RED"; recommendationText: string | null } | null;
}

export interface PendingLink {
  id: string;
  createdAt: string;
  athlete: { id: string; fullName: string; email: string };
}

export function getAthletesForCoach(coachId: string) {
  return request<CoachAthleteEntry[]>(`/coaches/${coachId}/athletes`);
}

export function getPendingLinks(coachId: string) {
  return request<PendingLink[]>(`/coaches/${coachId}/athlete-links/pending`);
}

export function acceptLink(coachId: string, linkId: string) {
  return request<unknown>(`/coaches/${coachId}/athlete-links/${linkId}/accept`, { method: "PATCH" });
}

export interface AthleteSession {
  id: string;
  scheduledDate: string;
  status: string;
  sessionFocus: string | null;
}

export interface RiskAssessment {
  riskLevel: "GREEN" | "YELLOW" | "RED";
  assessmentDate: string;
  contributingFactors: string[];
  recommendationText: string | null;
}

// S25 (docs/product-design FASE 6): drill-down atleta — sessioni e ultima
// valutazione di rischio. Nota: questi endpoint sul Core API non applicano
// ancora un controllo "solo il coach collegato può leggerli" (RLS reale è
// pianificata per la migrazione auth, FASE 4 §4.4) — limite noto, non nuovo.
export function getAthleteSessions(athleteId: string) {
  return request<AthleteSession[]>(`/athletes/${athleteId}/sessions`);
}

export function getAthleteRisk(athleteId: string) {
  return request<RiskAssessment | null>(`/athletes/${athleteId}/risk`);
}

// Flusso "prova come atleta" (auto-onboarding dal browser, senza app Flutter):
// stesso Core API e stesso motore AI reali usati dall'app mobile, solo con
// un client web al posto di quello Flutter.
export interface CreateUserInput {
  email: string;
  authProviderId: string;
  fullName: string;
  role: "ATHLETE";
}

export function createUser(input: CreateUserInput) {
  return request<{ id: string }>("/users", { method: "POST", body: JSON.stringify(input) });
}

export interface AthleteProfileInput {
  primarySport: "TENNIS" | "PADEL" | "BOTH";
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "SEMI_PRO" | "PRO";
  weeklyAvailabilityDays: number;
  goalPrimary?: string;
}

export function upsertAthleteProfile(athleteId: string, input: AthleteProfileInput) {
  return request<unknown>(`/athletes/${athleteId}/profile`, { method: "POST", body: JSON.stringify(input) });
}

export function generateMacrocycle(athleteId: string) {
  return request<unknown>(`/athletes/${athleteId}/programming/macrocycle`, { method: "POST" });
}

export interface ExerciseInSession {
  id: string;
  orderIndex: number;
  targetSets: number | null;
  targetReps: number | null;
  targetRpe: number | null;
  exercise: { id: string; name: string; movementPattern: string };
}

export interface SessionDetail {
  id: string;
  scheduledDate: string;
  status: string;
  sessionFocus: string | null;
  exercises: ExerciseInSession[];
}

export interface Microcycle {
  id: string;
  weekStartDate: string;
  type: string;
  sessions: SessionDetail[];
}

export interface Mesocycle {
  id: string;
  blockType: string | null;
  startDate: string;
  endDate: string;
  targetQualities: string[];
  microcycles: Microcycle[];
}

export interface Macrocycle {
  id: string;
  modelType: string;
  startDate: string;
  endDate: string;
  mesocycles: Mesocycle[];
}

export function getMacrocycle(athleteId: string) {
  return request<Macrocycle>(`/athletes/${athleteId}/programming/macrocycle`);
}

export function getSession(athleteId: string, sessionId: string) {
  return request<SessionDetail>(`/athletes/${athleteId}/sessions/${sessionId}`);
}

export interface SessionFeedbackInput {
  sessionRpe?: number;
  energyLevel?: number;
  notes?: string;
  painArea?: "SPALLA" | "GOMITO" | "LOMBARE" | "GINOCCHIO" | "CAVIGLIA" | "ALTRO";
  painLevel?: number;
}

export interface SessionFeedbackResult {
  feedback: { id: string };
  autoregulation: { volume_adjustment_factor: number; explanation: string };
  adjustedNextSessionId: string | null;
}

export function submitSessionFeedback(athleteId: string, sessionId: string, input: SessionFeedbackInput) {
  return request<SessionFeedbackResult>(`/athletes/${athleteId}/sessions/${sessionId}/feedback`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}
