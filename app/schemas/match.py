from pydantic import BaseModel, Field


class MemberOut(BaseModel):
    rowId: int
    name: str
    email: str


class ClusterOut(BaseModel):
    clusterId: int
    canonical: str
    avgScore: float
    members: list[MemberOut]


class MatchResponse(BaseModel):
    recordCount: int
    clusterCount: int
    rowsInClusters: int
    singletonCount: int
    threshold: int
    clusters: list[ClusterOut]


class HealthResponse(BaseModel):
    status: str
    version: str
    defaultThreshold: int
    matcher: str
