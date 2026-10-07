from __future__ import annotations

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, File, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse

from app.api.router import api_router
from app.core.config import settings
from app.core.logging import configure_logging
from app.middleware.request_id import RequestIdMiddleware
from app.services.matcher import cluster_records, parse_csv

logger = logging.getLogger("matchline")


@asynccontextmanager
async def lifespan(_: FastAPI):
    configure_logging(settings.log_level)
    logger.info("starting %s v%s", settings.app_name, settings.app_version)
    yield


app = FastAPI(title=settings.app_name, version=settings.app_version, lifespan=lifespan)
app.add_middleware(RequestIdMiddleware)

origins = [o.strip() for o in settings.cors_origins.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)


@app.exception_handler(ValueError)
async def value_error_handler(_: Request, exc: ValueError) -> JSONResponse:
    return JSONResponse(status_code=422, content={"detail": str(exc)})


@app.get("/", response_class=HTMLResponse, include_in_schema=False)
def index() -> str:
    return """<!DOCTYPE html><html><body style="font-family:system-ui;margin:2rem">
    <h1>Matchline API</h1>
    <p>Use the React console on port <strong>3002</strong> or POST <code>/api/match</code>.</p>
    <p><a href="/sample">Download sample CSV</a> · <a href="/docs">OpenAPI</a></p></body></html>"""


@app.get("/sample", include_in_schema=False)
def sample() -> HTMLResponse:
    sample_csv = (
        "name,email\n"
        "Brightwell Supplies Inc,ops@brightwell-supplies.com\n"
        "BRIGHTWELL Supplies Incorporated,ops@brightwell-supplies.com\n"
        "Beta Labs LLC,beta@labs.io\n"
        "Beta Labs,beta@labs.io\n"
        "Gamma Co,gamma@example.com\n"
    )
    return HTMLResponse(
        content=sample_csv,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=sample-vendors.csv"},
    )


@app.post("/match", response_class=HTMLResponse, include_in_schema=False)
async def match_html(file: UploadFile = File(...)) -> str:
    raw = await file.read()
    try:
        records = parse_csv(raw)
        clusters = cluster_records(records, settings.default_threshold)
    except ValueError as e:
        return f"<pre>Error: {e}</pre>"

    html = [
        "<!DOCTYPE html><html><body style='font-family:system-ui;max-width:720px;margin:2rem auto'>",
        "<h1>Results</h1>",
        f"<p>Records: {len(records)} · Clusters: {len(clusters)}</p>",
        "<a href='/'>← API home</a>",
    ]
    for c in clusters:
        html.append(f"<h2>Cluster {c['clusterId']}</h2><ul>")
        for m in c["members"]:
            html.append(f"<li>{m['name']}</li>")
        html.append("</ul>")
    html.append("</body></html>")
    return "".join(html)
