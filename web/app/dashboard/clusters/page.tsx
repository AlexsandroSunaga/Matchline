"use client";

import { FileDown } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { api, saveBlob } from "@/lib/api";
import { useMatchStore } from "@/lib/match-context";
import Link from "next/link";

export default function ClustersPage() {
  const { lastResult, lastFile } = useMatchStore();

  if (!lastResult?.clusters?.length) {
    return (
      <>
        <TopBar title="Duplicate groups" subtitle="Review the rows the matcher grouped" />
        <div className="p-12 text-center text-slate-500">
          <p>No groups yet.</p>
          <Link href="/dashboard/match" className="text-amber-400 text-sm hover:underline mt-2 inline-block">
            Run a match job first →
          </Link>
        </div>
      </>
    );
  }

  async function download() {
    if (!lastFile || !lastResult) return;
    saveBlob(await api.dedupe(lastFile, lastResult.threshold), "deduplicated.csv");
  }

  return (
    <>
      <TopBar title="Duplicate groups" subtitle={`${lastResult.clusterCount} groups at threshold ${lastResult.threshold}`} />
      <div className="p-6 space-y-4">
        <div className="flex justify-end">
          <Button size="sm" variant="secondary" className="gap-2" onClick={download} disabled={!lastFile}>
            <FileDown className="h-4 w-4" /> Download deduplicated CSV
          </Button>
        </div>
        {lastResult.clusters.map((c) => (
          <div key={c.clusterId} className="glass rounded-2xl p-5">
            <div className="flex flex-wrap justify-between gap-2 items-start">
              <div>
                <p className="text-xs text-slate-500 uppercase">Group {c.clusterId}</p>
                <h3 className="font-semibold text-lg mt-1">{c.canonical}</h3>
              </div>
              <Badge variant="success">avg {c.avgScore}% match</Badge>
            </div>
            <table className="w-full text-sm mt-4">
              <thead className="text-xs text-slate-500 text-left">
                <tr>
                  <th className="py-2">Row</th>
                  <th className="py-2">Name</th>
                  <th className="py-2">Email</th>
                  <th className="py-2">Why it is in this group</th>
                </tr>
              </thead>
              <tbody>
                {c.members.map((m) => (
                  <tr key={m.rowId} className="border-t border-slate-800">
                    <td className="py-2 font-mono text-xs">{m.rowId}</td>
                    <td className="py-2">{m.name}</td>
                    <td className="py-2 text-slate-400">{m.email || "—"}</td>
                    <td className="py-2 text-slate-400">{m.matchedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </>
  );
}
