import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Badge({
  children,
  variant = "default",
}: {
  children: ReactNode;
  variant?: "default" | "success" | "warning" | "outline";
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-md px-2 py-0.5 text-[11px] font-medium uppercase",
        variant === "default" && "bg-slate-800 text-slate-300",
        variant === "success" && "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30",
        variant === "warning" && "bg-amber-500/15 text-amber-300 border border-amber-500/30",
        variant === "outline" && "border border-slate-600 text-slate-400"
      )}
    >
      {children}
    </span>
  );
}
