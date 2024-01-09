from __future__ import annotations

import csv
import io
from dataclasses import dataclass
from typing import Any

from rapidfuzz import fuzz


@dataclass(frozen=True)
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

    out: list[dict[str, Any]] = []
    for idx, cluster in enumerate(clusters):
        if len(cluster) < 2:
            continue
        scores: list[float] = []
        canonical = cluster[0].name
        for member in cluster[1:]:
            scores.append(float(fuzz.token_sort_ratio(member.name.lower(), canonical.lower())))
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


def summarize_match(
    records: list[Record], clusters: list[dict[str, Any]], threshold: int
) -> dict[str, Any]:
    dup_rows = sum(len(c["members"]) for c in clusters)
    clustered_ids = {m["rowId"] for c in clusters for m in c["members"]}
    singletons = len(records) - len(clustered_ids)
    return {
        "recordCount": len(records),
        "clusterCount": len(clusters),
        "rowsInClusters": dup_rows,
        "singletonCount": singletons,
        "threshold": threshold,
        "clusters": clusters,
    }
