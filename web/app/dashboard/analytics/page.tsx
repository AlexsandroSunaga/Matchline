"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { TopBar } from "@/components/layout/TopBar";
import { useMatchStore } from "@/lib/match-context";

export default function AnalyticsPage() {
  const { lastResult } = useMatchStore();

  const chartData = lastResult
    ? [
        { name: "Records", value: lastResult.recordCount },
        { name: "Clusters", value: lastResult.clusterCount },
        { name: "Dup rows", value: lastResult.rowsInClusters },
        { name: "Singletons", value: lastResult.singletonCount },
      ]
    : [
        { name: "Records", value: 0 },
        { name: "Clusters", value: 0 },
      ];

  return (
    <>
      <TopBar title="Analytics" subtitle="Last job volume (live when you run a match)" />
      <div className="p-6 glass rounded-2xl h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="name" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" allowDecimals={false} />
            <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155" }} />
            <Bar dataKey="value" fill="#f59e0b" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}
