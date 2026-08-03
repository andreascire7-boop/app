"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError, createUser, generateMacrocycle, upsertAthleteProfile } from "@/lib/api";

// Onboarding minimo (docs/product-design FASE 3, F1): crea l'utente + profilo
// atleta e attiva subito la generazione del primo macrociclo tramite il
// motore AI reale — stessi endpoint del Core API usati dall'app mobile.
export default function AthleteOnboardingPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [primarySport, setPrimarySport] = useState<"TENNIS" | "PADEL" | "BOTH">("TENNIS");
  const [level, setLevel] = useState<"BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "SEMI_PRO" | "PRO">(
    "INTERMEDIATE",
  );
  const [weeklyAvailabilityDays, setWeeklyAvailabilityDays] = useState(3);
  const [goalPrimary, setGoalPrimary] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!fullName.trim() || !email.trim()) {
      setError("Nome ed email sono obbligatori.");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const user = await createUser({
        email: email.trim(),
        authProviderId: `web-demo-${Date.now()}`,
        fullName: fullName.trim(),
        role: "ATHLETE",
      });
      await upsertAthleteProfile(user.id, {
        primarySport,
        level,
        weeklyAvailabilityDays,
        goalPrimary: goalPrimary.trim() || undefined,
      });
      await generateMacrocycle(user.id);
      localStorage.setItem("athleteId", user.id);
      router.push("/athlete/plan");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Errore imprevisto.");
      setIsSubmitting(false);
    }
  }

  return (
    <main style={styles.main}>
      <div style={styles.card}>
        <h1 style={styles.title}>S&amp;C Intelligence</h1>
        <p style={styles.subtitle}>Prova come atleta — crea il tuo profilo e ricevi subito un piano</p>
        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label} htmlFor="fullName">
            Nome
          </label>
          <input
            id="fullName"
            style={styles.input}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Il tuo nome"
          />

          <label style={styles.label} htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            style={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@esempio.com"
          />

          <label style={styles.label} htmlFor="sport">
            Sport
          </label>
          <select
            id="sport"
            style={styles.input}
            value={primarySport}
            onChange={(e) => setPrimarySport(e.target.value as typeof primarySport)}
          >
            <option value="TENNIS">Tennis</option>
            <option value="PADEL">Padel</option>
            <option value="BOTH">Entrambi</option>
          </select>

          <label style={styles.label} htmlFor="level">
            Livello
          </label>
          <select
            id="level"
            style={styles.input}
            value={level}
            onChange={(e) => setLevel(e.target.value as typeof level)}
          >
            <option value="BEGINNER">Principiante</option>
            <option value="INTERMEDIATE">Intermedio</option>
            <option value="ADVANCED">Avanzato</option>
            <option value="SEMI_PRO">Semi-pro</option>
            <option value="PRO">Pro</option>
          </select>

          <label style={styles.label} htmlFor="days">
            Giorni disponibili a settimana per il S&amp;C
          </label>
          <input
            id="days"
            type="number"
            min={0}
            max={7}
            style={styles.input}
            value={weeklyAvailabilityDays}
            onChange={(e) => setWeeklyAvailabilityDays(Number(e.target.value))}
          />

          <label style={styles.label} htmlFor="goal">
            Obiettivo principale (opzionale)
          </label>
          <input
            id="goal"
            style={styles.input}
            value={goalPrimary}
            onChange={(e) => setGoalPrimary(e.target.value)}
            placeholder="es. prevenire infortuni alla spalla"
          />

          {error && <p style={styles.error}>{error}</p>}
          <button type="submit" style={styles.button} disabled={isSubmitting}>
            {isSubmitting ? "Genero il tuo piano…" : "Genera il mio piano"}
          </button>
        </form>
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
    padding: "2rem 1rem",
  },
  card: {
    background: "#fff",
    padding: "2.5rem",
    borderRadius: 12,
    boxShadow: "0 4px 20px rgba(11,46,79,0.08)",
    width: "min(90vw, 440px)",
  },
  title: { color: "#0B2E4F", margin: 0, fontSize: "1.5rem" },
  subtitle: { color: "#5A6B76", marginTop: 4, marginBottom: 24, fontSize: 14 },
  form: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 13, color: "#5A6B76", marginTop: 8 },
  input: {
    padding: "0.6rem 0.8rem",
    borderRadius: 8,
    border: "1px solid #C9D3D8",
    fontSize: "1rem",
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
  error: { color: "#B3261E", fontSize: 13, margin: 0 },
};
