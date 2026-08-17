export const site = {
  name: "Andrea Scirè",
  tagline: "Strength & Conditioning Coach & Personal Trainer",
  niche: "Preparazione fisica per sport di racchetta (tennis, padel) e massaggio sportivo",
  city: "Ficarazzi (PA)",
  areaServed: "Palermo e provincia · coaching online in tutta Italia",
  phoneDisplay: "+39 348 533 2868",
  phoneWaId: "393485332868",
  email: "andreascire7@gmail.com",
  instagram: "https://instagram.com/sc_andreascire",
  instagramHandle: "@sc_andreascire",
  instagramProject: "https://instagram.com/racketperformance",
  instagramProjectHandle: "@racketperformance",
} as const;

export function waLink(message: string) {
  return `https://wa.me/${site.phoneWaId}?text=${encodeURIComponent(message)}`;
}
