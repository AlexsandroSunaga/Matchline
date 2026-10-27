"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Database, GitMerge, Upload } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";
import { useMatchStore } from "@/lib/match-context";

export default function OverviewPage() {
  const { lastResult, history } = useMatchStore();
  const [health, setHealth] = useState<{ matcher: string; defaultThreshold: number } | null>(null);

  useEffect(() => {
    api.health().then(setHealth).catch(() => setHealth(null));
  }, []);

  return (
    <>
      <TopBar title="Overview" subtitle="Find duplicate companies in a CSV" />
      <div className="p-6 space-y-8">
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="glass rounded-xl p-4">
            <p className="text-xs text-slate-500 uppercase">Matcher</p>
            <p className="text-sm font-mono mt-2 text-amber-300">{health?.matcher ?? "API not reachable"}</p>
          </div>
          <div className="glass rounded-xl p-4">
            <p className="text-xs text-slate-500 uppercase">Default threshold</p>
            <p className="text-2xl font-semibold mt-2">{health?.defaultThreshold ?? 88}</p>
          </div>
          <div className="glass rounded-xl p-4">
            <p className="text-xs text-slate-500 uppercase">Groups in the last run</p>
            <p className="text-2xl font-semibold mt-2">{lastResult?.clusterCount ?? "—"}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/match"><Button className="gap-2"><Upload className="h-4 w-4" /> New match job</Button></Link>
          <Link href="/dashboard/clusters"><Button variant="secondary" className="gap-2"><GitMerge className="h-4 w-4" /> Review groups</Button></Link>
        </div>
        <div className="glass rounded-2xl p-6">
          <h2 className="font-semibold flex items-center gap-2"><Database className="h-4 w-4 text-amber-400" /> Runs in this session</h2>
          {history.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">No runs yet. Open the match workspace and try the sample file.</p>
          ) : (
            <ul className="mt-4 divide-y divide-slate-800 text-sm">
              {history.slice(0, 5).map((run) => (
                <li key={run.id} className="py-3 flex justify-between gap-4">
                  <span>{run.file}</span>
                  <span className="text-slate-500">
                    {run.records} rows · {run.clusters} groups · threshold {run.threshold}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
