"""Rules-engine v1 for exercise substitution on pain/limitation (FASE 7, §7.5)."""

from app.core.config import ENGINE_VERSION
from app.models.schemas import SubstitutionInput, SubstitutionOutput

SEVERE_PAIN_THRESHOLD = 7
MODERATE_PAIN_THRESHOLD = 4


def classify_severity(pain_level: int) -> str:
    if pain_level >= SEVERE_PAIN_THRESHOLD:
        return "severo"
    if pain_level >= MODERATE_PAIN_THRESHOLD:
        return "moderato"
    return "lieve"


def evaluate_substitution(sub_input: SubstitutionInput) -> SubstitutionOutput:
    severity = classify_severity(sub_input.pain_level)
    area_at_risk = sub_input.reported_pain_area in sub_input.exercise_body_area_tags

    if not area_at_risk:
        return SubstitutionOutput(
            should_substitute=False,
            severity=severity,
            requires_professional_referral=False,
            explanation=(
                f"L'esercizio non sollecita la zona segnalata "
                f"({sub_input.reported_pain_area.value}): nessuna sostituzione necessaria."
            ),
            engine_version=ENGINE_VERSION,
        )

    requires_referral = severity == "severo"
    explanation = (
        f"Esercizio sostituito perché sollecita la zona segnalata "
        f"({sub_input.reported_pain_area.value}), dolore di livello {severity}."
    )
    if requires_referral:
        explanation += (
            " Dolore severo: passaggio a modalità limitazione e raccomandazione di consulto "
            "professionale prima del rientro al carico standard (continuum RTP, FASE 7 §7.5)."
        )

    return SubstitutionOutput(
        should_substitute=True,
        severity=severity,
        requires_professional_referral=requires_referral,
        explanation=explanation,
        engine_version=ENGINE_VERSION,
    )
