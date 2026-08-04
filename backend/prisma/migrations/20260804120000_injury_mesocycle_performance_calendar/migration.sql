-- AlterEnum (BodyArea): storico infortuni completo — schiena al posto di "lombare",
-- più polso e anca (docs/product-design update: Profilo Atleta Avanzato).
ALTER TYPE "BodyArea" RENAME VALUE 'LOMBARE' TO 'SCHIENA';
ALTER TYPE "BodyArea" ADD VALUE 'POLSO';
ALTER TYPE "BodyArea" ADD VALUE 'ANCA';

-- AlterEnum (InjuryStatus): presente / recupero / risolto.
ALTER TYPE "InjuryStatus" ADD VALUE 'RECOVERING';

-- CreateEnum
CREATE TYPE "PerformanceTestType" AS ENUM ('SPRINT_5M', 'SPRINT_10M', 'TEST_505', 'T_TEST', 'SPIDER_TEST', 'CMJ', 'BROAD_JUMP', 'CUSTOM_STRENGTH');

-- CreateEnum
CREATE TYPE "TestPhase" AS ENUM ('INIZIALE', 'INTERMEDIO', 'FINALE');

-- AlterTable: mesocicli — stato di completamento e aderenza.
ALTER TABLE "mesocycles" ADD COLUMN "completed_at" TIMESTAMP(3);
ALTER TABLE "mesocycles" ADD COLUMN "adherence_percentage" DOUBLE PRECISION;

-- AlterTable: calendario gare — nome torneo + provenienza import automatico.
ALTER TABLE "competitions" ADD COLUMN "name" TEXT;
ALTER TABLE "competitions" ADD COLUMN "source_file_name" TEXT;
ALTER TABLE "competitions" ADD COLUMN "auto_extracted" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "mesocycle_feedback" (
    "id" TEXT NOT NULL,
    "mesocycle_id" TEXT NOT NULL,
    "athlete_id" TEXT NOT NULL,
    "difficulty_perceived" INTEGER NOT NULL,
    "energy_level" INTEGER NOT NULL,
    "recovery_quality" INTEGER NOT NULL,
    "pain_level" INTEGER NOT NULL DEFAULT 0,
    "program_satisfaction" INTEGER NOT NULL,
    "notes" TEXT,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mesocycle_feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "performance_tests" (
    "id" TEXT NOT NULL,
    "athlete_id" TEXT NOT NULL,
    "test_type" "PerformanceTestType" NOT NULL,
    "custom_name" TEXT,
    "value" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "phase" "TestPhase",
    "test_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "performance_tests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "mesocycle_feedback_mesocycle_id_key" ON "mesocycle_feedback"("mesocycle_id");

-- CreateIndex
CREATE INDEX "performance_tests_athlete_id_test_type_test_date_idx" ON "performance_tests"("athlete_id", "test_type", "test_date");

-- AddForeignKey
ALTER TABLE "mesocycle_feedback" ADD CONSTRAINT "mesocycle_feedback_mesocycle_id_fkey" FOREIGN KEY ("mesocycle_id") REFERENCES "mesocycles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mesocycle_feedback" ADD CONSTRAINT "mesocycle_feedback_athlete_id_fkey" FOREIGN KEY ("athlete_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "performance_tests" ADD CONSTRAINT "performance_tests_athlete_id_fkey" FOREIGN KEY ("athlete_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
