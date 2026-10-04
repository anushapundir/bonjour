"use client";

import { List, X } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "../Logo";
import { ThemeToggle } from "../ThemeToggle";
import { NAV_GROUPS } from "../nav";
import { Square } from "../ui";
import { useDemo } from "./DemoState";
import { Search } from "./Search";
import { UserMenu } from "./UserMenu";

function Nav({ onNavigate }: { onNavigate?: () => void }) {
  const path = usePathname();
  return (
    <nav className="flex flex-col gap-5" aria-label="App">
      {NAV_GROUPS.map((g) => (
        <div key={g.label}>
          <p className="mb-1 px-2 text-[11.5px] font-medium text-faint">{g.label}</p>
          <ul className="flex flex-col gap-px">
            {g.items.map(({ href, label, icon: Icon, color }) => {
              const active = href === "/app" ? path === "/app" : path.startsWith(href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={`flex h-8 items-center gap-2.5 rounded-[8px] px-2 text-[13.5px] transition-colors ${
                      active ? "bg-accent-soft font-medium text-ink" : "text-ink-2 hover:bg-surface-2 hover:text-ink"
                    }`}
                  >
                    <Square color={color} className="size-[18px] rounded-[5px]">
                      <Icon size={11} weight="bold" />
                    </Square>
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

export function Shell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  const { data } = useDemo();
  useEffect(() => setOpen(false), [path]);

  return (
    <div className="min-h-dvh bg-canvas lg:grid lg:grid-cols-[232px_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-dvh flex-col border-r border-line bg-bg px-3 py-4 lg:flex">
        <Link href="/app" className="mb-7 px-2 pt-1">
          <Logo />
        </Link>
        <Nav />
        <p className="mt-auto rounded-[8px] border border-line bg-canvas px-3 py-2.5 text-xs leading-relaxed text-muted">
          A demo workspace with <span className="font-mono text-ink-2">{data.deals.length}</span> hand-written deals. Nothing you do here leaves your browser.
        </p>
      </aside>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <button className="absolute inset-0 bg-black/30" aria-label="Close menu" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-64 flex-col border-r border-line bg-bg px-3 py-4 shadow-float">
            <div className="mb-7 flex items-center justify-between px-2">
              <Logo />
              <button onClick={() => setOpen(false)} aria-label="Close menu" className="grid size-8 place-items-center rounded-[8px] text-muted hover:bg-surface-2">
                <X size={16} />
              </button>
            </div>
            <Nav onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}

      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex h-12 items-center gap-2 border-b border-line bg-bg px-3 lg:px-6">
          <button onClick={() => setOpen(true)} aria-label="Open menu" className="grid size-8 place-items-center rounded-[8px] text-muted hover:bg-surface-2 lg:hidden">
            <List size={18} />
          </button>
          <Search />
          <div className="ml-auto flex items-center gap-1">
            <ThemeToggle />
            <UserMenu />
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1400px] px-4 py-6 lg:px-8 lg:py-7">{children}</main>
      </div>
    </div>
  );
}
