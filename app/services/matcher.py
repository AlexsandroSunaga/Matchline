from __future__ import annotations

import csv
import io
import re
from dataclasses import dataclass
from typing import Any

from rapidfuzz import fuzz

# Words that describe the legal form, not the company. "Acme Inc" and "ACME Incorporated" are the same name.
_SUFFIXES = frozenset(
    "inc incorporated llc ltd limited co corp corporation company gmbh plc sa bv pty lp llp the".split()
)
_NON_ALNUM = re.compile(r"[^a-z0-9 ]+")


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


def normalize_name(name: str) -> str:
    """Lower-case, drop punctuation and legal-form words, so only the distinctive words are compared."""
    text = _NON_ALNUM.sub(" ", name.lower().replace("&", " and "))
    words = [w for w in text.split() if w not in _SUFFIXES]
    return " ".join(words) or name.lower().strip()


_SAME_NAME = 97


def _email_key(record: Record) -> str:
    return record.email.strip().lower()


def _domain(record: Record) -> str:
    email = _email_key(record)
    return email.rsplit("@", 1)[1] if "@" in email else ""


def _keep_rank(record: Record, normalized: str, index: int) -> tuple:
    """Prefer a name the company's own email address confirms, then mixed case, then the fullest name."""
    squashed = normalized.replace(" ", "")
    in_email = bool(squashed) and squashed in _email_key(record).replace("-", "").replace(".", "")
    return (in_email, record.name != record.name.upper(), len(record.name), -index)


def cluster_records(records: list[Record], threshold: int) -> list[dict[str, Any]]:
    """Group rows that look like the same company.

    Two rows are linked when their normalized names score at least `threshold`
    (token_sort_ratio) or when they share the same non-empty email. Rows whose
    emails are on different domains are treated as different companies unless the
    names are almost identical (97+), because "Cedar Ridge Packing" and "Cedar Ridge
    Packaging" with different domains are usually two businesses. Links are followed
    all the way, so A~B and B~C put A, B and C in one cluster. Every pair is
    compared, which is fine for a few thousand rows.
    """
    n = len(records)
    names = [normalize_name(r.name) for r in records]
    parent = list(range(n))

    def find(i: int) -> int:
        while parent[i] != i:
            parent[i] = parent[parent[i]]
            i = parent[i]
        return i

    def union(i: int, j: int) -> None:
        ri, rj = find(i), find(j)
        if ri != rj:
            parent[max(ri, rj)] = min(ri, rj)

    first_with_email: dict[str, int] = {}
    for i, rec in enumerate(records):
        key = _email_key(rec)
        if key:
            if key in first_with_email:
                union(first_with_email[key], i)
            else:
                first_with_email[key] = i
    domains = [_domain(r) for r in records]
    for i in range(n):
        for j in range(i + 1, n):
            score = fuzz.token_sort_ratio(names[i], names[j])
            if score < threshold:
                continue
            if domains[i] and domains[j] and domains[i] != domains[j] and score < _SAME_NAME:
                continue
            union(i, j)

    groups: dict[int, list[int]] = {}
    for i in range(n):
        groups.setdefault(find(i), []).append(i)

    out: list[dict[str, Any]] = []
    for members in sorted(groups.values(), key=lambda g: g[0]):
        if len(members) < 2:
            continue
        # The fullest name is the best one to keep: "Brightwell Supplies Incorporated" over "BRIGHTWELL".
        keep = max(members, key=lambda i: _keep_rank(records[i], names[i], i))
        emails = [_email_key(records[i]) for i in members]
        out_members = []
        scores: list[float] = []
        for position, i in enumerate(members):
            name_score = float(fuzz.token_sort_ratio(names[i], names[keep]))
            same_email = bool(emails[position]) and emails.count(emails[position]) > 1
            if i == keep:
                label = "kept as the main record"
            else:
                parts = []
                if name_score >= threshold:
                    parts.append(f"name {name_score:.0f}%")
                if same_email:
                    parts.append("same email")
                label = ", ".join(parts) or f"linked through another row ({name_score:.0f}% name)"
                scores.append(100.0 if same_email else name_score)
            out_members.append(
                {"rowId": records[i].row_id, "name": records[i].name, "email": records[i].email, "matchedBy": label}
            )
        out.append(
            {
                "clusterId": len(out) + 1,
                "canonical": records[keep].name,
                "avgScore": round(sum(scores) / len(scores), 1) if scores else 100.0,
                "members": out_members,
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


def deduplicated_csv(records: list[Record], clusters: list[dict[str, Any]]) -> str:
    """One row per company: the kept name, the first email found, and which source rows it replaces."""
    by_row = {r.row_id: r for r in records}
    clustered: set[int] = set()
    rows: list[tuple[int, str, str, list[int]]] = []
    for cluster in clusters:
        ids = [m["rowId"] for m in cluster["members"]]
        clustered.update(ids)
        keep = next(m for m in cluster["members"] if m["name"] == cluster["canonical"])
        email = keep["email"] or next((by_row[i].email for i in ids if by_row[i].email), "")
        rows.append((min(ids), cluster["canonical"], email, ids))
    for rec in records:
        if rec.row_id not in clustered:
            rows.append((rec.row_id, rec.name, rec.email, [rec.row_id]))
    rows.sort(key=lambda row: row[0])

    buffer = io.StringIO()
    writer = csv.writer(buffer, lineterminator="\n")
    writer.writerow(["name", "email", "source_rows"])
    for _, name, email, ids in rows:
        writer.writerow([name, email, " ".join(str(i) for i in sorted(ids))])
    return buffer.getvalue()
