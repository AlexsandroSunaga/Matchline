"use client";

import { TopBar } from "@/components/layout/TopBar";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useMatchStore } from "@/lib/match-context";
import Link from "next/link";

export default function ClustersPage() {
  const { lastResult } = useMatchStore();

  if (!lastResult?.clusters?.length) {
    return (
      <>
        <TopBar title="Clusters" subtitle="Review duplicate groups" />
        <div className="p-12 text-center text-slate-500">
          <p>No clusters yet.</p>
          <Link href="/dashboard/match" className="text-amber-400 text-sm hover:underline mt-2 inline-block">
            Run a match job first →
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <TopBar title="Clusters" subtitle={`${lastResult.clusterCount} groups · threshold ${lastResult.threshold}`} />
      <div className="p-6 space-y-4">
        {lastResult.clusters.map((c) => (
          <div key={c.clusterId} className="glass rounded-2xl p-5">
            <div className="flex flex-wrap justify-between gap-2 items-start">
              <div>
                <p className="text-xs text-slate-500 uppercase">Cluster {c.clusterId}</p>
                <h3 className="font-semibold text-lg mt-1">{c.canonical}</h3>
                <span className="inline-block mt-2">
                  <Badge variant="success">avg {c.avgScore}% match</Badge>
                </span>
              </div>
              <Button size="sm" variant="secondary">Accept merge</Button>
            </div>
            <table className="w-full text-sm mt-4">
              <thead className="text-xs text-slate-500 text-left">
                <tr>
                  <th className="py-2">Row</th>
                  <th className="py-2">Name</th>
                  <th className="py-2">Email</th>
                </tr>
              </thead>
              <tbody>
                {c.members.map((m) => (
                  <tr key={m.rowId} className="border-t border-slate-800">
                    <td className="py-2 font-mono text-xs">{m.rowId}</td>
                    <td className="py-2">{m.name}</td>
                    <td className="py-2 text-slate-400">{m.email || "—"}</td>
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
