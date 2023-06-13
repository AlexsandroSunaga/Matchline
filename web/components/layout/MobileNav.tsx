"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Menu, X } from "lucide-react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { useShell } from "@/components/providers/ShellProvider";

export function MobileNavTrigger() {
  const { mobileNavOpen, setMobileNavOpen } = useShell();
  return (
    <Dialog.Root open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
      <Dialog.Trigger asChild>
        <button type="button" className="lg:hidden border border-slate-800 rounded-lg p-2" aria-label="Menu">
          <Menu className="h-5 w-5" />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/70 lg:hidden" />
        <Dialog.Content className="fixed inset-y-0 left-0 z-50 w-80 lg:hidden">
          <div className="h-full bg-slate-950 flex flex-col">
            <div className="flex justify-end p-2">
              <Dialog.Close asChild>
                <button type="button"><X className="h-5 w-5" /></button>
              </Dialog.Close>
            </div>
            <AppSidebar mobile />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
