// Prisma enums (UPPER_SNAKE) and the ai-engine's pydantic enums (lower_snake) were
// deliberately named to be case-only transforms of each other — see
// docs/product-design FASE 5 vs. ai-engine/app/models/schemas.py. Keep it that way
// when either side gains new values, or these generic mappers will silently drift.

export function toAiEngineEnum(prismaEnumValue: string): string {
  return prismaEnumValue.toLowerCase();
}

export function toPrismaEnum<T extends string>(aiEngineValue: string): T {
  return aiEngineValue.toUpperCase() as T;
}
