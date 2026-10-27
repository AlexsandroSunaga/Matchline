import logging

from fastapi import APIRouter, File, Query, UploadFile
from fastapi.responses import Response

from app.core.config import settings
from app.schemas.match import MatchResponse
from app.services.matcher import cluster_records, deduplicated_csv, parse_csv, summarize_match

router = APIRouter(tags=["matching"])
logger = logging.getLogger("matchline")


@router.post("/api/match", response_model=MatchResponse)
async def match_json(
    file: UploadFile = File(...),
    threshold: int = Query(default=settings.default_threshold, ge=50, le=100),
) -> MatchResponse:
    raw = await file.read()
    records = parse_csv(raw)
    clusters = cluster_records(records, threshold)
    payload = summarize_match(records, clusters, threshold)
    logger.info(
        "match_complete records=%s clusters=%s threshold=%s",
        payload["recordCount"],
        payload["clusterCount"],
        threshold,
    )
    return MatchResponse(**payload)


@router.post("/api/dedupe")
async def dedupe_csv(
    file: UploadFile = File(...),
    threshold: int = Query(default=settings.default_threshold, ge=50, le=100),
) -> Response:
    """Return the cleaned file: one row per company, with the source rows it replaces."""
    records = parse_csv(await file.read())
    clusters = cluster_records(records, threshold)
    return Response(
        content=deduplicated_csv(records, clusters),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=deduplicated.csv"},
    )
