const API = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8002";

export type Member = { rowId: number; name: string; email: string };
export type Cluster = {
  clusterId: number;
  canonical: string;
  avgScore: number;
  members: Member[];
};

export type MatchResult = {
  recordCount: number;
  clusterCount: number;
  rowsInClusters: number;
  singletonCount: number;
  threshold: number;
  clusters: Cluster[];
  error?: string;
};

export const api = {
  health: () =>
    fetch(`${API}/health`).then((r) => r.json()) as Promise<{
      status: string;
      defaultThreshold: number;
      matcher: string;
    }>,
  match: (file: File, threshold: number) => {
    const url = `${API}/api/match?threshold=${threshold}`;
    const body = new FormData();
    body.append("file", file);
    return fetch(url, { method: "POST", body }).then(async (r) => {
      const data = (await r.json()) as MatchResult & { detail?: string };
      if (!r.ok) {
        throw new Error(data.detail ?? data.error ?? `HTTP ${r.status}`);
      }
      return data;
    });
  },
  sampleUrl: () => `${API}/sample`,
};
