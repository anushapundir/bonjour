"use client";

import {
  AddressBook,
  Buildings,
  ChartBar,
  Handshake,
  Kanban,
  List,
  SunHorizon,
  X,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "../Logo";
import { ThemeToggle } from "../ThemeToggle";
import { useDemo } from "./DemoState";
import { Search } from "./Search";
import { UserMenu } from "./UserMenu";

const NAV = [
  { href: "/app", label: "Brief", icon: SunHorizon },
  { href: "/app/pipeline", label: "Pipeline", icon: Kanban },
  { href: "/app/deals", label: "Deals", icon: Handshake },
  { href: "/app/contacts", label: "Contacts", icon: AddressBook },
  { href: "/app/companies", label: "Companies", icon: Buildings },
  { href: "/app/eval", label: "Eval", icon: ChartBar },
];

function Nav({ onNavigate }: { onNavigate?: () => void }) {
  const path = usePathname();
  return (
    <nav className="flex flex-col gap-0.5" aria-label="App">
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = href === "/app" ? path === "/app" : path.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={`flex h-8 items-center gap-2.5 rounded-md px-2 text-[13px] transition-colors ${
              active ? "bg-surface-2 font-medium text-ink" : "text-muted hover:bg-surface-2 hover:text-ink"
            }`}
          >
            <Icon size={16} weight={active ? "fill" : "regular"} className={active ? "text-accent" : ""} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export function Shell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  const { data } = useDemo();
  useEffect(() => setOpen(false), [path]);

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[216px_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-dvh flex-col border-r border-line bg-bg px-3 py-4 lg:flex">
        <Link href="/app" className="mb-6 px-2">
          <Logo />
        </Link>
        <Nav />
        <p className="mt-auto px-2 text-xs leading-relaxed text-muted">
          Demo workspace with {data.deals.length} hand-written deals. Nothing you do here leaves your browser.
        </p>
      </aside>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <button className="absolute inset-0 bg-black/40" aria-label="Close menu" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-64 flex-col border-r border-line bg-bg px-3 py-4 shadow-panel">
            <div className="mb-6 flex items-center justify-between px-2">
              <Logo />
              <button onClick={() => setOpen(false)} aria-label="Close menu" className="grid size-8 place-items-center rounded-md text-muted hover:bg-surface-2">
                <X size={16} />
              </button>
            </div>
            <Nav onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}

      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-line bg-bg/85 px-4 backdrop-blur lg:px-6">
          <button onClick={() => setOpen(true)} aria-label="Open menu" className="grid size-8 place-items-center rounded-md text-muted hover:bg-surface-2 lg:hidden">
            <List size={18} />
          </button>
          <Search />
          <div className="ml-auto flex items-center gap-1">
            <ThemeToggle />
            <UserMenu />
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1400px] px-4 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
