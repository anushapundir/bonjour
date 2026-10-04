"use client";

import { ArrowCounterClockwise, SignOut } from "@phosphor-icons/react/dist/ssr";
import { useEffect, useRef, useState } from "react";
import { signOut } from "../../app/login/actions";
import { useDemo } from "./DemoState";

export function UserMenu() {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { reset } = useDemo();

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => {
          setOpen((o) => !o);
          setDone(false);
        }}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        className="grid size-7 place-items-center rounded-full bg-[#db2777] text-[11px] font-medium text-white"
      >
        AL
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-10 z-50 w-60 rounded-[10px] border border-line bg-surface p-1 shadow-float">
          <div className="px-2.5 py-2">
            <p className="text-sm font-medium text-ink">Alex Laurent</p>
            <p className="font-mono text-[11.5px] text-muted">demo@bonjour.dev</p>
          </div>
          <div className="my-1 h-px bg-line" />
          <button
            role="menuitem"
            onClick={() => {
              reset();
              setDone(true);
            }}
            className="flex w-full items-center gap-2 rounded-[6px] px-2.5 py-2 text-left text-[13px] text-ink hover:bg-surface-2"
          >
            <ArrowCounterClockwise size={15} className="text-muted" />
            {done ? "Demo reset" : "Reset demo"}
          </button>
          <form action={signOut}>
            <button role="menuitem" className="flex w-full items-center gap-2 rounded-[6px] px-2.5 py-2 text-left text-[13px] text-ink hover:bg-surface-2">
              <SignOut size={15} className="text-muted" />
              Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
