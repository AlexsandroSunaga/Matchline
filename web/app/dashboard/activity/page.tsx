"use client";

import { TopBar } from "@/components/layout/TopBar";
import { useMatchStore } from "@/lib/match-context";

export default function ActivityPage() {
  const { history } = useMatchStore();

  return (
    <>
      <TopBar title="Job log" subtitle="Match runs since you opened this page" />
      <div className="p-6 glass rounded-2xl overflow-hidden">
        {history.length === 0 ? (
          <p className="text-sm text-slate-500">No runs yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-xs uppercase text-slate-500 text-left bg-slate-900/90">
              <tr>
                <th className="px-4 py-3">File</th>
                <th className="px-4 py-3">Records</th>
                <th className="px-4 py-3">Groups</th>
                <th className="px-4 py-3">Threshold</th>
                <th className="px-4 py-3">Time</th>
              </tr>
            </thead>
            <tbody>
              {history.map((run) => (
                <tr key={run.id} className="border-t border-slate-800">
                  <td className="px-4 py-3">{run.file}</td>
                  <td className="px-4 py-3 font-mono">{run.records}</td>
                  <td className="px-4 py-3 font-mono">{run.clusters}</td>
                  <td className="px-4 py-3 font-mono">{run.threshold}</td>
                  <td className="px-4 py-3 text-slate-500">{run.at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
