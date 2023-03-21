from __future__ import annotations

import csv
import io
from dataclasses import dataclass
from typing import Any

from fastapi import FastAPI, File, Query, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from rapidfuzz import fuzz

DEFAULT_THRESHOLD = 88

app = FastAPI(title="ACME Record Match", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3002",
        "http://127.0.0.1:3002",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@dataclass
class Record:
    row_id: int
    name: str
    email: str


def parse_csv(content: bytes) -> list[Record]:
    text = content.decode("utf-8-sig", errors="replace")
    reader = csv.DictReader(io.StringIO(text))
    if not reader.fieldnames or "name" not in [f.lower() for f in reader.fieldnames]:
        raise ValueError("CSV must include a 'name' column")
    fields = {f.lower(): f for f in reader.fieldnames}
    name_col = fields["name"]
    email_col = fields.get("email")
    records: list[Record] = []
    for i, row in enumerate(reader):
        name = (row.get(name_col) or "").strip()
        email = (row.get(email_col) or "").strip() if email_col else ""
        if name:
            records.append(Record(row_id=i, name=name, email=email))
    return records


def cluster_records(records: list[Record], threshold: int) -> list[dict[str, Any]]:
    clusters: list[list[Record]] = []
    for rec in records:
        placed = False
        for cluster in clusters:
            rep = cluster[0]
            if fuzz.token_sort_ratio(rec.name.lower(), rep.name.lower()) >= threshold:
                cluster.append(rec)
                placed = True
                break
        if not placed:
            clusters.append([rec])
    out = []
    for idx, cluster in enumerate(clusters):
        if len(cluster) < 2:
            continue
        scores = []
        canonical = cluster[0].name
        for m in cluster[1:]:
            scores.append(fuzz.token_sort_ratio(m.name.lower(), canonical.lower()))
        out.append(
            {
                "clusterId": idx + 1,
                "canonical": canonical,
                "avgScore": round(sum(scores) / len(scores), 1) if scores else 100.0,
                "members": [
                    {"rowId": r.row_id, "name": r.name, "email": r.email} for r in cluster
                ],
            }
        )
    return out


@app.get("/health")
def health() -> dict[str, Any]:
    return {
        "status": "ok",
        "defaultThreshold": DEFAULT_THRESHOLD,
        "matcher": "rapidfuzz.token_sort_ratio",
    }


@app.get("/", response_class=HTMLResponse)
def index() -> str:
    return """<!DOCTYPE html><html><body style="font-family:system-ui;margin:2rem">
    <h1>ACME Record Match API</h1>
    <p>Use the React console on port <strong>3002</strong> or POST <code>/api/match</code>.</p>
    <p><a href="/sample">Download sample CSV</a></p></body></html>"""


@app.get("/sample")
def sample() -> HTMLResponse:
    sample_csv = (
        "name,email\n"
        "Acme Supplies Inc,ops@acme-supplies.com\n"
        "ACME Supplies Incorporated,ops@acme-supplies.com\n"
        "Beta Labs LLC,beta@labs.io\n"
        "Beta Labs,beta@labs.io\n"
        "Gamma Co,gamma@example.com\n"
    )
    return HTMLResponse(
        content=sample_csv,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=sample-vendors.csv"},
    )


@app.post("/api/match")
async def match_json(
    file: UploadFile = File(...),
    threshold: int = Query(DEFAULT_THRESHOLD, ge=50, le=100),
) -> dict[str, Any]:
    raw = await file.read()
    try:
        records = parse_csv(raw)
    except ValueError as e:
        return {
            "error": str(e),
            "recordCount": 0,
            "clusterCount": 0,
            "rowsInClusters": 0,
            "singletonCount": 0,
            "threshold": threshold,
            "clusters": [],
        }
    all_clusters = cluster_records(records, threshold)
    dup_rows = sum(len(c["members"]) for c in all_clusters)
    clustered_ids = {m["rowId"] for c in all_clusters for m in c["members"]}
    singletons = len(records) - len(clustered_ids)
    return {
        "recordCount": len(records),
        "clusterCount": len(all_clusters),
        "rowsInClusters": dup_rows,
        "singletonCount": singletons,
        "threshold": threshold,
        "clusters": all_clusters,
    }


@app.post("/match", response_class=HTMLResponse)
async def match(file: UploadFile = File(...)) -> str:
    raw = await file.read()
    try:
        records = parse_csv(raw)
        clusters = cluster_records(records, DEFAULT_THRESHOLD)
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
