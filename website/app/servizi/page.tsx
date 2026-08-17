import type { Metadata } from "next";
import ServiziView from "./ServiziView";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: `Servizi e prezzi — S&C, schede, programmi e massaggio sportivo | ${site.name}`,
  description: `Valutazione iniziale, schede personalizzate, online coaching, preparazione fisica per sport di racchetta e massaggio sportivo (pre/post gara, decontratturante) con ${site.name} a ${site.city}.`,
  alternates: { canonical: "/servizi" },
};

export default function Page() {
  return <ServiziView />;
}
