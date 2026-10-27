from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.services.matcher import (
    cluster_records,
    deduplicated_csv,
    normalize_name,
    parse_csv,
    summarize_match,
)

SAMPLE = Path(__file__).resolve().parent.parent / "data" / "sample-vendors.csv"


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c


def _clusters(rows: list[str], threshold: int = 88):
    records = parse_csv(("name,email\n" + "\n".join(rows) + "\n").encode())
    return records, cluster_records(records, threshold)


def test_legal_suffixes_and_case_do_not_matter():
    assert normalize_name("BRIGHTWELL Supplies, Incorporated") == normalize_name("Brightwell Supplies Inc")
    _, clusters = _clusters(["Brightwell Supplies Inc,", "BRIGHTWELL Supplies Incorporated,"])
    assert len(clusters) == 1


def test_same_email_links_rows_with_different_names():
    _, clusters = _clusters(
        ["Blue Anchor Logistics,accounts@blueanchor.example", "BA Logistics Group,Accounts@BlueAnchor.example"]
    )
    assert len(clusters) == 1
    labels = [m["matchedBy"] for m in clusters[0]["members"]]
    assert any("same email" in label for label in labels)


def test_similar_names_on_different_email_domains_stay_apart():
    _, clusters = _clusters(
        ["Cedar Ridge Packaging,a@cedarridge-pack.com", "Cedar Ridge Packing,hello@cedarridgepacking.example"]
    )
    assert clusters == []


def test_links_are_followed_through_other_rows():
    # The first and last rows share no email and are not similar enough, but the middle rows link them.
    _, clusters = _clusters(
        [
            "Acme Industrial Supply,x@acme.com",
            "Acme,x@acme.com",
            "Acme,y@acme.com",
            "Acme Wholesale,y@acme.com",
        ]
    )
    assert len(clusters) == 1
    assert len(clusters[0]["members"]) == 4


def test_the_spelling_confirmed_by_the_email_is_kept():
    _, clusters = _clusters(
        ["Foxglove Bakrey,b@foxglovebakery.example", "Foxglove Bakery,b@foxglovebakery.example"]
    )
    assert clusters[0]["canonical"] == "Foxglove Bakery"


def test_threshold_changes_what_merges():
    rows = ["Granite Peak Hdwe,", "Granite Peak Hardware,"]
    assert len(_clusters(rows, 85)[1]) == 1
    assert len(_clusters(rows, 95)[1]) == 0


def test_dedupe_endpoint_returns_one_row_per_company(client):
    raw = SAMPLE.read_bytes()
    match = client.post("/api/match?threshold=88", files={"file": ("v.csv", raw, "text/csv")}).json()
    r = client.post("/api/dedupe?threshold=88", files={"file": ("v.csv", raw, "text/csv")})
    assert r.status_code == 200
    assert r.headers["content-type"].startswith("text/csv")
    lines = r.text.strip().splitlines()
    assert lines[0] == "name,email,source_rows"
    assert len(lines) - 1 == match["recordCount"] - match["rowsInClusters"] + match["clusterCount"]


def test_deduplicated_csv_lists_every_source_row_once():
    records, clusters = _clusters(["Acme Inc,a@acme.com", "ACME Incorporated,", "Zenith Ltd,z@zenith.com"])
    lines = deduplicated_csv(records, clusters).strip().splitlines()
    assert lines[0] == "name,email,source_rows"
    assert lines[1].endswith("0 1")
    assert lines[2] == "Zenith Ltd,z@zenith.com,2"


def test_sample_endpoint_serves_the_sample_file(client):
    r = client.get("/sample")
    assert r.status_code == 200
    assert r.text.splitlines()[0] == "name,email"
    assert len(r.text.splitlines()) > 50


def test_sample_file_summary_is_consistent():
    records = parse_csv(SAMPLE.read_bytes())
    summary = summarize_match(records, cluster_records(records, 88), 88)
    assert summary["recordCount"] > 80
    assert summary["clusterCount"] >= 20
    assert summary["rowsInClusters"] + summary["singletonCount"] == summary["recordCount"]
