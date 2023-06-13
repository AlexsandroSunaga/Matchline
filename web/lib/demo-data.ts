export const jobLog = [
  { id: 1, name: "vendor-dedup-q1.csv", records: 1240, clusters: 18, at: "2026-03-05T08:00:00Z", status: "completed" },
  { id: 2, name: "crm-export.csv", records: 89, clusters: 4, at: "2026-03-04T14:22:00Z", status: "completed" },
  { id: 3, name: "legacy-suppliers.csv", records: 502, clusters: 0, at: "2026-03-03T11:05:00Z", status: "failed" },
];

export const pipelineSteps = [
  { step: "Ingest", desc: "Upload CSV · validate name column · UTF-8 normalize" },
  { step: "Block", desc: "Greedy cluster by token_sort_ratio ≥ threshold" },
  { step: "Review", desc: "Analyst confirms canonical record per cluster" },
  { step: "Export", desc: "Merge rules → golden record feed (client integration)" },
];
