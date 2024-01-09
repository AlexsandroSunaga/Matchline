from fastapi import APIRouter

from app.core.config import settings
from app.schemas.match import HealthResponse

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(
        status="ok",
        version=settings.app_version,
        defaultThreshold=settings.default_threshold,
        matcher="rapidfuzz.token_sort_ratio",
    )
