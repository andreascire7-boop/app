-- Run this once AFTER the first `prisma migrate dev` (backend/) has created the
-- wearable_data and load_metrics tables — Timescale hypertables must be created on
-- top of an existing table, so this cannot run as a Postgres init script.
-- See docs/product-design FASE 5 (§5.0) and backend/prisma/schema.prisma.

CREATE EXTENSION IF NOT EXISTS timescaledb;

SELECT create_hypertable('wearable_data', 'time', if_not_exists => TRUE);
SELECT create_hypertable('load_metrics', 'day', if_not_exists => TRUE);

-- Compression policy for raw wearable samples older than 90 days (FASE 5 §5.2,
-- GDPR data-minimization requirement).
ALTER TABLE wearable_data SET (
  timescaledb.compress,
  timescaledb.compress_segmentby = 'athlete_id, metric_type'
);
SELECT add_compression_policy('wearable_data', INTERVAL '90 days', if_not_exists => TRUE);
