import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
};

export function Button({ className, variant = "primary", size = "md", ...props }: Props) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-semibold transition-colors disabled:opacity-50",
        size === "sm" && "px-3 py-1.5 text-sm",
        size === "md" && "px-4 py-2 text-sm",
        size === "lg" && "px-6 py-3 text-base",
        variant === "primary" && "bg-orange-600 text-white hover:bg-orange-500 shadow-sm",
        variant === "secondary" && "bg-stone-200 text-stone-900 hover:bg-stone-300 border border-stone-400/50",
        variant === "ghost" && "text-stone-700 hover:bg-stone-200/80",
        className
      )}
      {...props}
    />
  );
}
