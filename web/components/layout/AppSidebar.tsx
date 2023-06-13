"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Database, Search } from "lucide-react";
import { cn } from "@/lib/cn";
import { dashboardNav, navGroups } from "@/lib/nav";
import { useShell } from "@/components/providers/ShellProvider";

export function AppSidebar({ mobile }: { mobile?: boolean }) {
  const pathname = usePathname();
  const { setCommandOpen, setMobileNavOpen } = useShell();

  return (
    <aside
      className={cn(
        "flex flex-col border-r border-stone-700 bg-[#2a2118] text-stone-200 h-full",
        mobile ? "w-full" : "hidden lg:flex w-64"
      )}
    >
      <div className="p-4 border-b border-stone-600/50">
        <div className="flex items-center gap-2 text-orange-400">
          <Database className="h-4 w-4" />
          <p className="text-[10px] font-bold uppercase tracking-widest">Data Quality</p>
        </div>
        <h2 className="font-bold text-stone-50 mt-1">Record Match</h2>
        <button
          type="button"
          onClick={() => setCommandOpen(true)}
          className="mt-3 w-full flex items-center gap-2 rounded-lg border border-stone-600 bg-stone-900/40 px-3 py-2 text-xs text-stone-400 hover:text-orange-200"
        >
          <Search className="h-3.5 w-3.5" /> Quick search
        </button>
      </div>
      <nav className="flex-1 p-2 space-y-4 overflow-y-auto">
        {navGroups.map((g) => (
          <div key={g.id}>
            <p className="px-3 text-[10px] uppercase text-stone-500 mb-1 font-semibold">{g.label}</p>
            <ul className="space-y-0.5">
              {dashboardNav
                .filter((n) => n.group === g.id)
                .map((item) => {
                  const Icon = item.icon;
                  const active = pathname === item.href;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => mobile && setMobileNavOpen(false)}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium",
                          active
                            ? "bg-orange-600/25 text-orange-100 border border-orange-500/30"
                            : "text-stone-400 hover:bg-stone-800/60 hover:text-stone-200"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
            </ul>
          </div>
        ))}
      </nav>
      <p className="p-3 text-[10px] text-stone-600 border-t border-stone-700">Portfolio · Alexsandro</p>
    </aside>
  );
}
