"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ApiError, getMacrocycle, type Macrocycle, type SessionDetail } from "@/lib/api";

const MODEL_LABEL: Record<string, string> = {
  LINEARE: "Lineare",
  ONDULATO: "Ondulato",
  A_BLOCCHI: "A blocchi",
};

const SESSION_STATUS_LABEL: Record<string, string> = {
  PLANNED: "Pianificata",
  COMPLETED: "Completata",
  SKIPPED: "Saltata",
  MODIFIED: "Adattata",
};

const SESSION_STATUS_COLOR: Record<string, string> = {
  PLANNED: "#5A6B76",
  COMPLETED: "#1F7A6C",
  SKIPPED: "#B3261E",
  MODIFIED: "#C77700",
};

// Mostra il macrociclo generato dal motore AI reale (stesso endpoint della tab
// "Programma" dell'app mobile, S7) e la lista sedute in ordine cronologico,
// da qui si entra nel dettaglio per dare il feedback post-seduta.
export default function AthletePlanPage() {
  const router = useRouter();
  const [athleteId] = useState<string | null>(() =>
    typeof window === "undefined" ? null : localStorage.getItem("athleteId"),
  );
  const [macrocycle, setMacrocycle] = useState<Macrocycle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!athleteId) {
      router.replace("/athlete/onboarding");
      return;
    }
    (async () => {
      try {
        setMacrocycle(await getMacrocycle(athleteId));
      } catch (e) {
        setError(e instanceof ApiError ? e.message : "Errore imprevisto.");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [athleteId, router]);

  if (!athleteId) return null;

  const sessions: SessionDetail[] = (macrocycle?.mesocycles ?? [])
    .flatMap((meso) => meso.microcycles)
    .flatMap((micro) => micro.sessions)
    .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());

  return (
    <main style={styles.main}>
      <header style={styles.header}>
        <h1 style={styles.title}>Il tuo piano</h1>
        <button
          style={styles.logoutButton}
          onClick={() => {
            localStorage.removeItem("athleteId");
            router.push("/athlete/onboarding");
          }}
        >
          Nuovo profilo
        </button>
      </header>

      {isLoading && <p style={styles.muted}>Caricamento…</p>}
      {error && <p style={styles.errorBox}>{error}</p>}

      {!isLoading && !error && macrocycle && (
        <>
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>Macrociclo</h2>
            <div style={styles.macroBox}>
              <strong>{MODEL_LABEL[macrocycle.modelType] ?? macrocycle.modelType}</strong>
              <div style={styles.muted}>
                {macrocycle.startDate.substring(0, 10)} → {macrocycle.endDate.substring(0, 10)}
              </div>
              {macrocycle.mesocycles.map((meso) => (
                <div key={meso.id} style={styles.mesoRow}>
                  <span style={styles.mesoBlock}>{meso.blockType ?? "—"}</span>
                  <span style={styles.muted}>
                    {meso.startDate.substring(0, 10)} → {meso.endDate.substring(0, 10)}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>Sedute ({sessions.length})</h2>
            {sessions.length === 0 ? (
              <p style={styles.muted}>Nessuna seduta pianificata.</p>
            ) : (
              sessions.map((session) => (
                <Link key={session.id} href={`/athlete/sessions/${session.id}`} style={styles.row}>
                  <div>
                    <strong>{session.sessionFocus ?? "Allenamento"}</strong>
                    <div style={styles.muted}>{session.scheduledDate.substring(0, 10)}</div>
                  </div>
                  <span
                    style={{
                      ...styles.badge,
                      color: SESSION_STATUS_COLOR[session.status] ?? "#5A6B76",
                      background: `${SESSION_STATUS_COLOR[session.status] ?? "#5A6B76"}1A`,
                    }}
                  >
                    {SESSION_STATUS_LABEL[session.status] ?? session.status}
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
  macroBox: {
    padding: "1rem",
    borderRadius: 10,
    border: "1px solid #EEF3F6",
    background: "#fff",
  },
  mesoRow: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: 8,
    paddingTop: 8,
    borderTop: "1px solid #EEF3F6",
  },
  mesoBlock: { color: "#0B2E4F", fontWeight: 600, fontSize: 13 },
  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0.9rem 1rem",
    background: "#fff",
    border: "1px solid #EEF3F6",
    borderRadius: 10,
    marginBottom: "0.5rem",
    textDecoration: "none",
    color: "inherit",
  },
  muted: { color: "#5A6B76", fontSize: 13 },
  errorBox: { color: "#B3261E" },
  badge: { padding: "0.3rem 0.7rem", borderRadius: 999, fontSize: 13, fontWeight: 600 },
};
