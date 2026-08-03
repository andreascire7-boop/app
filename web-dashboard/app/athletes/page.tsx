"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  acceptLink,
  ApiError,
  type CoachAthleteEntry,
  getAthletesForCoach,
  getPendingLinks,
  type PendingLink,
} from "@/lib/api";
import { RISK_COLOR, RISK_LABEL } from "@/lib/risk";

// S24 (docs/product-design FASE 6): lista atleti ordinata di default per
// rischio (già ordinata lato Core API — F11), più le richieste di
// collegamento in attesa di approvazione.
export default function AthletesPage() {
  const router = useRouter();
  // Lazy initializer (not an effect) so reading localStorage never triggers a
  // second synchronous setState render.
  const [coachId] = useState<string | null>(() =>
    typeof window === "undefined" ? null : localStorage.getItem("coachId"),
  );
  const [athletes, setAthletes] = useState<CoachAthleteEntry[]>([]);
  const [pending, setPending] = useState<PendingLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  useEffect(() => {
    if (!coachId) router.replace("/");
  }, [coachId, router]);

  useEffect(() => {
    if (coachId) void load(coachId);
  }, [coachId]);

  async function load(id: string) {
    setIsLoading(true);
    setError(null);
    try {
      const [athletesResult, pendingResult] = await Promise.all([
        getAthletesForCoach(id),
        getPendingLinks(id),
      ]);
      setAthletes(athletesResult);
      setPending(pendingResult);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Errore imprevisto.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAccept(linkId: string) {
    if (!coachId) return;
    setAcceptingId(linkId);
    try {
      await acceptLink(coachId, linkId);
      await load(coachId);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Errore imprevisto.");
    } finally {
      setAcceptingId(null);
    }
  }

  if (!coachId) return null;

  return (
    <main style={styles.main}>
      <header style={styles.header}>
        <h1 style={styles.title}>I tuoi atleti</h1>
        <button
          style={styles.logoutButton}
          onClick={() => {
            localStorage.removeItem("coachId");
            router.push("/");
          }}
        >
          Esci
        </button>
      </header>

      {isLoading && <p style={styles.muted}>Caricamento…</p>}
      {error && <p style={styles.errorBox}>{error}</p>}

      {!isLoading && !error && (
        <>
          {pending.length > 0 && (
            <section style={styles.section}>
              <h2 style={styles.sectionTitle}>Richieste in attesa</h2>
              {pending.map((p) => (
                <div key={p.id} style={styles.row}>
                  <div>
                    <strong>{p.athlete.fullName}</strong>
                    <div style={styles.muted}>{p.athlete.email}</div>
                  </div>
                  <button
                    style={styles.acceptButton}
                    disabled={acceptingId === p.id}
                    onClick={() => handleAccept(p.id)}
                  >
                    {acceptingId === p.id ? "…" : "Accetta"}
                  </button>
                </div>
              ))}
            </section>
          )}

          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>Atleti collegati (ordinati per rischio)</h2>
            {athletes.length === 0 ? (
              <p style={styles.muted}>
                Nessun atleta ancora collegato. Condividi il tuo ID coach con un atleta per iniziare.
              </p>
            ) : (
              athletes.map(({ athlete, latestRisk }) => (
                <Link key={athlete.id} href={`/athletes/${athlete.id}`} style={{ ...styles.row, ...styles.rowLink }}>
                  <div>
                    <strong>{athlete.fullName}</strong>
                    <div style={styles.muted}>{athlete.email}</div>
                  </div>
                  <span
                    style={{
                      ...styles.badge,
                      background: latestRisk ? `${RISK_COLOR[latestRisk.riskLevel]}1A` : "#EEF3F6",
                      color: latestRisk ? RISK_COLOR[latestRisk.riskLevel] : "#5A6B76",
                    }}
                  >
                    {latestRisk ? RISK_LABEL[latestRisk.riskLevel] : "Nessuna valutazione"}
                  </span>
                </Link>
              ))
            )}
          </section>
        </>
      )}
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: { maxWidth: 720, margin: "0 auto", padding: "2rem 1.5rem" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" },
  title: { color: "#0B2E4F", margin: 0 },
  logoutButton: {
    background: "none",
    border: "1px solid #C9D3D8",
    borderRadius: 8,
    padding: "0.4rem 0.8rem",
    cursor: "pointer",
    color: "#5A6B76",
  },
  section: { marginBottom: "2rem" },
  sectionTitle: { color: "#1F7A6C", fontSize: "1.1rem", marginBottom: "0.75rem" },
  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0.9rem 1rem",
    background: "#fff",
    border: "1px solid #EEF3F6",
    borderRadius: 10,
    marginBottom: "0.5rem",
  },
  rowLink: { textDecoration: "none", color: "inherit", cursor: "pointer" },
  muted: { color: "#5A6B76", fontSize: 13 },
  errorBox: { color: "#B3261E" },
  badge: { padding: "0.3rem 0.7rem", borderRadius: 999, fontSize: 13, fontWeight: 600 },
  acceptButton: {
    background: "#0B2E4F",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "0.4rem 0.9rem",
    cursor: "pointer",
  },
};
