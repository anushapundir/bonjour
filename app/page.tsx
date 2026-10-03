import { ArrowUpRight, GithubLogo } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { ActivityItem } from "../components/deal/ActivityItem";
import { ChangeCard } from "../components/deal/ChangeCard";
import { CAVEAT, EvalTable, REC_LABEL } from "../components/EvalTable";
import { Logo } from "../components/Logo";
import { ThemeToggle } from "../components/ThemeToggle";
import { StageBadge, btn } from "../components/ui";
import { appData } from "../lib/app-data";
import { findQuote } from "../lib/apply";
import { day } from "../lib/format";
import { RECOMMENDERS } from "../lib/types";
import type { VerifiedChange } from "../lib/verify";

const GITHUB = "https://github.com/anushapundir/bonjour";

export default function Landing() {
  const { deals, activities, contacts, runs, scoreboard } = appData();
  const ctxFor = (dealId: string) => {
    const deal = deals.find((d) => d.id === dealId)!;
    return { deal, contacts: contacts.filter((c) => c.companyId === deal.companyId), changes: runs[dealId]?.bonjour ?? [] };
  };
  const source = (c: VerifiedChange) => {
    const a = activities.find((x) => x.id === c.evidence.activityId);
    return a ? `${a.kind === "email" ? "Email" : a.kind === "call" ? "Call" : "Note"}, ${day(a.at)}` : undefined;
  };
  const cited = (c: VerifiedChange | undefined) => activities.find((a) => a.id === c?.evidence.activityId);

  const hero = ctxFor("d-05");
  const heroLead = hero.changes.find((c) => c.field === "contactLeft") ?? hero.changes[0];
  const heroEmail = cited(heroLead);

  const ps = ctxFor("d-01");
  const psLead = ps.changes.find((c) => c.field === "closeDate") ?? ps.changes[0];
  const psEmail = cited(psLead);

  const bon = scoreboard?.recommenders.bonjour;
  const naive = scoreboard?.recommenders.naive;

  return (
    <div className="overflow-x-clip">
      <header className="sticky top-0 z-30 border-b border-line/70 bg-bg/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 sm:px-6">
          <Link href="/" aria-label="Bonjour home">
            <Logo />
          </Link>
          <nav className="hidden items-center gap-5 text-[13px] text-muted md:flex">
            <a href="#product" className="hover:text-ink">Product</a>
            <a href="#how" className="hover:text-ink">How it works</a>
            <a href="#eval" className="hover:text-ink">Eval</a>
            <a href={GITHUB} className="hover:text-ink">GitHub</a>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <Link href="/login" className={btn.primary}>
              Try the demo
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="mx-auto max-w-6xl px-4 pb-20 pt-16 sm:px-6 sm:pt-24">
          <div className="max-w-3xl">
            <h1 className="rise text-4xl font-semibold leading-[1.05] tracking-tight text-ink sm:text-6xl">
              Every CRM update, with the line it came from.
            </h1>
            <p className="rise mt-5 max-w-[52ch] text-lg leading-relaxed text-ink-2" style={{ "--i": 1 } as React.CSSProperties}>
              Bonjour reads your deal emails and calls, updates the record, and shows the exact sentence behind every change.
            </p>
            <div className="rise mt-8 flex flex-wrap gap-3" style={{ "--i": 2 } as React.CSSProperties}>
              <Link href="/login" className={`${btn.primary} h-10 px-4 text-sm`}>
                Try the live demo
              </Link>
              <a href={GITHUB} className={`${btn.secondary} h-10 px-4 text-sm`}>
                <GithubLogo size={16} weight="fill" />
                Read the code
              </a>
            </div>
          </div>

          <div id="product" className="rise mt-14 scroll-mt-24" style={{ "--i": 3 } as React.CSSProperties}>
            <Preview title={hero.deal.name} stage={hero.deal.stage}>
              <div className="grid items-start gap-4 p-3 sm:p-4 lg:grid-cols-[minmax(0,1fr)_380px]">
                {heroEmail && <ActivityItem activity={heroEmail} highlight={findQuote(heroEmail.body, heroLead!.evidence.quote)} />}
                <div className="space-y-2">
                  {hero.changes.map((c, i) => (
                    <ChangeCard key={i} change={c} contacts={hero.contacts} source={source(c)} active={c === heroLead} actions={<FakeActions />} />
                  ))}
                </div>
              </div>
            </Preview>
            <p className="mt-3 text-center text-xs text-muted">The real deal screen, rendered from the demo data and the committed model output.</p>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="scroll-mt-20 border-t border-line">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
            <h2 className="reveal max-w-xl text-3xl font-semibold tracking-tight text-ink">Your CRM says bonjour every morning with what changed.</h2>
            <ol className="mt-12 divide-y divide-line border-y border-line">
              {[
                ["It reads", "Every email, call note and meeting note on a deal, oldest first, including the P.S. and the forwarded thread it should ignore."],
                ["It proposes, with receipts", "Each change to stage, amount, close date, next step, contacts or risks comes with a reason and a quote. If the quote is not in the activity word for word, the change is blocked."],
                ["You approve", "Approve or reject each change, or approve everything that has a source. Nothing touches the record until you do."],
              ].map(([title, body], i) => (
                <li key={title} className="reveal grid gap-2 py-7 sm:grid-cols-[64px_minmax(0,280px)_minmax(0,1fr)] sm:gap-6">
                  <span className="text-sm tabular-nums text-muted">{i + 1}</span>
                  <h3 className="text-lg font-medium text-ink">{title}</h3>
                  <p className="max-w-[60ch] text-[15px] leading-relaxed text-ink-2">{body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Showcase */}
        {psEmail && psLead && (
          <section className="border-t border-line bg-surface-2/50">
            <div className="mx-auto grid max-w-6xl gap-10 px-4 py-20 sm:px-6 sm:py-24 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:items-center">
              <div className="reveal">
                <h2 className="text-3xl font-semibold tracking-tight text-ink">The delay was in the P.S.</h2>
                <p className="mt-4 max-w-[48ch] text-[15px] leading-relaxed text-ink-2">
                  A long, happy email about a great sandbox week. The only line that matters is at the very bottom. Bonjour moves the close date, flags the risk, and points at
                  that line so you can check it in a second.
                </p>
                <ul className="mt-6 space-y-2 text-[13px]">
                  {RECOMMENDERS.filter((id) => id !== "bonjour").map((id) => {
                    const run = scoreboard?.recommenders[id];
                    const s = run?.status === "ran" ? run.perDeal.find((p) => p.dealId === "d-01") : undefined;
                    return (
                      <li key={id} className="flex gap-3">
                        <span className="w-28 shrink-0 text-muted">{REC_LABEL[id]}</span>
                        <span className="text-ink-2">{s ? describe(s) : "not run yet"}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
              <div className="reveal grid gap-3">
                <ActivityItem activity={psEmail} highlight={findQuote(psEmail.body, psLead.evidence.quote)} clip />
                <div className="grid gap-2 sm:grid-cols-2">
                  {ps.changes.map((c, i) => (
                    <ChangeCard key={i} change={c} contacts={ps.contacts} source={source(c)} active={c === psLead} />
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Eval */}
        {scoreboard && (
          <section id="eval" className="scroll-mt-20 border-t border-line">
            <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6 sm:py-24">
              <h2 className="reveal text-3xl font-semibold tracking-tight text-ink">An honest eval, small on purpose.</h2>
              {bon?.status === "ran" && (
                <p className="reveal mt-4 max-w-[62ch] text-[15px] leading-relaxed text-ink-2">
                  {bon.aggregate.deals} hand-written deals, each with one trap. Bonjour got {bon.aggregate.correct} of {bon.aggregate.expected} expected changes right
                  {naive?.status === "ran" ? `, against ${naive.aggregate.correct} for a naive prompt that proposed ${naive.aggregate.spurious} changes nobody needed` : ""}.
                </p>
              )}
              <div className="reveal mt-8">
                <EvalTable board={scoreboard} compact />
              </div>
              <p className="mt-4 max-w-[70ch] text-[13px] leading-relaxed text-muted">{CAVEAT}</p>
              <Link href="/app/eval" className="mt-4 inline-flex items-center gap-1 text-[13px] font-medium text-accent hover:underline">
                See every deal and every proposed change
                <ArrowUpRight size={13} />
              </Link>
            </div>
          </section>
        )}

        {/* Open source + MCP */}
        <section className="border-t border-line">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-20 sm:px-6 sm:py-24 lg:grid-cols-2 lg:items-center">
            <div className="reveal">
              <h2 className="text-3xl font-semibold tracking-tight text-ink">Open source. Works from any MCP client.</h2>
              <p className="mt-4 max-w-[48ch] text-[15px] leading-relaxed text-ink-2">
                MIT licensed. The same agent runs behind an MCP server with three tools: list deals, read one, and propose updates with citations. Point your assistant at it and
                ask what changed.
              </p>
              <a href={GITHUB} className={`${btn.secondary} mt-6 h-9 px-3.5`}>
                <GithubLogo size={15} weight="fill" />
                anushapundir/bonjour
              </a>
            </div>
            <pre className="reveal overflow-x-auto rounded-xl border border-line bg-surface p-5 text-[12.5px] leading-relaxed text-ink-2">
              <code>{MCP_SNIPPET}</code>
            </pre>
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-8 text-[13px] text-muted sm:px-6">
          <Logo />
          <p>
            MIT licensed. Built by{" "}
            <a href="https://anushapundir.vercel.app" className="text-ink-2 hover:text-ink hover:underline">
              Anusha Pundir
            </a>
            .
          </p>
          <a href={GITHUB} className="hover:text-ink">
            GitHub
          </a>
        </div>
      </footer>
    </div>
  );
}

const MCP_SNIPPET = `{
  "mcpServers": {
    "bonjour": {
      "command": "npm",
      "args": [
        "run", "--silent",
        "--prefix", "/path/to/bonjour",
        "mcp"
      ]
    }
  }
}`;

function describe(s: { correct: number; expected: number; wrongValue: number; missed: number; spurious: number; unsupported: number; verdicts: string[] }) {
  if (s.verdicts.length === 0) return `Proposed nothing. Missed ${s.missed} of ${s.expected}.`;
  const parts = [`${s.correct} of ${s.expected} right`];
  if (s.missed) parts.push(`missed ${s.missed}`);
  if (s.wrongValue) parts.push(`${s.wrongValue} wrong`);
  if (s.spurious) parts.push(`${s.spurious} not needed`);
  if (s.unsupported) parts.push(`${s.unsupported} cited a quote that isn't there`);
  return parts.join(", ") + ".";
}

function Preview({ title, stage, children }: { title: string; stage: string; children: React.ReactNode }) {
  return (
    <div inert className="overflow-hidden rounded-2xl border border-line bg-bg shadow-panel">
      <div className="flex items-center gap-3 border-b border-line bg-surface px-4 py-2.5">
        <span className="truncate text-[13px] font-medium text-ink">{title}</span>
        <StageBadge stage={stage} />
      </div>
      {children}
    </div>
  );
}

function FakeActions() {
  return (
    <span className="flex gap-1.5">
      <span className={btn.secondary}>Reject</span>
      <span className={btn.primary}>Approve</span>
    </span>
  );
}

