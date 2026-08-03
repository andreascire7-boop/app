-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ATHLETE', 'COACH', 'ORG_ADMIN', 'SUPERADMIN');

-- CreateEnum
CREATE TYPE "OrganizationType" AS ENUM ('ACADEMY', 'CLUB', 'FEDERATION');

-- CreateEnum
CREATE TYPE "OrgRole" AS ENUM ('COACH', 'ADMIN', 'ATHLETE_MANAGED');

-- CreateEnum
CREATE TYPE "LinkStatus" AS ENUM ('PENDING', 'ACTIVE', 'REVOKED');

-- CreateEnum
CREATE TYPE "ConsentType" AS ENUM ('HEALTH_DATA_PROCESSING', 'MARKETING', 'THIRD_PARTY_WEARABLE', 'MINORS_GUARDIAN');

-- CreateEnum
CREATE TYPE "Sport" AS ENUM ('TENNIS', 'PADEL', 'BOTH');

-- CreateEnum
CREATE TYPE "AthleteLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'SEMI_PRO', 'PRO');

-- CreateEnum
CREATE TYPE "BodyArea" AS ENUM ('SPALLA', 'GOMITO', 'LOMBARE', 'GINOCCHIO', 'CAVIGLIA', 'ALTRO');

-- CreateEnum
CREATE TYPE "InjuryStatus" AS ENUM ('ACTIVE', 'RESOLVED');

-- CreateEnum
CREATE TYPE "CompetitionImportance" AS ENUM ('LOCALE', 'REGIONALE', 'NAZIONALE');

-- CreateEnum
CREATE TYPE "CompetitionStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PeriodizationModel" AS ENUM ('LINEARE', 'ONDULATA', 'A_BLOCCHI');

-- CreateEnum
CREATE TYPE "BlockType" AS ENUM ('ACCUMULO', 'TRASMUTAZIONE', 'REALIZZAZIONE');

-- CreateEnum
CREATE TYPE "MicrocycleType" AS ENUM ('ORDINARIO', 'SHOCK', 'SCARICO', 'RIFINITURA', 'COMPETITIVO');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('PLANNED', 'COMPLETED', 'SKIPPED', 'MODIFIED');

-- CreateEnum
CREATE TYPE "PainContext" AS ENUM ('ALLENAMENTO', 'GARA', 'QUOTIDIANO');

-- CreateEnum
CREATE TYPE "WearableMetricType" AS ENUM ('HR', 'HRV', 'SLEEP_STAGE', 'STEPS');

-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('GREEN', 'YELLOW', 'RED');

-- CreateEnum
CREATE TYPE "AiDecisionType" AS ENUM ('PLAN_GENERATION', 'VOLUME_ADJUSTMENT', 'TAPER_START', 'EXERCISE_SUBSTITUTION', 'NUTRITION_FLAG');

-- CreateEnum
CREATE TYPE "SubstitutionReason" AS ENUM ('PAIN', 'EQUIPMENT_MISSING', 'USER_OVERRIDE');

-- CreateEnum
CREATE TYPE "NutritionContext" AS ENUM ('DAILY', 'PRE_MATCH', 'DURING_MATCH', 'POST_MATCH');

-- CreateEnum
CREATE TYPE "PlanTier" AS ENUM ('FREE', 'PREMIUM', 'PRO', 'B2B');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'PAST_DUE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('REVENUECAT', 'STRIPE');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('PUSH', 'EMAIL');

-- CreateEnum
CREATE TYPE "NotificationCategory" AS ENUM ('SESSION_REMINDER', 'RISK_ALERT', 'COMPETITION_TAPER', 'REPORT');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('VIDEO', 'IMAGE');

-- CreateEnum
CREATE TYPE "DataRequestType" AS ENUM ('EXPORT', 'ERASURE');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "auth_provider_id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "date_of_birth" TIMESTAMP(3),
    "role" "UserRole" NOT NULL DEFAULT 'ATHLETE',
    "locale" TEXT NOT NULL DEFAULT 'it-IT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "OrganizationType" NOT NULL,
    "billing_owner_user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "org_memberships" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "org_role" "OrgRole" NOT NULL,

    CONSTRAINT "org_memberships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coach_athlete_links" (
    "id" TEXT NOT NULL,
    "coach_id" TEXT NOT NULL,
    "athlete_id" TEXT NOT NULL,
    "status" "LinkStatus" NOT NULL DEFAULT 'PENDING',
    "granted_scopes" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked_at" TIMESTAMP(3),

    CONSTRAINT "coach_athlete_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consents" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "consent_type" "ConsentType" NOT NULL,
    "granted" BOOLEAN NOT NULL,
    "version" TEXT NOT NULL,
    "granted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked_at" TIMESTAMP(3),

    CONSTRAINT "consents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "athlete_profiles" (
    "user_id" TEXT NOT NULL,
    "primary_sport" "Sport" NOT NULL,
    "level" "AthleteLevel" NOT NULL,
    "dominant_hand" TEXT,
    "weekly_availability_days" INTEGER NOT NULL,
    "goal_primary" TEXT,
    "onboarding_completed_at" TIMESTAMP(3),

    CONSTRAINT "athlete_profiles_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "injury_history" (
    "id" TEXT NOT NULL,
    "athlete_id" TEXT NOT NULL,
    "body_area" "BodyArea" NOT NULL,
    "description" TEXT,
    "severity_at_report" INTEGER NOT NULL,
    "status" "InjuryStatus" NOT NULL DEFAULT 'ACTIVE',
    "reported_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" TIMESTAMP(3),

    CONSTRAINT "injury_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "athlete_goals" (
    "id" TEXT NOT NULL,
    "athlete_id" TEXT NOT NULL,
    "goal_type" TEXT NOT NULL,
    "target_date" TIMESTAMP(3),
    "notes" TEXT,

    CONSTRAINT "athlete_goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guardian_links" (
    "id" TEXT NOT NULL,
    "athlete_id" TEXT NOT NULL,
    "guardian_user_id" TEXT NOT NULL,
    "verified_at" TIMESTAMP(3),

    CONSTRAINT "guardian_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "competitions" (
    "id" TEXT NOT NULL,
    "athlete_id" TEXT NOT NULL,
    "sport" "Sport" NOT NULL,
    "event_date" TIMESTAMP(3) NOT NULL,
    "importance" "CompetitionImportance" NOT NULL,
    "expected_matches" INTEGER,
    "status" "CompetitionStatus" NOT NULL DEFAULT 'SCHEDULED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "competitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "matches" (
    "id" TEXT NOT NULL,
    "competition_id" TEXT NOT NULL,
    "played_at" TIMESTAMP(3),
    "duration_minutes" INTEGER,
    "result" TEXT,
    "rpe_reported" INTEGER,
    "notes" TEXT,

    CONSTRAINT "matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "macrocycles" (
    "id" TEXT NOT NULL,
    "athlete_id" TEXT NOT NULL,
    "model_type" "PeriodizationModel" NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "primary_goal" TEXT,

    CONSTRAINT "macrocycles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mesocycles" (
    "id" TEXT NOT NULL,
    "macrocycle_id" TEXT NOT NULL,
    "block_type" "BlockType",
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "target_qualities" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "mesocycles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "microcycles" (
    "id" TEXT NOT NULL,
    "mesocycle_id" TEXT NOT NULL,
    "week_start_date" TIMESTAMP(3) NOT NULL,
    "type" "MicrocycleType" NOT NULL DEFAULT 'ORDINARIO',
    "planned_volume_index" DOUBLE PRECISION,
    "planned_intensity_index" DOUBLE PRECISION,

    CONSTRAINT "microcycles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "microcycle_id" TEXT NOT NULL,
    "athlete_id" TEXT NOT NULL,
    "scheduled_date" TIMESTAMP(3) NOT NULL,
    "status" "SessionStatus" NOT NULL DEFAULT 'PLANNED',
    "session_focus" TEXT,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exercise_library" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "movement_pattern" TEXT NOT NULL,
    "primary_muscle_groups" JSONB NOT NULL DEFAULT '[]',
    "body_area_risk_tags" JSONB NOT NULL DEFAULT '[]',
    "equipment_required" TEXT,
    "difficulty_level" TEXT,
    "media_id" TEXT,

    CONSTRAINT "exercise_library_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_exercises" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "exercise_id" TEXT NOT NULL,
    "order_index" INTEGER NOT NULL,
    "target_sets" INTEGER,
    "target_reps" INTEGER,
    "target_load" DOUBLE PRECISION,
    "target_rpe" DOUBLE PRECISION,
    "substituted_from_id" TEXT,

    CONSTRAINT "session_exercises_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exercise_logs" (
    "id" TEXT NOT NULL,
    "session_exercise_id" TEXT NOT NULL,
    "set_number" INTEGER NOT NULL,
    "actual_reps" INTEGER,
    "actual_load" DOUBLE PRECISION,
    "actual_rpe" DOUBLE PRECISION,
    "logged_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exercise_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_feedback" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "athlete_id" TEXT NOT NULL,
    "session_rpe" DOUBLE PRECISION,
    "energy_level" INTEGER,
    "notes" TEXT,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "session_feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pain_reports" (
    "id" TEXT NOT NULL,
    "athlete_id" TEXT NOT NULL,
    "body_area" "BodyArea" NOT NULL,
    "pain_level" INTEGER NOT NULL,
    "context" "PainContext" NOT NULL,
    "reported_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pain_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wellness_checkins" (
    "id" TEXT NOT NULL,
    "athlete_id" TEXT NOT NULL,
    "check_date" DATE NOT NULL,
    "sleep_quality" INTEGER,
    "sleep_hours" DOUBLE PRECISION,
    "stress_level" INTEGER,
    "readiness_score" DOUBLE PRECISION,

    CONSTRAINT "wellness_checkins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wearable_data" (
    "time" TIMESTAMP(3) NOT NULL,
    "athlete_id" TEXT NOT NULL,
    "metric_type" "WearableMetricType" NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "source_device" TEXT,

    CONSTRAINT "wearable_data_pkey" PRIMARY KEY ("time","athlete_id","metric_type")
);

-- CreateTable
CREATE TABLE "load_metrics" (
    "day" DATE NOT NULL,
    "athlete_id" TEXT NOT NULL,
    "acute_load" DOUBLE PRECISION,
    "chronic_load" DOUBLE PRECISION,
    "acwr" DOUBLE PRECISION,
    "monotony_index" DOUBLE PRECISION,
    "computed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "load_metrics_pkey" PRIMARY KEY ("day","athlete_id")
);

-- CreateTable
CREATE TABLE "risk_assessments" (
    "id" TEXT NOT NULL,
    "athlete_id" TEXT NOT NULL,
    "assessment_date" DATE NOT NULL,
    "risk_level" "RiskLevel" NOT NULL,
    "contributing_factors" JSONB NOT NULL DEFAULT '{}',
    "recommendation_text" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "risk_assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_decision_log" (
    "id" TEXT NOT NULL,
    "athlete_id" TEXT NOT NULL,
    "decision_type" "AiDecisionType" NOT NULL,
    "engine_version" TEXT NOT NULL,
    "input_snapshot" JSONB NOT NULL,
    "output_decision" JSONB NOT NULL,
    "explanation_text" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_decision_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exercise_substitution_log" (
    "id" TEXT NOT NULL,
    "session_exercise_id" TEXT NOT NULL,
    "reason" "SubstitutionReason" NOT NULL,
    "overridden_by_user" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "exercise_substitution_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nutrition_profiles" (
    "user_id" TEXT NOT NULL,
    "body_comp_goal" TEXT,
    "dietary_restrictions" JSONB NOT NULL DEFAULT '[]',
    "disordered_eating_flag" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "nutrition_profiles_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "nutrition_recommendations" (
    "id" TEXT NOT NULL,
    "athlete_id" TEXT NOT NULL,
    "context" "NutritionContext" NOT NULL,
    "macro_targets" JSONB NOT NULL DEFAULT '{}',
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "linked_competition_id" TEXT,

    CONSTRAINT "nutrition_recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supplement_reference" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "evidence_tier" TEXT NOT NULL,
    "typical_dosage" TEXT,
    "cautions" TEXT,

    CONSTRAINT "supplement_reference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nutrition_flag_events" (
    "id" TEXT NOT NULL,
    "athlete_id" TEXT NOT NULL,
    "trigger_reason" TEXT NOT NULL,
    "action_taken" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "nutrition_flag_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plans" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tier" "PlanTier" NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "billing_period" TEXT NOT NULL,

    CONSTRAINT "plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "organization_id" TEXT,
    "plan_id" TEXT NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "provider" "PaymentProvider" NOT NULL,
    "external_ref" TEXT,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL,
    "issued_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "stripe_invoice_id" TEXT,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_preferences" (
    "user_id" TEXT NOT NULL,
    "channel" "NotificationChannel" NOT NULL,
    "category" "NotificationCategory" NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "notification_preferences_pkey" PRIMARY KEY ("user_id","channel","category")
);

-- CreateTable
CREATE TABLE "notification_log" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "category" "NotificationCategory" NOT NULL,
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "opened_at" TIMESTAMP(3),

    CONSTRAINT "notification_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exercise_media" (
    "id" TEXT NOT NULL,
    "storage_url" TEXT NOT NULL,
    "type" "MediaType" NOT NULL,
    "duration_seconds" INTEGER,

    CONSTRAINT "exercise_media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_log" (
    "id" TEXT NOT NULL,
    "actor_user_id" TEXT,
    "action" TEXT NOT NULL,
    "target_table" TEXT NOT NULL,
    "target_id" TEXT NOT NULL,
    "diff" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "data_subject_requests" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "request_type" "DataRequestType" NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "requested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "data_subject_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "org_memberships_organization_id_user_id_key" ON "org_memberships"("organization_id", "user_id");

-- CreateIndex
CREATE INDEX "coach_athlete_links_status_idx" ON "coach_athlete_links"("status");

-- CreateIndex
CREATE UNIQUE INDEX "coach_athlete_links_coach_id_athlete_id_key" ON "coach_athlete_links"("coach_id", "athlete_id");

-- CreateIndex
CREATE INDEX "injury_history_athlete_id_body_area_idx" ON "injury_history"("athlete_id", "body_area");

-- CreateIndex
CREATE INDEX "competitions_athlete_id_event_date_idx" ON "competitions"("athlete_id", "event_date");

-- CreateIndex
CREATE INDEX "sessions_athlete_id_scheduled_date_idx" ON "sessions"("athlete_id", "scheduled_date");

-- CreateIndex
CREATE INDEX "pain_reports_athlete_id_body_area_reported_at_idx" ON "pain_reports"("athlete_id", "body_area", "reported_at");

-- CreateIndex
CREATE UNIQUE INDEX "wellness_checkins_athlete_id_check_date_key" ON "wellness_checkins"("athlete_id", "check_date");

-- CreateIndex
CREATE INDEX "wearable_data_athlete_id_time_idx" ON "wearable_data"("athlete_id", "time");

-- CreateIndex
CREATE INDEX "risk_assessments_athlete_id_assessment_date_idx" ON "risk_assessments"("athlete_id", "assessment_date");

-- CreateIndex
CREATE INDEX "audit_log_target_table_target_id_created_at_idx" ON "audit_log"("target_table", "target_id", "created_at");

-- AddForeignKey
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_billing_owner_user_id_fkey" FOREIGN KEY ("billing_owner_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "org_memberships" ADD CONSTRAINT "org_memberships_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "org_memberships" ADD CONSTRAINT "org_memberships_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coach_athlete_links" ADD CONSTRAINT "coach_athlete_links_coach_id_fkey" FOREIGN KEY ("coach_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coach_athlete_links" ADD CONSTRAINT "coach_athlete_links_athlete_id_fkey" FOREIGN KEY ("athlete_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consents" ADD CONSTRAINT "consents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "athlete_profiles" ADD CONSTRAINT "athlete_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "injury_history" ADD CONSTRAINT "injury_history_athlete_id_fkey" FOREIGN KEY ("athlete_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "athlete_goals" ADD CONSTRAINT "athlete_goals_athlete_id_fkey" FOREIGN KEY ("athlete_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guardian_links" ADD CONSTRAINT "guardian_links_athlete_id_fkey" FOREIGN KEY ("athlete_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guardian_links" ADD CONSTRAINT "guardian_links_guardian_user_id_fkey" FOREIGN KEY ("guardian_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competitions" ADD CONSTRAINT "competitions_athlete_id_fkey" FOREIGN KEY ("athlete_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_competition_id_fkey" FOREIGN KEY ("competition_id") REFERENCES "competitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "macrocycles" ADD CONSTRAINT "macrocycles_athlete_id_fkey" FOREIGN KEY ("athlete_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mesocycles" ADD CONSTRAINT "mesocycles_macrocycle_id_fkey" FOREIGN KEY ("macrocycle_id") REFERENCES "macrocycles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "microcycles" ADD CONSTRAINT "microcycles_mesocycle_id_fkey" FOREIGN KEY ("mesocycle_id") REFERENCES "mesocycles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_microcycle_id_fkey" FOREIGN KEY ("microcycle_id") REFERENCES "microcycles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_athlete_id_fkey" FOREIGN KEY ("athlete_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exercise_library" ADD CONSTRAINT "exercise_library_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "exercise_media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_exercises" ADD CONSTRAINT "session_exercises_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_exercises" ADD CONSTRAINT "session_exercises_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "exercise_library"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_exercises" ADD CONSTRAINT "session_exercises_substituted_from_id_fkey" FOREIGN KEY ("substituted_from_id") REFERENCES "exercise_library"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exercise_logs" ADD CONSTRAINT "exercise_logs_session_exercise_id_fkey" FOREIGN KEY ("session_exercise_id") REFERENCES "session_exercises"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_feedback" ADD CONSTRAINT "session_feedback_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_feedback" ADD CONSTRAINT "session_feedback_athlete_id_fkey" FOREIGN KEY ("athlete_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pain_reports" ADD CONSTRAINT "pain_reports_athlete_id_fkey" FOREIGN KEY ("athlete_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wellness_checkins" ADD CONSTRAINT "wellness_checkins_athlete_id_fkey" FOREIGN KEY ("athlete_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "risk_assessments" ADD CONSTRAINT "risk_assessments_athlete_id_fkey" FOREIGN KEY ("athlete_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_decision_log" ADD CONSTRAINT "ai_decision_log_athlete_id_fkey" FOREIGN KEY ("athlete_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exercise_substitution_log" ADD CONSTRAINT "exercise_substitution_log_session_exercise_id_fkey" FOREIGN KEY ("session_exercise_id") REFERENCES "session_exercises"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nutrition_profiles" ADD CONSTRAINT "nutrition_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nutrition_recommendations" ADD CONSTRAINT "nutrition_recommendations_athlete_id_fkey" FOREIGN KEY ("athlete_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nutrition_recommendations" ADD CONSTRAINT "nutrition_recommendations_linked_competition_id_fkey" FOREIGN KEY ("linked_competition_id") REFERENCES "competitions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nutrition_flag_events" ADD CONSTRAINT "nutrition_flag_events_athlete_id_fkey" FOREIGN KEY ("athlete_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_log" ADD CONSTRAINT "notification_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data_subject_requests" ADD CONSTRAINT "data_subject_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
