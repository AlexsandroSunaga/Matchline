"use client";

import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import * as Dialog from "@radix-ui/react-dialog";
import { dashboardNav } from "@/lib/nav";

export function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const router = useRouter();
  const go = (href: string) => {
    onOpenChange(false);
    router.push(href);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60" />
        <Dialog.Content className="fixed left-1/2 top-[18%] z-50 w-[min(560px,92vw)] -translate-x-1/2 rounded-2xl border border-slate-700 bg-slate-950 shadow-xl overflow-hidden">
          <Dialog.Title className="sr-only">Command</Dialog.Title>
          <Command>
            <Command.Input className="w-full h-12 px-4 border-b border-slate-800 bg-transparent text-sm outline-none" />
            <Command.List className="max-h-72 overflow-y-auto p-2">
              {dashboardNav.map((item) => (
                <Command.Item
                  key={item.href}
                  onSelect={() => go(item.href)}
                  className="flex gap-2 rounded-lg px-3 py-2 text-sm cursor-pointer aria-selected:bg-amber-500/15"
                >
                  <item.icon className="h-4 w-4" /> {item.label}
                </Command.Item>
              ))}
            </Command.List>
          </Command>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
