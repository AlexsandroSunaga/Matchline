from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.services.matcher import cluster_records, parse_csv

SAMPLE = Path(__file__).resolve().parent.parent / "data" / "sample-vendors.csv"


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c


def test_health(client):
    r = client.get("/health")
    assert r.status_code == 200
    body = r.json()
    assert body["status"] == "ok"
    assert body["defaultThreshold"] == 88
    assert "x-request-id" in {k.lower() for k in r.headers}


def test_parse_and_cluster_logic():
    records = parse_csv(
        b"name,email\nAcme Corp,a@x.com\nACME Corp,a@x.com\nZenith Ltd,z@x.com\n"
    )
    assert len(records) == 3
    clusters = cluster_records(records, 88)
    assert len(clusters) == 1
    assert [m["name"] for m in clusters[0]["members"]] == ["Acme Corp", "ACME Corp"]


def test_match_sample_vendors(client):
    with SAMPLE.open("rb") as f:
        r = client.post("/api/match", files={"file": ("sample-vendors.csv", f, "text/csv")})
    assert r.status_code == 200
    body = r.json()
    assert body["recordCount"] >= 2
    assert body["clusterCount"] >= 1
    assert body["rowsInClusters"] + body["singletonCount"] == body["recordCount"]
    for c in body["clusters"]:
        assert len(c["members"]) >= 2


def test_match_threshold_out_of_range(client):
    r = client.post(
        "/api/match?threshold=10",
        files={"file": ("v.csv", b"name\nA\n", "text/csv")},
    )
    assert r.status_code == 422


def test_match_missing_name_column(client):
    r = client.post(
        "/api/match",
        files={"file": ("v.csv", b"company,email\nA,a@x.com\n", "text/csv")},
    )
    assert r.status_code == 422
    assert "name" in r.json()["detail"]


def test_match_requires_file(client):
    assert client.post("/api/match").status_code == 422
