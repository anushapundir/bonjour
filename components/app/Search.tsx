"use client";

import { MagnifyingGlass } from "@phosphor-icons/react/dist/ssr";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useDemo } from "./DemoState";

type Hit = { href: string; title: string; sub: string; kind: "Deal" | "Contact" };

export function Search() {
  const { data } = useDemo();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const input = useRef<HTMLInputElement>(null);

  // "/" or Cmd/Ctrl+K jumps to search from anywhere.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = e.target instanceof HTMLElement && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName);
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
        e.preventDefault();
        input.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const hits = useMemo<Hit[]>(() => {
    const t = q.trim().toLowerCase();
    if (!t) return [];
    const company = (id: string) => data.companies.find((c) => c.id === id)?.name ?? "";
    const deals = data.deals
      .filter((d) => `${d.name} ${company(d.companyId)}`.toLowerCase().includes(t))
      .map((d) => ({ href: `/app/deals/${d.id}`, title: d.name, sub: company(d.companyId), kind: "Deal" as const }));
    const contacts = data.contacts
      .filter((c) => `${c.name} ${c.title} ${c.email}`.toLowerCase().includes(t))
      .map((c) => ({ href: `/app/contacts#${c.id}`, title: c.name, sub: `${c.title}, ${company(c.companyId)}`, kind: "Contact" as const }));
    return [...deals, ...contacts].slice(0, 8);
  }, [q, data]);

  const go = (hit: Hit) => {
    router.push(hit.href);
    setQ("");
    setOpen(false);
    input.current?.blur();
  };

  return (
    <div className="relative w-full max-w-sm">
      <MagnifyingGlass size={15} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" />
      <input
        ref={input}
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setActive(0);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") setActive((a) => Math.min(a + 1, hits.length - 1));
          else if (e.key === "ArrowUp") setActive((a) => Math.max(a - 1, 0));
          else if (e.key === "Enter" && hits[active]) go(hits[active]);
          else if (e.key === "Escape") input.current?.blur();
          else return;
          e.preventDefault();
        }}
        placeholder="Search deals and contacts"
        aria-label="Search deals and contacts"
        role="combobox"
        aria-expanded={open && hits.length > 0}
        aria-controls="search-results"
        className="h-8 w-full rounded-md border border-line bg-surface pl-8 pr-10 text-[13px] text-ink placeholder:text-muted focus:border-line-strong focus:outline-none"
      />
      <kbd className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 rounded border border-line px-1 text-[11px] text-muted sm:block">/</kbd>
      {open && q.trim() && (
        <ul id="search-results" role="listbox" className="absolute left-0 right-0 top-10 z-50 overflow-hidden rounded-lg border border-line bg-surface p-1 shadow-panel">
          {hits.length === 0 && <li className="px-2.5 py-2 text-[13px] text-muted">No deals or contacts match &ldquo;{q}&rdquo;.</li>}
          {hits.map((h, i) => (
            <li key={h.href} role="option" aria-selected={i === active}>
              <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => go(h)}
                onMouseEnter={() => setActive(i)}
                className={`flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-left ${i === active ? "bg-surface-2" : ""}`}
              >
                <span className="w-14 shrink-0 text-[11px] text-muted">{h.kind}</span>
                <span className="min-w-0 truncate text-[13px] text-ink">{h.title}</span>
                <span className="ml-auto hidden truncate text-xs text-muted sm:block">{h.sub}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
