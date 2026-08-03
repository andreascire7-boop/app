"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Punto d'ingresso del flusso "prova come atleta": se esiste già un athleteId
// (onboarding già fatto in questo browser) salta dritto al piano, altrimenti
// manda all'onboarding. Stesso backend/motore AI dell'app mobile — solo un
// client web al posto di quello Flutter, per poterla provare senza SDK.
export default function AthleteEntryPage() {
  const router = useRouter();
  const [athleteId] = useState<string | null>(() =>
    typeof window === "undefined" ? null : localStorage.getItem("athleteId"),
  );

  useEffect(() => {
    router.replace(athleteId ? "/athlete/plan" : "/athlete/onboarding");
  }, [athleteId, router]);

  return null;
}
