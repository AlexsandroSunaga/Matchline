"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Download, FileDown, Play } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { api, saveBlob } from "@/lib/api";
import { useMatchStore } from "@/lib/match-context";

export default function MatchWorkspacePage() {
  const { threshold, setThreshold, recordRun, lastResult, lastFile } = useMatchStore();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function useSample() {
    setError("");
    try {
      setFile(await api.sampleFile());
    } catch {
      setError("Could not load the sample file. Is the API running on :8002?");
    }
  }

  async function run() {
    if (!file) return;
    setLoading(true);
    setError("");
    try {
      const data = await api.match(file, threshold);
      if (data.error) throw new Error(data.error);
      recordRun(file, data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Match failed. Is the API running on :8002?");
    } finally {
      setLoading(false);
    }
  }

  async function download() {
    if (!lastFile || !lastResult) return;
    saveBlob(await api.dedupe(lastFile, lastResult.threshold), "deduplicated.csv");
  }

  return (
    <>
      <TopBar title="Match workspace" subtitle="Upload a CSV · set the threshold · run the match" />
      <div className="p-6 grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="glass rounded-2xl p-6">
            <h2 className="font-semibold">Your file</h2>
            <p className="text-sm text-slate-500 mt-1 mb-4">
              Needs a <code className="text-amber-300">name</code> column. An <code>email</code> column is optional and helps a lot.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <input type="file" accept=".csv" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
              <Button variant="secondary" size="sm" onClick={useSample}>Use the sample vendors file</Button>
            </div>
            {file && <p className="text-xs text-slate-500 mt-3">Selected: {file.name}</p>}
            <a href={api.sampleUrl()} className="inline-flex items-center gap-1 text-sm text-amber-400 mt-3 hover:underline">
              <Download className="h-3.5 w-3.5" /> Download the sample CSV
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
            <p className="text-xs text-slate-500 mt-2">
              Names that score at or above this (after ignoring Inc, Ltd, case and punctuation) are grouped. Rows with the same email are always grouped.
            </p>
            <Button className="mt-4 gap-2" onClick={run} disabled={!file || loading}>
              <Play className="h-4 w-4" /> {loading ? "Matching…" : "Run match job"}
            </Button>
            {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
          </div>
          {lastResult && !lastResult.error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-2xl p-6">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <h3 className="font-semibold">Results at threshold {lastResult.threshold}</h3>
                <Button size="sm" variant="secondary" className="gap-2" onClick={download} disabled={!lastFile}>
                  <FileDown className="h-4 w-4" /> Download deduplicated CSV
                </Button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                <div><p className="text-slate-500">Records</p><p className="text-xl font-semibold">{lastResult.recordCount}</p></div>
                <div><p className="text-slate-500">Duplicate groups</p><p className="text-xl font-semibold">{lastResult.clusterCount}</p></div>
                <div><p className="text-slate-500">Rows in groups</p><p className="text-xl font-semibold">{lastResult.rowsInClusters}</p></div>
                <div><p className="text-slate-500">Unique rows</p><p className="text-xl font-semibold">{lastResult.singletonCount}</p></div>
              </div>
              <p className="text-xs text-slate-500 mt-4">
                The cleaned file has {lastResult.recordCount - lastResult.rowsInClusters + lastResult.clusterCount} rows: one per company.
              </p>
            </motion.div>
          )}
        </div>
        <aside className="glass rounded-2xl p-5 h-fit">
          <h3 className="font-semibold text-sm">Status</h3>
          <ul className="mt-4 space-y-3 text-xs text-slate-400">
            <li className="flex justify-between"><span>File</span>{file ? <Badge variant="success">selected</Badge> : <Badge variant="outline">none</Badge>}</li>
            <li className="flex justify-between"><span>Match</span>{loading ? <Badge variant="warning">running</Badge> : <Badge variant="outline">idle</Badge>}</li>
            <li className="flex justify-between"><span>Review</span><Badge variant="outline">manual</Badge></li>
          </ul>
        </aside>
      </div>
    </>
  );
}
