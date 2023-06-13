"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { CommandPalette } from "@/components/command/CommandPalette";

type ShellContextValue = {
  commandOpen: boolean;
  setCommandOpen: (o: boolean) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (v: boolean) => void;
  mobileNavOpen: boolean;
  setMobileNavOpen: (v: boolean) => void;
};

const ShellContext = createContext<ShellContextValue | null>(null);

export function useShell() {
  const ctx = useContext(ShellContext);
  if (!ctx) throw new Error("useShell");
  return ctx;
}

export function ShellProvider({ children }: { children: ReactNode }) {
  const [commandOpen, setCommandOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const setCommandOpenStable = useCallback((o: boolean) => setCommandOpen(o), []);

  return (
    <ShellContext.Provider
      value={{
        commandOpen,
        setCommandOpen: setCommandOpenStable,
        sidebarCollapsed,
        setSidebarCollapsed,
        mobileNavOpen,
        setMobileNavOpen,
      }}
    >
      {children}
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpenStable} />
    </ShellContext.Provider>
  );
}
