"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ApiError,
  type AthleteSession,
  getAthleteRisk,
  getAthleteSessions,
  type RiskAssessment,
} from "@/lib/api";
import { RISK_COLOR, RISK_LABEL } from "@/lib/risk";

const SESSION_STATUS_LABEL: Record<string, string> = {
  PLANNED: "Pianificata",
  COMPLETED: "Completata",
  SKIPPED: "Saltata",
  MODIFIED: "Adattata",
};

// S25 (docs/product-design FASE 6): drill-down atleta — sedute pianificate e
// ultima valutazione di rischio, in sola lettura in questa v1 (nessun override
// del piano ancora, previsto per una milestone successiva).
export default function AthleteDetailPage() {
  const params = useParams<{ athleteId: string }>();
  const athleteId = params.athleteId;

  const [sessions, setSessions] = useState<AthleteSession[]>([]);
  const [risk, setRisk] = useState<RiskAssessment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!athleteId) return;
    (async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [sessionsResult, riskResult] = await Promise.all([
          getAthleteSessions(athleteId),
          getAthleteRisk(athleteId),
        ]);
        setSessions(sessionsResult);
        setRisk(riskResult);
      } catch (e) {
        setError(e instanceof ApiError ? e.message : "Errore imprevisto.");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [athleteId]);

  return (
    <main style={styles.main}>
      <Link href="/athletes" style={styles.backLink}>
        ← Torna alla lista
      </Link>

      {isLoading && <p style={styles.muted}>Caricamento…</p>}
      {error && <p style={styles.errorBox}>{error}</p>}

      {!isLoading && !error && (
        <>
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>Rischio infortuni</h2>
            {risk ? (
              <div
                style={{
                  ...styles.riskBox,
                  borderColor: RISK_COLOR[risk.riskLevel],
                  background: `${RISK_COLOR[risk.riskLevel]}12`,
                }}
              >
                <strong style={{ color: RISK_COLOR[risk.riskLevel] }}>{RISK_LABEL[risk.riskLevel]}</strong>
                <ul style={styles.factorsList}>
                  {risk.contributingFactors.map((factor, i) => (
                    <li key={i}>{factor}</li>
                  ))}
                </ul>
                {risk.recommendationText && <p style={styles.muted}>{risk.recommendationText}</p>}
              </div>
            ) : (
              <p style={styles.muted}>Nessuna valutazione disponibile.</p>
            )}
          </section>

          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>Sedute ({sessions.length})</h2>
            {sessions.length === 0 ? (
              <p style={styles.muted}>Nessuna seduta pianificata.</p>
            ) : (
              sessions.map((session) => (
                <div key={session.id} style={styles.row}>
                  <div>
                    <strong>{session.sessionFocus ?? "Allenamento"}</strong>
                    <div style={styles.muted}>{session.scheduledDate.substring(0, 10)}</div>
                  </div>
                  <span style={styles.badge}>{SESSION_STATUS_LABEL[session.status] ?? session.status}</span>
                </div>
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
  backLink: { color: "#1F7A6C", fontSize: 14, marginBottom: "1.5rem", display: "inline-block" },
  section: { marginBottom: "2rem" },
  sectionTitle: { color: "#1F7A6C", fontSize: "1.1rem", marginBottom: "0.75rem" },
  riskBox: { padding: "1rem", borderRadius: 10, border: "1px solid" },
  factorsList: { margin: "0.5rem 0", paddingLeft: "1.2rem", color: "#5A6B76", fontSize: 13 },
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
  muted: { color: "#5A6B76", fontSize: 13 },
  errorBox: { color: "#B3261E" },
  badge: {
    padding: "0.3rem 0.7rem",
    borderRadius: 999,
    fontSize: 13,
    fontWeight: 600,
    background: "#EEF3F6",
    color: "#5A6B76",
  },
};
