"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { MatchResult } from "@/lib/api";

type MatchContextValue = {
  lastResult: MatchResult | null;
  setLastResult: (r: MatchResult | null) => void;
  threshold: number;
  setThreshold: (t: number) => void;
};

const MatchContext = createContext<MatchContextValue | null>(null);

export function MatchProvider({ children }: { children: ReactNode }) {
  const [lastResult, setLastResult] = useState<MatchResult | null>(null);
  const [threshold, setThreshold] = useState(88);
  return (
    <MatchContext.Provider value={{ lastResult, setLastResult, threshold, setThreshold }}>
      {children}
    </MatchContext.Provider>
  );
}

export function useMatchStore() {
  const ctx = useContext(MatchContext);
  if (!ctx) throw new Error("useMatchStore requires MatchProvider");
  return ctx;
}
