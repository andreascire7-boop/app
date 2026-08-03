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
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
