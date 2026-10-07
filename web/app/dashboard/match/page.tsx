"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Download, Play } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { api } from "@/lib/api";
import { useMatchStore } from "@/lib/match-context";

export default function MatchWorkspacePage() {
  const { threshold, setThreshold, setLastResult, lastResult } = useMatchStore();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [phase, setPhase] = useState("");

  async function run() {
    if (!file) return;
    setLoading(true);
    setError("");
    setPhase("Parsing CSV…");
    await new Promise((r) => setTimeout(r, 300));
    setPhase("Blocking duplicates…");
    try {
      const data = await api.match(file, threshold);
      if (data.error) throw new Error(data.error);
      setLastResult(data);
      setPhase("Complete");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Match failed — is API on :8002?");
      setPhase("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <TopBar title="Match workspace" subtitle="Upload CSV · tune threshold · run blocking pipeline" />
      <div className="p-6 grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="glass rounded-2xl p-6">
            <h2 className="font-semibold">Ingest</h2>
            <p className="text-sm text-slate-500 mt-1 mb-4">Requires a <code className="text-amber-300">name</code> column; optional <code>email</code>.</p>
            <input type="file" accept=".csv" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            <a href={api.sampleUrl()} className="inline-flex items-center gap-1 text-sm text-amber-400 mt-3 hover:underline">
              <Download className="h-3.5 w-3.5" /> Download sample CSV
            </a>
          </div>
          <div className="glass rounded-2xl p-6">
            <label className="text-sm font-medium">Similarity threshold: {threshold}</label>
            <input
              type="range"
              min={50}
              max={100}
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="w-full mt-3 accent-amber-500"
            />
            <p className="text-xs text-slate-500 mt-2">token_sort_ratio ≥ threshold → same cluster</p>
            <Button className="mt-4 gap-2" onClick={run} disabled={!file || loading}>
              <Play className="h-4 w-4" /> {loading ? phase || "Running…" : "Run match job"}
            </Button>
            {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
          </div>
          {lastResult && !lastResult.error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-2xl p-6">
              <h3 className="font-semibold mb-4">Results</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                <div><p className="text-slate-500">Records</p><p className="text-xl font-semibold">{lastResult.recordCount}</p></div>
                <div><p className="text-slate-500">Clusters</p><p className="text-xl font-semibold">{lastResult.clusterCount}</p></div>
                <div><p className="text-slate-500">In clusters</p><p className="text-xl font-semibold">{lastResult.rowsInClusters}</p></div>
                <div><p className="text-slate-500">Singletons</p><p className="text-xl font-semibold">{lastResult.singletonCount}</p></div>
              </div>
            </motion.div>
          )}
        </div>
        <aside className="glass rounded-2xl p-5 h-fit">
          <h3 className="font-semibold text-sm">Pipeline status</h3>
          <ul className="mt-4 space-y-3 text-xs text-slate-400">
            <li className="flex justify-between"><span>Ingest</span><Badge variant="success">ready</Badge></li>
            <li className="flex justify-between"><span>Block</span>{loading ? <Badge variant="warning">running</Badge> : <Badge variant="outline">idle</Badge>}</li>
            <li className="flex justify-between"><span>Review</span><Badge variant="outline">manual</Badge></li>
          </ul>
        </aside>
      </div>
    </>
  );
}
