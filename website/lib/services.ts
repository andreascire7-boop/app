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
      { slug: "scheda-powerlifting", price: "€ 20" },
      { slug: "scheda-weightlifting", price: "€ 30" },
      { slug: "scheda-hybrid", price: "€ 40", highlight: true },
      { slug: "scheda-ipertrofia", price: "€ 15" },
      { slug: "off-season-velocita", price: "€ 25" },
      { slug: "mesociclo-agilita", price: "€ 10" },
      { slug: "salto-verticale", price: "€ 15" },
      { slug: "programma-resistenza", price: "€ 20" },
      { slug: "coaching-personalizzato", price: "€ 70" },
    ],
  },
  {
    slug: "massaggio-sportivo",
    services: [
      { slug: "massaggio-pre-gara", price: "€ 25" },
      { slug: "massaggio-post-gara", price: "€ 25", highlight: true },
      { slug: "massaggio-decontratturante", price: "€ 30" },
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
    "scheda-powerlifting": {
      name: "Scheda Powerlifting",
      description:
        "Programma centrato sulle tre alzate di gara (squat, panca, stacco): intensità e volume gestiti in cicli su un massimale di riferimento, con l'obiettivo di far crescere la forza massima specifica.",
      duration: "ciclo di allenamento",
    },
    "scheda-weightlifting": {
      name: "Scheda Weightlifting",
      description:
        "Programma incentrato su strappo, slancio e i loro derivati (tirate, hang, varianti power): tecnica, posizioni di ricezione e gestione di volume/intensità per sviluppare potenza ed espressione esplosiva di forza.",
      duration: "ciclo di allenamento",
    },
    "scheda-hybrid": {
      name: "Scheda Hybrid",
      description:
        "Programma che allena in parallelo più zone della curva forza-velocità — forza massima, potenza e ipertrofia — alternando metodi (effort massimale, dinamico, ripetuto) per sviluppare qualità diverse senza sacrificarne una per l'altra.",
      duration: "ciclo di allenamento",
    },
    "scheda-ipertrofia": {
      name: "Scheda Ipertrofia",
      description:
        "Programma orientato alla crescita muscolare: intensità nel range 67-85% del massimale, 6-12 ripetizioni per serie, volume come leva principale e progressione del carico ciclo dopo ciclo.",
      duration: "ciclo di allenamento",
    },
    "off-season-velocita": {
      name: "Programma Off Season — 12 settimane velocità",
      description:
        "Blocco di 12 settimane nel periodo di preparazione per costruire la velocità dalle fondamenta: base di forza e potenza, meccanica di accelerazione e, in chiusura, lavoro più specifico su sprint e capacità di ripeterli.",
      duration: "12 settimane",
    },
    "mesociclo-agilita": {
      name: "Mesociclo 4 settimane — Agilità",
      description:
        "Mesociclo dedicato all'agilità: meccanica di decelerazione e cambio di direzione nelle prime settimane, poi drill reattivi a stimolo per allenare anche la componente percettivo-decisionale, non solo quella fisica.",
      duration: "4 settimane",
    },
    "salto-verticale": {
      name: "Programma Salto Verticale",
      description:
        "Sviluppo della potenza degli arti inferiori attraverso pliometria progressiva (dal basso all'alto impatto) e lavoro di forza esplosiva, con attenzione al tempo di contatto a terra e al dosaggio dei carichi articolari.",
      duration: "ciclo di allenamento",
    },
    "programma-resistenza": {
      name: "Programma Resistenza",
      description:
        "Condizionamento costruito sul sistema energetico che serve davvero: base aerobica, lavoro a soglia o intervalli ad alta intensità, con rapporti lavoro:recupero calibrati sull'obiettivo e sullo sport.",
      duration: "ciclo di allenamento",
    },
    "coaching-personalizzato": {
      name: "Coaching Personalizzato",
      description:
        "Percorso su misura dalla needs analysis in poi: programmazione individuale, autoregolazione (RPE/RIR) seduta per seduta e aggiustamenti continui in base a risposta, recupero e fase della stagione.",
      duration: "percorso continuativo",
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
    "scheda-powerlifting": {
      name: "Powerlifting Plan",
      description:
        "Program built around the three competition lifts (squat, bench, deadlift): intensity and volume managed in cycles off a reference max, aimed at growing sport-specific maximal strength.",
      duration: "training cycle",
    },
    "scheda-weightlifting": {
      name: "Weightlifting Plan",
      description:
        "Program centered on the snatch, the clean & jerk and their derivatives (pulls, hangs, power variants): technique, receiving positions and volume/intensity management to develop power and explosive strength expression.",
      duration: "training cycle",
    },
    "scheda-hybrid": {
      name: "Hybrid Plan",
      description:
        "A program that trains several zones of the force-velocity curve in parallel — max strength, power and hypertrophy — alternating methods (max-effort, dynamic-effort, repeated-effort) to build multiple qualities without trading one off against another.",
      duration: "training cycle",
    },
    "scheda-ipertrofia": {
      name: "Hypertrophy Plan",
      description:
        "Program aimed at muscle growth: intensity in the 67-85% of max range, 6-12 reps per set, volume as the main driver, with load progression cycle after cycle.",
      duration: "training cycle",
    },
    "off-season-velocita": {
      name: "Off-Season Program — 12 Weeks Speed",
      description:
        "A 12-week off-season block that builds speed from the ground up: a base of strength and power, acceleration mechanics, and, toward the end, more specific sprint and repeated-sprint work.",
      duration: "12 weeks",
    },
    "mesociclo-agilita": {
      name: "4-Week Mesocycle — Agility",
      description:
        "A mesocycle dedicated to agility: deceleration and change-of-direction mechanics in the early weeks, then stimulus-driven reactive drills to train the perceptual-decision side, not just the physical one.",
      duration: "4 weeks",
    },
    "salto-verticale": {
      name: "Vertical Jump Program",
      description:
        "Lower-body power development through progressive plyometrics (low to high impact) and explosive-strength work, with attention to ground-contact time and dosing joint loading.",
      duration: "training cycle",
    },
    "programma-resistenza": {
      name: "Endurance Program",
      description:
        "Conditioning built on the energy system that actually matters for you: aerobic base, threshold work or high-intensity intervals, with work:rest ratios calibrated to the goal and the sport.",
      duration: "training cycle",
    },
    "coaching-personalizzato": {
      name: "Personalized Coaching",
      description:
        "A tailor-made path starting from a proper needs analysis: individual programming, session-by-session autoregulation (RPE/RIR) and ongoing adjustments based on response, recovery and the phase of the season.",
      duration: "ongoing coaching",
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
