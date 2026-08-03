// Seeds the exercise catalog (docs/product-design FASE 5, `exercise_library`).
// Selection and risk tags grounded only in the scienze-motorie-sc skill
// (forza-potenza.md — exercise selection/order; tennis-sport-specifico.md — kinetic
// chain and typical injury areas; prevenzione-rehab-prehab.md — prehab patterns).
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const exercises = [
  {
    name: 'Back squat',
    movementPattern: 'squat',
    primaryMuscleGroups: ['quadricipiti', 'glutei'],
    bodyAreaRiskTags: ['lombare', 'ginocchio'],
    equipmentRequired: 'bilanciere, rack',
    difficultyLevel: 'intermediate',
  },
  {
    name: 'Stacco rumeno (Romanian deadlift)',
    movementPattern: 'hip_hinge',
    primaryMuscleGroups: ['ischiocrurali', 'glutei'],
    bodyAreaRiskTags: ['lombare'],
    equipmentRequired: 'bilanciere',
    difficultyLevel: 'intermediate',
  },
  {
    name: 'Affondo laterale',
    movementPattern: 'lunge_monolaterale',
    primaryMuscleGroups: ['quadricipiti', 'adduttori', 'glutei'],
    bodyAreaRiskTags: ['ginocchio', 'caviglia'],
    equipmentRequired: 'manubri (opzionali)',
    difficultyLevel: 'beginner',
  },
  {
    name: 'Panca piana',
    movementPattern: 'spinta_orizzontale',
    primaryMuscleGroups: ['pettorali', 'tricipiti', 'deltoidi'],
    bodyAreaRiskTags: ['spalla', 'gomito'],
    equipmentRequired: 'bilanciere, panca',
    difficultyLevel: 'intermediate',
  },
  {
    name: 'Trazioni alla sbarra',
    movementPattern: 'trazione_verticale',
    primaryMuscleGroups: ['dorsali', 'bicipiti'],
    bodyAreaRiskTags: ['spalla'],
    equipmentRequired: 'sbarra',
    difficultyLevel: 'intermediate',
  },
  {
    name: 'Push press',
    movementPattern: 'spinta_verticale_esplosiva',
    primaryMuscleGroups: ['deltoidi', 'tricipiti', 'gambe'],
    bodyAreaRiskTags: ['spalla', 'lombare'],
    equipmentRequired: 'bilanciere',
    difficultyLevel: 'advanced',
  },
  {
    name: 'Lancio rotazionale con palla medica',
    movementPattern: 'potenza_rotazionale',
    primaryMuscleGroups: ['obliqui', 'core', 'anche'],
    bodyAreaRiskTags: ['lombare', 'spalla'],
    equipmentRequired: 'palla medica',
    difficultyLevel: 'intermediate',
  },
  {
    name: 'Pallof press (anti-rotazione)',
    movementPattern: 'core_anti_rotazione',
    primaryMuscleGroups: ['core', 'obliqui'],
    bodyAreaRiskTags: [],
    equipmentRequired: 'cavo o elastico',
    difficultyLevel: 'beginner',
  },
  {
    name: 'Extrarotazione di spalla con elastico',
    movementPattern: 'prehab_cuffia_rotatori',
    primaryMuscleGroups: ['cuffia_dei_rotatori'],
    bodyAreaRiskTags: [],
    equipmentRequired: 'elastico',
    difficultyLevel: 'beginner',
  },
  {
    name: 'Scapular Y-T-W raises',
    movementPattern: 'prehab_scapolare',
    primaryMuscleGroups: ['trapezio', 'romboidi', 'deltoide_posteriore'],
    bodyAreaRiskTags: [],
    equipmentRequired: 'manubri leggeri',
    difficultyLevel: 'beginner',
  },
  {
    name: 'Nordic hamstring curl',
    movementPattern: 'forza_eccentrica_ischiocrurali',
    primaryMuscleGroups: ['ischiocrurali'],
    bodyAreaRiskTags: [],
    equipmentRequired: 'ancoraggio caviglie',
    difficultyLevel: 'intermediate',
  },
  {
    name: 'Split-step + cambio di direzione reattivo',
    movementPattern: 'agilita_reattiva',
    primaryMuscleGroups: ['gambe', 'core'],
    bodyAreaRiskTags: ['ginocchio', 'caviglia'],
    equipmentRequired: 'nessuno',
    difficultyLevel: 'intermediate',
  },
  {
    name: 'Accelerazione breve (10-15m)',
    movementPattern: 'sprint_accelerazione',
    primaryMuscleGroups: ['gambe', 'glutei'],
    bodyAreaRiskTags: ['ginocchio'],
    equipmentRequired: 'nessuno',
    difficultyLevel: 'intermediate',
  },
  {
    name: 'Navetta intervallata (shuttle run)',
    movementPattern: 'condizionamento_intervallato',
    primaryMuscleGroups: ['gambe', 'sistema_cardiovascolare'],
    bodyAreaRiskTags: ['caviglia', 'ginocchio'],
    equipmentRequired: 'coni',
    difficultyLevel: 'intermediate',
  },
];

// Evidence-tier supplement reference (docs/product-design FASE 2 §2.6/FASE 3 F8),
// grounded only in nutrizione.md — "priorità: prima la dieta di base e il sonno".
const supplements = [
  {
    name: 'Creatina monoidrato',
    evidenceTier: 'alta',
    typicalDosage: '3-5 g/die (carico iniziale opzionale ~20 g/die per 5-7 giorni)',
    cautions: "Tra gli integratori più supportati e sicuri; verificare la certificazione anti-doping per atleti tesserati.",
  },
  {
    name: 'Caffeina',
    evidenceTier: 'alta',
    typicalDosage: '~3-6 mg/kg pre-performance',
    cautions: 'Attenzione a tolleranza individuale e impatto sul sonno.',
  },
  {
    name: 'Beta-alanina',
    evidenceTier: 'media-alta',
    typicalDosage: 'Carico cronico giornaliero',
    cautions: 'Utile per sforzi ripetuti di 1-4 minuti; possibile parestesia transitoria.',
  },
  {
    name: 'Bicarbonato di sodio',
    evidenceTier: 'media',
    typicalDosage: 'Da assumere con supervisione per timing/dosaggio',
    cautions: 'Possibili disturbi gastrointestinali.',
  },
  {
    name: 'Nitrati (succo di barbabietola)',
    evidenceTier: 'media',
    typicalDosage: 'Variabile, alcune ore prima della performance',
    cautions: 'Benefici principalmente su endurance/economia di movimento.',
  },
  {
    name: 'Proteine in polvere',
    evidenceTier: 'alta (come comodità, non come sostanza magica)',
    typicalDosage: 'A completamento del fabbisogno proteico giornaliero',
    cautions: 'Non superiore al cibo intero a parità di apporto proteico totale.',
  },
];

// Pricing tiers (docs/product-design FASE 8 §8.4) — indicative prices to be
// validated with real A/B tests, not market data.
const plans = [
  { name: 'Free', tier: 'FREE' as const, price: 0, billingPeriod: 'monthly' },
  { name: 'Premium', tier: 'PREMIUM' as const, price: 9.99, billingPeriod: 'monthly' },
  { name: 'Pro', tier: 'PRO' as const, price: 19.99, billingPeriod: 'monthly' },
  { name: 'B2B per atleta', tier: 'B2B' as const, price: 6, billingPeriod: 'monthly' },
];

async function main() {
  // exercise_library has no natural unique key besides the generated id, so seeding
  // is idempotent by name (find-or-update) rather than a Prisma-level upsert.
  for (const exercise of exercises) {
    const existing = await prisma.exerciseLibrary.findFirst({ where: { name: exercise.name } });
    if (existing) {
      await prisma.exerciseLibrary.update({ where: { id: existing.id }, data: exercise });
    } else {
      await prisma.exerciseLibrary.create({ data: exercise });
    }
  }
  console.log(`Seeded ${exercises.length} exercises.`);

  for (const supplement of supplements) {
    const existing = await prisma.supplementReference.findFirst({ where: { name: supplement.name } });
    if (existing) {
      await prisma.supplementReference.update({ where: { id: existing.id }, data: supplement });
    } else {
      await prisma.supplementReference.create({ data: supplement });
    }
  }
  console.log(`Seeded ${supplements.length} supplements.`);

  for (const plan of plans) {
    const existing = await prisma.plan.findFirst({ where: { name: plan.name } });
    if (existing) {
      await prisma.plan.update({ where: { id: existing.id }, data: plan });
    } else {
      await prisma.plan.create({ data: plan });
    }
  }
  console.log(`Seeded ${plans.length} plans.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
