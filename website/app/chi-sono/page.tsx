import type { Metadata } from "next";
import ChiSonoView from "./ChiSonoView";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: `Chi sono — ${site.name}, S&C Coach & Personal Trainer`,
  description: `Percorso, certificazioni (Istituto ATS, FIDAL, Eleiko, IUSCA, FitnessWay) ed esperienza di ${site.name}: S&C coach specializzato in sport di racchetta e massaggio sportivo, ${site.city}.`,
  alternates: { canonical: "/chi-sono" },
};

export default function Page() {
  return <ChiSonoView />;
}
