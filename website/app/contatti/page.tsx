import type { Metadata } from "next";
import ContattiView from "./ContattiView";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: `Contatti — ${site.name}`,
  description: `Scrivi a ${site.name} su WhatsApp (${site.phoneDisplay}) o via email per una valutazione iniziale, informazioni sui programmi S&C o per prenotare un massaggio sportivo a ${site.city}.`,
  alternates: { canonical: "/contatti" },
};

export default function Page() {
  return <ContattiView />;
}
