"use client";

import { TopBar } from "@/components/layout/TopBar";
import { useMatchStore } from "@/lib/match-context";

export default function SettingsPage() {
  const { threshold, setThreshold } = useMatchStore();

  return (
    <>
      <TopBar title="Settings" subtitle="Matcher configuration" />
      <div className="p-6 max-w-md glass rounded-2xl">
        <label className="text-sm text-slate-400">Default threshold</label>
        <input
          type="number"
          min={50}
          max={100}
          value={threshold}
          onChange={(e) => setThreshold(Number(e.target.value))}
          className="mt-2 w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2"
        />
        <p className="text-xs text-slate-500 mt-3">
          API: <code className="text-amber-300">POST /api/match?threshold=</code> — FastAPI + RapidFuzz
        </p>
      </div>
    </>
  );
}
