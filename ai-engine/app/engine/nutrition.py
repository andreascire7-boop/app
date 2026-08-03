"""Rules-engine v1 for nutrition guidance (FASE 3 F8, FASE 7 — grounded only in
nutrizione.md). Guidance stays qualitative/ranged (g/kg, not absolute grams) since
the app doesn't collect body weight — consistent with the product decision in
docs/product-design FASE 2 §2.6 ("mai piani numerici rigidi individualizzati").

Safety guardrail (non-negotiable, FASE 3 F8 edge cases): a disordered-eating signal
suspends ALL numeric guidance and redirects to a professional instead — this check
runs first and short-circuits everything else. Minors never get fat-loss framing.
"""

from app.core.config import ENGINE_VERSION
from app.models.schemas import BodyCompGoal, NutritionContext, NutritionRecommendationOutput, NutritionRequest

DURING_MATCH_CARB_THRESHOLD_MINUTES = 60

BASE_MACRO_GUIDANCE = {
    "proteine": "1.4–2.0 g/kg/die (fino a ~2.2 g/kg in deficit calorico, per preservare la massa magra)",
    "carboidrati": "3–5 g/kg/die per carichi leggeri, fino a 6–10+ g/kg per carichi elevati/lunghi",
    "grassi": "non scendere sotto ~0.5–1 g/kg/die",
}


def _peri_match_guidance(context: NutritionContext, duration_minutes: int | None) -> str | None:
    if context == NutritionContext.pre_match:
        return (
            "Pasto con carboidrati (ed eventualmente proteine) alcune ore prima del match, "
            "per garantire riserve di glicogeno adeguate."
        )
    if context == NutritionContext.during_match:
        if duration_minutes and duration_minutes >= DURING_MATCH_CARB_THRESHOLD_MINUTES:
            return (
                f"Match di durata prevista ~{duration_minutes} min: carboidrati indicativamente "
                "30-60 g/h (fino a ~90 g/h con miscele di zuccheri per sforzi molto lunghi), "
                "più liquidi ed elettroliti."
            )
        return "Match breve: priorità all'idratazione, i carboidrati durante il match non sono in genere necessari."
    if context == NutritionContext.post_match:
        return (
            "Reintegro di carboidrati e proteine, reidratazione con sodio; più urgente se la "
            "prossima sessione/match è ravvicinato."
        )
    return None


def build_nutrition_recommendation(payload: NutritionRequest) -> NutritionRecommendationOutput:
    if payload.disordered_eating_flag:
        return NutritionRecommendationOutput(
            athlete_id=payload.athlete_id,
            numeric_guidance_suspended=True,
            macro_guidance={},
            peri_match_guidance=None,
            explanation=(
                "Segnale di rapporto problematico con il cibo rilevato: le raccomandazioni numeriche "
                "sono sospese. Ti consigliamo di rivolgerti a un nutrizionista o medico per un supporto "
                "personalizzato."
            ),
            engine_version=ENGINE_VERSION,
        )

    macro_guidance = dict(BASE_MACRO_GUIDANCE)
    explanation = "Principi generali di nutrizione sportiva, non un piano clinico individualizzato."

    if payload.body_comp_goal == BodyCompGoal.lose_fat:
        if payload.is_minor:
            # Guardrail: no fat-loss deficit framing for minors (FASE 3 F8 edge case) —
            # emphasis stays on adequate energy for growth and performance.
            explanation += (
                " Atleta minorenne: nessun obiettivo di deficit calorico applicato di default — "
                "priorità a energia sufficiente per crescita e prestazione."
            )
        else:
            macro_guidance["composizione_corporea"] = (
                "Deficit calorico moderato (mai estremo), proteine nella fascia alta del range per "
                "preservare la massa muscolare durante il deficit."
            )

    peri_match = _peri_match_guidance(payload.context, payload.competition_duration_minutes)

    return NutritionRecommendationOutput(
        athlete_id=payload.athlete_id,
        numeric_guidance_suspended=False,
        macro_guidance=macro_guidance,
        peri_match_guidance=peri_match,
        explanation=explanation,
        engine_version=ENGINE_VERSION,
    )
