"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// S23 (docs/product-design FASE 6): login/setup organizzazione. Placeholder di
// sviluppo — inserisci l'id del tuo utente Coach (creato via POST /users con
// role: "COACH" sul Core API) finché l'auth reale (Auth0/WorkOS, FASE 4 §4.4)
// non è collegata.
export default function CoachLoginPage() {
  const router = useRouter();
  const [coachId, setCoachId] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!coachId.trim()) {
      setError("Inserisci l'ID del coach.");
      return;
    }
    localStorage.setItem("coachId", coachId.trim());
    router.push("/athletes");
  }

  return (
    <main style={styles.main}>
      <div style={styles.card}>
        <h1 style={styles.title}>S&amp;C Intelligence</h1>
        <p style={styles.subtitle}>Dashboard Coach</p>
        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label} htmlFor="coachId">
            ID Coach
          </label>
          <input
            id="coachId"
            style={styles.input}
            value={coachId}
            onChange={(e) => setCoachId(e.target.value)}
            placeholder="uuid dell'utente coach"
          />
          {error && <p style={styles.error}>{error}</p>}
          <button type="submit" style={styles.button}>
            Entra
          </button>
        </form>
        <Link href="/athlete" style={styles.athleteLink}>
          Prova l&apos;app come atleta →
        </Link>
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#EEF3F6",
  },
  card: {
    background: "#fff",
    padding: "2.5rem",
    borderRadius: 12,
    boxShadow: "0 4px 20px rgba(11,46,79,0.08)",
    width: "min(90vw, 380px)",
  },
  title: { color: "#0B2E4F", margin: 0, fontSize: "1.5rem" },
  subtitle: { color: "#5A6B76", marginTop: 4, marginBottom: 24 },
  form: { display: "flex", flexDirection: "column", gap: 8 },
  label: { fontSize: 13, color: "#5A6B76" },
  input: {
    padding: "0.6rem 0.8rem",
    borderRadius: 8,
    border: "1px solid #C9D3D8",
    fontSize: "1rem",
  },
  button: {
    marginTop: 12,
    padding: "0.7rem",
    borderRadius: 8,
    border: "none",
    background: "#0B2E4F",
    color: "#fff",
    fontSize: "1rem",
    cursor: "pointer",
  },
  error: { color: "#B3261E", fontSize: 13, margin: 0 },
  athleteLink: {
    display: "block",
    textAlign: "center",
    marginTop: 20,
    color: "#1F7A6C",
    fontSize: 13,
    textDecoration: "none",
  },
};
