"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { applyChanges, type Applied, type LiveDeal } from "../../lib/apply";
import type { Runs } from "../../lib/results";
import type { Stage } from "../../lib/stages";
import type { Company, Contact, Deal } from "../../lib/types";
import type { VerifiedChange } from "../../lib/verify";

export type Decision = "approved" | "rejected";
type AppliedEntry = Applied & { key: string };
type Stored = {
  decisions: Record<string, Decision>;
  applied: Record<string, AppliedEntry[]>;
  live: Record<string, { runId: string; changes: VerifiedChange[] }>;
};
export type ClientData = { deals: Deal[]; contacts: Contact[]; companies: Company[]; runs: Runs };
export type Proposals = { source: "committed" | "live"; changes: VerifiedChange[]; keys: string[] };

const KEY = "bonjour-demo-v1";
const EMPTY: Stored = { decisions: {}, applied: {}, live: {} };

function load(): Stored {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...EMPTY, ...(JSON.parse(raw) as Stored) } : EMPTY;
  } catch {
    return EMPTY;
  }
}

function save(state: Stored) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {}
}

function useDemoValue(data: ClientData) {
  const [state, setState] = useState<Stored>(EMPTY);
  const [ready, setReady] = useState(false);

  // Read storage after mount so the first client render matches the server.
  useEffect(() => {
    setState(load());
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready) save(state);
  }, [state, ready]);

  const proposals = useCallback(
    (dealId: string): Proposals => {
      const live = state.live[dealId];
      const changes = live?.changes ?? data.runs[dealId]?.bonjour ?? [];
      const runId = live?.runId ?? "bonjour";
      return { source: live ? "live" : "committed", changes, keys: changes.map((_, i) => `${dealId}:${runId}:${i}`) };
    },
    [state.live, data.runs],
  );

  const pending = useCallback(
    (dealId: string) => {
      const p = proposals(dealId);
      return p.changes.map((c, i) => ({ change: c, key: p.keys[i]! })).filter(({ change, key }) => change.supported && !state.decisions[key]);
    },
    [proposals, state.decisions],
  );

  const liveDeal = useCallback(
    (dealId: string): LiveDeal | null => {
      const deal = data.deals.find((d) => d.id === dealId);
      if (!deal) return null;
      const contacts = data.contacts.filter((c) => c.companyId === deal.companyId);
      return applyChanges(deal, state.applied[dealId] ?? [], contacts);
    },
    [data, state.applied],
  );

  const decide = useCallback((dealId: string, key: string, change: Applied, decision: Decision | null) => {
    setState((s) => {
      const decisions = { ...s.decisions };
      if (decision) decisions[key] = decision;
      else delete decisions[key];
      const kept = (s.applied[dealId] ?? []).filter((a) => a.key !== key);
      const applied = decision === "approved" ? [...kept, { field: change.field, to: change.to, key }] : kept;
      return { ...s, decisions, applied: { ...s.applied, [dealId]: applied } };
    });
  }, []);

  const setStage = useCallback((dealId: string, stage: Stage) => {
    setState((s) => ({
      ...s,
      applied: { ...s.applied, [dealId]: [...(s.applied[dealId] ?? []), { field: "stage", to: stage, key: `manual:${Date.now()}` }] },
    }));
  }, []);

  const setLive = useCallback((dealId: string, changes: VerifiedChange[] | null) => {
    setState((s) => {
      const live = { ...s.live };
      if (changes) live[dealId] = { runId: `live-${Date.now()}`, changes };
      else delete live[dealId];
      return { ...s, live };
    });
  }, []);

  const reset = useCallback(() => setState(EMPTY), []);

  return useMemo(
    () => ({ data, state, ready, proposals, pending, liveDeal, decide, setStage, setLive, reset }),
    [data, state, ready, proposals, pending, liveDeal, decide, setStage, setLive, reset],
  );
}

const Ctx = createContext<ReturnType<typeof useDemoValue> | null>(null);

export function DemoProvider({ data, children }: { data: ClientData; children: React.ReactNode }) {
  return <Ctx.Provider value={useDemoValue(data)}>{children}</Ctx.Provider>;
}

export function useDemo() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useDemo needs DemoProvider");
  return v;
}

// Which fields on a deal were changed in the demo, for the subtle "updated" tint.
export function useUpdatedFields(dealId: string) {
  const { state } = useDemo();
  return new Set((state.applied[dealId] ?? []).map((a) => a.field));
}
