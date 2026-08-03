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
