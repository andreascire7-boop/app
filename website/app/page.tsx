import type { Metadata } from "next";
import HomeView from "./HomeView";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: `${site.name} — S&C Coach & Massaggiatore Sportivo a ${site.city}`,
  description: `Programmi di forza e condizionamento su misura e massaggio sportivo certificato con ${site.name}: preparazione fisica per tennis e padel, ${site.city} e coaching online in tutta Italia.`,
  alternates: { canonical: "/" },
};

export default function Page() {
  return <HomeView />;
}
