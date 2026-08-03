import os

ENGINE_VERSION = "0.1.0-rules-only"  # bumped whenever the rules below change; written
# into ai_decision_log.engine_version (docs/product-design FASE 5/7) so every AI decision
# stays reproducible and auditable.

CORE_API_BASE_URL = os.getenv("CORE_API_BASE_URL", "http://localhost:3000")
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
