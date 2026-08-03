from fastapi import FastAPI

from app.api.v1.athletes import router as athletes_router
from app.core.config import ENGINE_VERSION

app = FastAPI(
    title="S&C Intelligence Platform — AI/Decision Engine",
    description=(
        "Rules + ML engine for periodization, injury-risk detection, exercise "
        "substitution and recovery guidance. See docs/product-design FASE 7."
    ),
    version=ENGINE_VERSION,
)

app.include_router(athletes_router)


@app.get("/health")
def health():
    return {"status": "ok", "service": "ai-engine", "engine_version": ENGINE_VERSION}
