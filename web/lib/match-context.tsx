"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { MatchResult } from "@/lib/api";

export type RunRecord = {
  id: number;
  file: string;
  records: number;
  clusters: number;
  rowsInClusters: number;
  threshold: number;
  at: string;
};

type MatchContextValue = {
  lastResult: MatchResult | null;
  lastFile: File | null;
  history: RunRecord[];
  recordRun: (file: File, result: MatchResult) => void;
  threshold: number;
  setThreshold: (t: number) => void;
};

const MatchContext = createContext<MatchContextValue | null>(null);

export function MatchProvider({ children }: { children: ReactNode }) {
  const [lastResult, setLastResult] = useState<MatchResult | null>(null);
  const [lastFile, setLastFile] = useState<File | null>(null);
  const [history, setHistory] = useState<RunRecord[]>([]);
  const [threshold, setThreshold] = useState(88);

  function recordRun(file: File, result: MatchResult) {
    setLastResult(result);
    setLastFile(file);
    setHistory((runs) => [
      {
        id: runs.length + 1,
        file: file.name,
        records: result.recordCount,
        clusters: result.clusterCount,
        rowsInClusters: result.rowsInClusters,
        threshold: result.threshold,
        at: new Date().toLocaleTimeString(),
      },
      ...runs,
    ]);
  }

  return (
    <MatchContext.Provider value={{ lastResult, lastFile, history, recordRun, threshold, setThreshold }}>
      {children}
    </MatchContext.Provider>
  );
}

export function useMatchStore() {
  const ctx = useContext(MatchContext);
  if (!ctx) throw new Error("useMatchStore requires MatchProvider");
  return ctx;
}
