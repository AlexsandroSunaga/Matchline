const API = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8002";

export type Member = { rowId: number; name: string; email: string; matchedBy: string };
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

function upload(path: string, file: File, threshold: number) {
  const body = new FormData();
  body.append("file", file);
  return fetch(`${API}${path}?threshold=${threshold}`, { method: "POST", body });
}

export const api = {
  health: () =>
    fetch(`${API}/health`).then((r) => r.json()) as Promise<{
      status: string;
      defaultThreshold: number;
      matcher: string;
    }>,
  match: (file: File, threshold: number) =>
    upload("/api/match", file, threshold).then(async (r) => {
      const data = (await r.json()) as MatchResult & { detail?: string };
      if (!r.ok) {
        throw new Error(data.detail ?? data.error ?? `HTTP ${r.status}`);
      }
      return data;
    }),
  dedupe: async (file: File, threshold: number) => {
    const r = await upload("/api/dedupe", file, threshold);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.blob();
  },
  sampleUrl: () => `${API}/sample`,
  sampleFile: async () => {
    const r = await fetch(`${API}/sample`);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return new File([await r.blob()], "sample-vendors.csv", { type: "text/csv" });
  },
};

export function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
