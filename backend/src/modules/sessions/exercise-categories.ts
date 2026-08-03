// Mirrors ai-engine/app/engine/session_builder.py's movement-pattern buckets —
// keep both in sync if either changes (FASE 7 §7.1/§7.5).
export const POWER_PATTERNS = new Set([
  'potenza_rotazionale',
  'sprint_accelerazione',
  'agilita_reattiva',
  'spinta_verticale_esplosiva',
]);
export const STRENGTH_PATTERNS = new Set([
  'squat',
  'hip_hinge',
  'spinta_orizzontale',
  'trazione_verticale',
  'lunge_monolaterale',
]);
export const PREHAB_PATTERNS = new Set([
  'core_anti_rotazione',
  'prehab_cuffia_rotatori',
  'prehab_scapolare',
  'forza_eccentrica_ischiocrurali',
]);
export const CONDITIONING_PATTERNS = new Set(['condizionamento_intervallato']);

export function categoryPatternsFor(movementPattern: string): Set<string> {
  if (POWER_PATTERNS.has(movementPattern)) return POWER_PATTERNS;
  if (STRENGTH_PATTERNS.has(movementPattern)) return STRENGTH_PATTERNS;
  if (PREHAB_PATTERNS.has(movementPattern)) return PREHAB_PATTERNS;
  if (CONDITIONING_PATTERNS.has(movementPattern)) return CONDITIONING_PATTERNS;
  return new Set([movementPattern]);
}
