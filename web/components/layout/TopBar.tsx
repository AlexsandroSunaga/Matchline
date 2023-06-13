"use client";

import { MobileNavTrigger } from "@/components/layout/MobileNav";
import { useShell } from "@/components/providers/ShellProvider";

export function TopBar({ title, subtitle }: { title: string; subtitle?: string }) {
  const { setCommandOpen } = useShell();

  return (
    <header className="sticky top-0 z-20 border-b border-stone-300 bg-[#fffdf9]/90 backdrop-blur px-4 sm:px-6 py-3 flex justify-between items-center gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <MobileNavTrigger />
        <div>
          <h1 className="text-lg font-bold text-stone-900 truncate">{title}</h1>
          {subtitle && <p className="text-xs text-stone-600 truncate">{subtitle}</p>}
        </div>
      </div>
      <button
        type="button"
        onClick={() => setCommandOpen(true)}
        className="hidden md:block text-xs text-stone-600 border border-stone-300 rounded-lg px-3 py-1.5 bg-stone-100 hover:border-orange-400"
      >
        ⌘K
      </button>
    </header>
  );
}
