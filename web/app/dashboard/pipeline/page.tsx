"use client";

import { TopBar } from "@/components/layout/TopBar";
import { pipelineSteps } from "@/lib/demo-data";

export default function PipelinePage() {
  return (
    <>
      <TopBar title="Pipeline" subtitle="How records move through the match job" />
      <div className="p-6 max-w-2xl space-y-4">
        {pipelineSteps.map((s, i) => (
          <div key={s.step} className="glass rounded-xl p-5 flex gap-4">
            <div className="h-8 w-8 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center font-semibold text-sm">
              {i + 1}
            </div>
            <div>
              <h3 className="font-semibold">{s.step}</h3>
              <p className="text-sm text-slate-400 mt-1">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
