import logging

from fastapi import APIRouter, File, Query, UploadFile

from app.core.config import settings
from app.schemas.match import MatchResponse
from app.services.matcher import cluster_records, parse_csv, summarize_match

router = APIRouter(tags=["matching"])
logger = logging.getLogger("acme.match")


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
