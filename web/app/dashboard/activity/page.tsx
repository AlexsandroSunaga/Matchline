"use client";

import { TopBar } from "@/components/layout/TopBar";
import { Badge } from "@/components/ui/Badge";
import { jobLog } from "@/lib/demo-data";

export default function ActivityPage() {
  return (
    <>
      <TopBar title="Job log" subtitle="Batch match history (demo rows)" />
      <div className="p-6 glass rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="text-xs uppercase text-slate-500 text-left bg-slate-900/90">
            <tr>
              <th className="px-4 py-3">File</th>
              <th className="px-4 py-3">Records</th>
              <th className="px-4 py-3">Clusters</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {jobLog.map((j) => (
              <tr key={j.id} className="border-t border-slate-800">
                <td className="px-4 py-3">{j.name}</td>
                <td className="px-4 py-3 font-mono">{j.records}</td>
                <td className="px-4 py-3 font-mono">{j.clusters}</td>
                <td className="px-4 py-3">
                  <Badge variant={j.status === "completed" ? "success" : "warning"}>{j.status}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
