import type { Locale } from "./i18n";

export type Service = {
  slug: string;
  name: string;
  description: string;
  duration?: string;
  price: string;
  highlight?: boolean;
};

export type ServiceCategory = {
  slug: string;
  title: string;
  intro: string;
  services: Service[];
};

type ServiceBase = { slug: string; price: string; highlight?: boolean };
type CategoryBase = { slug: string; services: ServiceBase[] };

const categoriesBase: CategoryBase[] = [
  {
    slug: "sc-coaching",
    services: [
      { slug: "valutazione-iniziale", price: "€ 40" },
      { slug: "scheda-personalizzata", price: "€ 60", highlight: true },
      { slug: "online-coaching", price: "€ 90" },
      { slug: "personal-training", price: "€ 35" },
      { slug: "racket-performance", price: "€ 100" },
    ],
  },
  {
    slug: "massaggio-sportivo",
    services: [
      { slug: "massaggio-pre-gara", price: "€ 35" },
      { slug: "massaggio-post-gara", price: "€ 45", highlight: true },
      { slug: "massaggio-decontratturante", price: "€ 50" },
      { slug: "pacchetto-5-sedute", price: "€ 200" },
    ],
  },
];

type ServiceText = { name: string; description: string; duration?: string };

const categoryText: Record<Locale, Record<string, { title: string; intro: string }>> = {
  it: {
    "sc-coaching": {
      title: "Strength & Conditioning",
      intro:
        "Programmazione basata su periodizzazione, gestione del carico e autoregolazione: non schede standard, ma percorsi costruiti sul tuo livello, i tuoi obiettivi e — se sei un atleta di racchetta — sul tuo calendario gare.",
    },
    "massaggio-sportivo": {
      title: "Massaggio Sportivo",
      intro:
        "Massaggio sportivo certificato (Istituto ATS), pensato per accompagnare la prestazione: attivante prima della gara, decontratturante dopo lo sforzo.",
    },
  },
  en: {
    "sc-coaching": {
      title: "Strength & Conditioning",
      intro:
        "Programming built on periodization, load management and autoregulation: not off-the-shelf plans, but a path built around your level, your goals and — for racket-sport athletes — your competition calendar.",
    },
    "massaggio-sportivo": {
      title: "Sports Massage",
      intro:
        "Certified sports massage (Istituto ATS), designed to support performance: activating before competition, decontracting after effort.",
    },
  },
};

const serviceText: Record<Locale, Record<string, ServiceText>> = {
  it: {
    "valutazione-iniziale": {
      name: "Valutazione iniziale",
      description:
        "Analisi del movimento, storico infortuni, obiettivi e disponibilità di attrezzatura. Base di partenza per ogni percorso, in presenza o online.",
      duration: "60 min",
    },
    "scheda-personalizzata": {
      name: "Scheda di allenamento personalizzata",
      description:
        "Programma mensile di forza/ipertrofia costruito su misura, con progressione dei carichi e aggiornamento a fine ciclo.",
      duration: "aggiornamento mensile",
    },
    "online-coaching": {
      name: "Online coaching",
      description:
        "Programmazione e coaching a distanza con monitoraggio continuo: video-check tecnica, aggiustamenti settimanali, supporto diretto.",
      duration: "abbonamento mensile",
    },
    "personal-training": {
      name: "Personal training in presenza",
      description:
        "Sedute individuali in sala pesi a Ficarazzi e zone limitrofe (Santa Flavia, Palermo), con esecuzione seguita in tempo reale.",
      duration: "60 min",
    },
    "racket-performance": {
      name: "Preparazione fisica sport di racchetta",
      description:
        "Percorso S&C specifico per tennis e padel: prevenzione infortuni, gestione delle asimmetrie, potenza e velocità, periodizzato sul calendario gare.",
      duration: "programma mensile",
    },
    "massaggio-pre-gara": {
      name: "Massaggio pre-gara — attivante",
      description:
        "Manualità rapida e stimolante per preparare i tessuti allo sforzo prima di allenamento o competizione.",
      duration: "30 min",
    },
    "massaggio-post-gara": {
      name: "Massaggio post-gara — decontratturante",
      description:
        "Lavoro defaticante e decontratturante per favorire il recupero muscolare dopo gara o sessione intensa.",
      duration: "45 min",
    },
    "massaggio-decontratturante": {
      name: "Massaggio decontratturante",
      description:
        "Trattamento mirato su zone in tensione cronica (schiena, collo, arti) per chi allena con costanza.",
      duration: "60 min",
    },
    "pacchetto-5-sedute": {
      name: "Pacchetto 5 sedute",
      description: "Cinque sedute di massaggio sportivo a scelta, da programmare nel corso della stagione.",
    },
  },
  en: {
    "valutazione-iniziale": {
      name: "Initial assessment",
      description:
        "Movement analysis, injury history, goals and available equipment. The starting point for every program, in person or online.",
      duration: "60 min",
    },
    "scheda-personalizzata": {
      name: "Personalized training plan",
      description:
        "Custom-built monthly strength/hypertrophy program, with load progression and an update at the end of each cycle.",
      duration: "monthly update",
    },
    "online-coaching": {
      name: "Online coaching",
      description:
        "Remote programming and coaching with ongoing monitoring: technique video-checks, weekly adjustments, direct support.",
      duration: "monthly subscription",
    },
    "personal-training": {
      name: "In-person personal training",
      description:
        "One-on-one weight-room sessions in Ficarazzi and nearby areas (Santa Flavia, Palermo), with real-time coaching on execution.",
      duration: "60 min",
    },
    "racket-performance": {
      name: "Racket-sport physical preparation",
      description:
        "S&C program specific to tennis and padel: injury prevention, asymmetry management, power and speed, periodized on your competition calendar.",
      duration: "monthly program",
    },
    "massaggio-pre-gara": {
      name: "Pre-competition massage — activating",
      description:
        "Quick, stimulating technique to prepare the tissues for effort before training or competition.",
      duration: "30 min",
    },
    "massaggio-post-gara": {
      name: "Post-competition massage — decontracting",
      description:
        "Recovery-focused, decontracting work to support muscle recovery after competition or an intense session.",
      duration: "45 min",
    },
    "massaggio-decontratturante": {
      name: "Decontracting massage",
      description:
        "Targeted treatment on chronically tense areas (back, neck, limbs) for those who train consistently.",
      duration: "60 min",
    },
    "pacchetto-5-sedute": {
      name: "5-session package",
      description: "Five sports massage sessions of your choice, to schedule over the season.",
    },
  },
};

export function getServiceCategories(locale: Locale): ServiceCategory[] {
  return categoriesBase.map((category) => ({
    slug: category.slug,
    ...categoryText[locale][category.slug],
    services: category.services.map((service) => ({
      slug: service.slug,
      price: service.price,
      highlight: service.highlight,
      ...serviceText[locale][service.slug],
    })),
  }));
}

export function findService(locale: Locale, slug: string): Service | undefined {
  for (const category of getServiceCategories(locale)) {
    const service = category.services.find((s) => s.slug === slug);
    if (service) return service;
  }
  return undefined;
}
