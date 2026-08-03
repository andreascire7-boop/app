from app.engine.injury_risk import assess_risk
from app.models.schemas import InjuryRiskInput, LoadPoint, RiskLevel


def test_insufficient_history_is_flagged():
    risk_input = InjuryRiskInput(
        athlete_id="a1",
        load_history=[
            LoadPoint(date="2026-08-01", session_load=300),
            LoadPoint(date="2026-08-02", session_load=280),
        ],
    )
    result = assess_risk(risk_input)
    assert result.data_sufficient is False
    assert any("meno di 4 settimane" in f for f in result.contributing_factors)


def test_prior_injury_and_pain_reports_raise_risk_level():
    risk_input = InjuryRiskInput(
        athlete_id="a1",
        load_history=[LoadPoint(date="2026-08-03", session_load=300)],
        recent_pain_reports=3,
        has_injury_history_same_area=True,
    )
    result = assess_risk(risk_input)
    assert result.risk_level == RiskLevel.red
    assert len(result.contributing_factors) >= 2
