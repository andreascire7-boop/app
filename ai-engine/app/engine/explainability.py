"""Natural-language explanation layer (FASE 4 §4.9, FASE 7 §7.7).

The LLM never decides load/risk/substitutions — it only rephrases a decision the
rules engine already made, constrained to the data it was given. If no API key is
configured (e.g. in local/dev), fall back to the rule engine's own explanation text
verbatim rather than failing — the structured explanation is always present and
correct on its own, Claude only makes it read more naturally.
"""

from app.core.config import ANTHROPIC_API_KEY

EXPLAIN_SYSTEM_PROMPT = (
    "Spiega la seguente decisione di allenamento in linguaggio naturale, in italiano, "
    "usando esclusivamente i dati forniti. Non aggiungere raccomandazioni cliniche, "
    "dosaggi o consigli non presenti nell'input."
)


def explain(structured_explanation: str) -> str:
    if not ANTHROPIC_API_KEY:
        return structured_explanation
    # TODO(M4.2): call the Anthropic API here (model chosen per latency/cost budget —
    # a fast/cheap model for these short daily explanations), passing
    # EXPLAIN_SYSTEM_PROMPT + structured_explanation, and return the model's reply.
    return structured_explanation
