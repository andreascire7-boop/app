"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ApiError,
  getSession,
  submitSessionFeedback,
  type SessionDetail,
  type SessionFeedbackInput,
  type SessionFeedbackResult,
} from "@/lib/api";

const PAIN_AREA_LABEL: Record<string, string> = {
  SPALLA: "Spalla",
  GOMITO: "Gomito",
  LOMBARE: "Lombare",
  GINOCCHIO: "Ginocchio",
  CAVIGLIA: "Caviglia",
  ALTRO: "Altro",
};

// Dettaglio seduta + check-in post-allenamento (docs/product-design FASE 3 F4,
// FASE 6 S10): il feedback qui alimenta l'autoregolazione reale del motore AI,
// non un semplice salvataggio — se il volume va ridotto, la prossima seduta
// pianificata viene adattata subito, e lo si vede nella risposta.
export default function AthleteSessionPage() {
  const params = useParams<{ sessionId: string }>();
  const router = useRouter();
  const sessionId = params.sessionId;
  const [athleteId] = useState<string | null>(() =>
    typeof window === "undefined" ? null : localStorage.getItem("athleteId"),
  );

  const [session, setSession] = useState<SessionDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [sessionRpe, setSessionRpe] = useState(7);
  const [energyLevel, setEnergyLevel] = useState(7);
  const [notes, setNotes] = useState("");
  const [painArea, setPainArea] = useState("");
  const [painLevel, setPainLevel] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<SessionFeedbackResult | null>(null);

  useEffect(() => {
    if (!athleteId) {
      router.replace("/athlete/onboarding");
      return;
    }
    (async () => {
      try {
        setSession(await getSession(athleteId, sessionId));
      } catch (e) {
        setError(e instanceof ApiError ? e.message : "Errore imprevisto.");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [athleteId, sessionId, router]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!athleteId) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const feedbackResult = await submitSessionFeedback(athleteId, sessionId, {
        sessionRpe,
        energyLevel,
        notes: notes.trim() || undefined,
        painArea: painArea ? (painArea as SessionFeedbackInput["painArea"]) : undefined,
        painLevel: painArea ? painLevel : undefined,
      });
      setResult(feedbackResult);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Errore imprevisto.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!athleteId) return null;

  return (
    <main style={styles.main}>
      <Link href="/athlete/plan" style={styles.backLink}>
        ← Torna al piano
      </Link>

      {isLoading && <p style={styles.muted}>Caricamento…</p>}
      {error && <p style={styles.errorBox}>{error}</p>}

      {!isLoading && !error && session && (
        <>
          <h1 style={styles.title}>{session.sessionFocus ?? "Allenamento"}</h1>
          <p style={styles.muted}>{session.scheduledDate.substring(0, 10)}</p>

          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>Esercizi</h2>
            {session.exercises.map((ex) => (
              <div key={ex.id} style={styles.exerciseRow}>
                <strong>{ex.exercise.name}</strong>
                <span style={styles.muted}>
                  {ex.targetSets ?? "—"}×{ex.targetReps ?? "—"}
                  {ex.targetRpe ? ` @RPE ${ex.targetRpe}` : ""}
                </span>
              </div>
            ))}
          </section>

          {!result ? (
            <section style={styles.section}>
              <h2 style={styles.sectionTitle}>Come è andata?</h2>
              <form onSubmit={handleSubmit} style={styles.form}>
                <label style={styles.label}>RPE sessione (0-10): {sessionRpe}</label>
                <input
                  type="range"
                  min={0}
                  max={10}
                  value={sessionRpe}
                  onChange={(e) => setSessionRpe(Number(e.target.value))}
                />

                <label style={styles.label}>Energia (1-10): {energyLevel}</label>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={energyLevel}
                  onChange={(e) => setEnergyLevel(Number(e.target.value))}
                />

                <label style={styles.label} htmlFor="painArea">
                  Dolore (opzionale)
                </label>
                <select
                  id="painArea"
                  style={styles.input}
                  value={painArea}
                  onChange={(e) => setPainArea(e.target.value)}
                >
                  <option value="">Nessun dolore</option>
                  {Object.entries(PAIN_AREA_LABEL).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>

                {painArea && (
                  <>
                    <label style={styles.label}>Livello dolore (0-10): {painLevel}</label>
                    <input
                      type="range"
                      min={0}
                      max={10}
                      value={painLevel}
                      onChange={(e) => setPainLevel(Number(e.target.value))}
                    />
                  </>
                )}

                <label style={styles.label} htmlFor="notes">
                  Note (opzionale)
                </label>
                <textarea
                  id="notes"
                  style={styles.textarea}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />

                <button type="submit" style={styles.button} disabled={isSubmitting}>
                  {isSubmitting ? "Invio…" : "Invia feedback"}
                </button>
              </form>
            </section>
          ) : (
            <section style={styles.section}>
              <h2 style={styles.sectionTitle}>Risposta del motore AI</h2>
              <div style={styles.resultBox}>
                <p>{result.autoregulation.explanation}</p>
                {result.adjustedNextSessionId && (
                  <p style={styles.adjustedNote}>
                    La tua prossima seduta pianificata è stata adattata automaticamente in base a questo
                    feedback.
                  </p>
                )}
              </div>
              <Link href="/athlete/plan" style={styles.backToPlanButton}>
                Torna al piano
              </Link>
            </section>
          )}
        </>
      )}
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: { maxWidth: 720, margin: "0 auto", padding: "2rem 1.5rem" },
  backLink: { color: "#1F7A6C", fontSize: 14, marginBottom: "1.5rem", display: "inline-block" },
  title: { color: "#0B2E4F", margin: 0 },
  section: { marginTop: "1.5rem" },
  sectionTitle: { color: "#1F7A6C", fontSize: "1.1rem", marginBottom: "0.75rem" },
  exerciseRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "0.7rem 1rem",
    background: "#fff",
    border: "1px solid #EEF3F6",
    borderRadius: 10,
    marginBottom: "0.4rem",
  },
  form: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 13, color: "#5A6B76", marginTop: 8 },
  input: {
    padding: "0.6rem 0.8rem",
    borderRadius: 8,
    border: "1px solid #C9D3D8",
    fontSize: "1rem",
  },
  textarea: {
    padding: "0.6rem 0.8rem",
    borderRadius: 8,
    border: "1px solid #C9D3D8",
    fontSize: "1rem",
    minHeight: 70,
  },
  button: {
    marginTop: 16,
    padding: "0.7rem",
    borderRadius: 8,
    border: "none",
    background: "#0B2E4F",
    color: "#fff",
    fontSize: "1rem",
    cursor: "pointer",
  },
  muted: { color: "#5A6B76", fontSize: 13 },
  errorBox: { color: "#B3261E" },
  resultBox: {
    padding: "1rem",
    borderRadius: 10,
    border: "1px solid #EEF3F6",
    background: "#fff",
  },
  adjustedNote: { color: "#C77700", fontWeight: 600, marginTop: 8 },
  backToPlanButton: {
    display: "inline-block",
    marginTop: 16,
    color: "#1F7A6C",
    fontSize: 14,
  },
};
