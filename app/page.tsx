import { ArrowRight, ArrowUpRight, Code } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import Link from "next/link";
import { ActivityItem } from "../components/deal/ActivityItem";
import { ChangeCard } from "../components/deal/ChangeCard";
import { CAVEAT, EvalTable, REC_LABEL } from "../components/EvalTable";
import { Logo } from "../components/Logo";
import { morningCounts } from "../components/morning";
import { ThemeToggle } from "../components/ThemeToggle";
import { Monogram, StageBadge, btn } from "../components/ui";
import { appData } from "../lib/app-data";
import { findQuote } from "../lib/apply";
import { day, dealTitle, longDay, money } from "../lib/format";
import { TODAY } from "../lib/today";
import { RECOMMENDERS } from "../lib/types";
import type { VerifiedChange } from "../lib/verify";
import dawn from "../public/images/dawn-clouds.jpg";
import peaks from "../public/images/pink-peaks.jpg";

const GITHUB = "https://github.com/anushapundir/bonjour";
const v = (vars: Record<string, string | number>) => vars as React.CSSProperties;

export default function Landing() {
  const { deals, activities, contacts, companies, runs, scoreboard } = appData();
  const counts = morningCounts(deals, activities, runs);
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
  const heroOther = hero.changes.find((c) => c !== heroLead);
  const heroEmail = cited(heroLead);
  const heroCompany = companies.find((c) => c.id === hero.deal.companyId)?.name ?? "";

  const ps = ctxFor("d-01");
  const psLead = ps.changes.find((c) => c.field === "closeDate") ?? ps.changes[0];
  const psEmail = cited(psLead);

  const bon = scoreboard?.recommenders.bonjour;
  const naive = scoreboard?.recommenders.naive;

  const morning = [
    {
      at: "07:58",
      title: "It reads the overnight mail",
      body: `${counts.activities} emails, calls and meeting notes across ${counts.deals} deals, oldest first, including the P.S. and the forwarded thread it should ignore.`,
    },
    {
      at: "07:59",
      title: "It proposes changes, with receipts",
      body: `${counts.proposed} proposed changes to stage, amount, close date, next step, contacts and risks. Each one carries a reason and a quote.`,
    },
    {
      at: "08:00",
      title: "It checks every quote",
      body: `Plain code looks for each quote word for word in the activity it points at. ${counts.cited} of ${counts.proposed} were found. A quote that is not there gets struck through and cannot be approved.`,
    },
    {
      at: "08:30",
      title: "You read the brief over coffee",
      body: "Click a quote and the sentence lights up inside the email. Approve or reject each change. Nothing touches the record until you do.",
    },
  ];

  return (
    <div className="overflow-x-clip">
      <header className="absolute inset-x-0 top-0 z-30">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 sm:h-20 sm:px-6">
          <Link href="/" aria-label="Bonjour home">
            <Logo />
          </Link>
          <nav className="hidden items-center gap-6 text-[13.5px] text-ink-2 md:flex">
            <a href="#morning" className="transition-colors hover:text-ink">
              How it works
            </a>
            <a href="#eval" className="transition-colors hover:text-ink">
              Eval
            </a>
            <a href={GITHUB} className="transition-colors hover:text-ink">
              Source code
            </a>
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
        {/* Hero: the product as small objects floating in a morning sky */}
        <section className="relative isolate">
          <div className="absolute inset-0 -z-10">
            <Image src={dawn} alt="" fill priority placeholder="blur" sizes="100vw" className="photo-dim object-cover object-[50%_35%]" />
            <div className="absolute inset-0 bg-gradient-to-b from-bg/30 via-bg/0 to-bg" />
            <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-b from-bg/0 to-bg" />
          </div>

          <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-32 sm:px-6 sm:pt-40 lg:min-h-[920px]">
            <div className="mx-auto max-w-[600px] text-center">
              <h1 className="rise font-serif text-[40px] font-normal leading-[1.04] tracking-[-0.03em] text-ink sm:text-[54px]">
                Every CRM update, with the line it <em className="italic">came from.</em>
              </h1>
              <p className="rise mx-auto mt-5 max-w-[46ch] text-[16.5px] leading-relaxed text-ink-2" style={v({ "--i": 1 })}>
                Bonjour reads your deal emails and calls each morning, proposes record updates, and shows the exact sentence behind each one.
              </p>
              <div className="rise mt-8 flex flex-wrap justify-center gap-2.5" style={v({ "--i": 2 })}>
                <Link href="/login" className={`${btn.primary} h-10 px-5 text-sm`}>
                  Try the demo
                </Link>
                <a href={GITHUB} className={`${btn.secondary} h-10 px-5 text-sm`}>
                  Read the code
                </a>
              </div>
            </div>

            {/* The lead card, in focus at every width */}
            {heroLead && (
              <div className="rise relative z-10 mx-auto mt-14 max-w-[400px] sm:mt-16" style={v({ "--i": 4 })}>
                <div inert className="tilt drift glass rounded-[22px] p-1.5" style={v({ "--dur": "10s", "--lift": "-6px" })}>
                  <ChangeCard change={heroLead} contacts={hero.contacts} source={source(heroLead)} active actions={<FakeActions />} />
                </div>
              </div>
            )}

            {/* Supporting objects at different depths, only where there is room for them */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden xl:block">
              <Float className="left-[2%] top-[170px] w-[232px]" tilt="-3deg" dur="11s" delay="-2s" i={5}>
                <div className="rounded-[16px] bg-surface/70 p-4">
                  <p className="font-mono text-[10.5px] text-muted">{longDay(TODAY)}</p>
                  <p className="mt-1 font-serif text-[22px] leading-tight tracking-[-0.01em] text-ink">
                    Bonjour, <em>Alex.</em>
                  </p>
                  <dl className="mt-3 space-y-1.5 text-[12px]">
                    {[
                      [counts.withChanges, "deals with changes"],
                      [counts.atRisk, "deals at risk"],
                      [counts.needsReply, "waiting on your reply"],
                    ].map(([n, label]) => (
                      <div key={label} className="flex items-baseline gap-2.5">
                        <dt className="w-6 text-right font-serif text-[20px] leading-none text-ink">{n}</dt>
                        <dd className="text-ink-2">{label}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </Float>

              <Float className="right-[2%] top-[112px] w-[248px]" tilt="2.5deg" dur="12s" delay="-5s" i={6}>
                <div className="rounded-[16px] bg-surface/75 p-3.5">
                  <div className="flex items-start gap-2.5">
                    <Monogram name={heroCompany} />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[13px] font-medium leading-snug text-ink">{heroCompany}</span>
                      <span className="block text-xs text-muted">{dealTitle(hero.deal.name)}</span>
                    </span>
                    <span className="mt-1 size-2 shrink-0 rounded-full bg-accent shadow-[0_0_0_3px_var(--accent-soft)]" />
                  </div>
                  <div className="mt-3 flex items-center justify-between font-mono text-[11.5px]">
                    <span className="text-ink">{money(hero.deal.amount)}</span>
                    <span className="text-muted">close {day(hero.deal.closeDate)}</span>
                  </div>
                  <div className="mt-2.5">
                    <StageBadge stage={hero.deal.stage} />
                  </div>
                </div>
              </Float>

              {heroEmail && heroLead && (
                <Float className="left-[calc(50%-600px)] top-[600px] w-[360px]" tilt="-1.5deg" dur="13s" delay="-7s" i={7}>
                  <ActivityItem activity={heroEmail} highlight={findQuote(heroEmail.body, heroLead.evidence.quote)} clip />
                </Float>
              )}

              {heroOther && (
                <Float className="right-[calc(50%-610px)] top-[560px] w-[320px] opacity-80 blur-[1.5px]" tilt="2deg" dur="14s" delay="-3s" i={8}>
                  <ChangeCard change={heroOther} contacts={hero.contacts} source={source(heroOther)} />
                </Float>
              )}
            </div>
          </div>
        </section>

        {/* A morning with Bonjour, told in time stamps */}
        <section id="morning" className="scroll-mt-16">
          <div className="mx-auto grid max-w-6xl gap-12 px-4 py-24 sm:px-6 sm:py-32 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
            <div className="reveal lg:sticky lg:top-24 lg:self-start">
              <h2 className="font-serif text-[36px] font-normal leading-[1.08] tracking-[-0.025em] text-ink sm:text-[44px]">
                How a morning with Bonjour goes
              </h2>
              <p className="mt-4 max-w-[42ch] text-[15px] leading-relaxed text-ink-2">
                The counts are from the demo workspace and the last committed run. The clock times are an example morning.
              </p>
            </div>
            <ol className="relative">
              <span aria-hidden="true" className="absolute bottom-3 left-[7px] top-3 w-px bg-gradient-to-b from-accent/70 via-line-strong to-line" />
              {morning.map((m, i) => (
                <li key={m.at} className="reveal relative grid grid-cols-[15px_minmax(0,1fr)] gap-x-5 pb-12 last:pb-0">
                  <span
                    aria-hidden="true"
                    className={`mt-[7px] size-[15px] rounded-full border-2 border-bg ${i === 0 ? "bg-accent shadow-[0_0_0_4px_var(--accent-soft)]" : "bg-line-strong"}`}
                  />
                  <div>
                    <time className="font-mono text-[12px] text-muted">{m.at}</time>
                    <h3 className="mt-1 font-serif text-[24px] leading-snug tracking-[-0.015em] text-ink">{m.title}</h3>
                    <p className="mt-2 max-w-[58ch] text-[15px] leading-relaxed text-ink-2">{m.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* The P.S. showcase: one letter on a desk of morning light */}
        {psEmail && psLead && (
          <section className="px-3 sm:px-6">
            <div className="mx-auto max-w-6xl">
              <div className="reveal max-w-[60ch] px-1 sm:px-0">
                <h2 className="font-serif text-[36px] font-normal leading-[1.08] tracking-[-0.025em] text-ink sm:text-[44px]">
                  The delay was in the <em>P.S.</em>
                </h2>
                <p className="mt-4 text-[15px] leading-relaxed text-ink-2">
                  A long, happy email about a good sandbox week. The only line that matters is at the very bottom. Bonjour moves the close date, flags the risk, and points
                  at that line so you can check it in a second.
                </p>
              </div>

              <div className="relative mt-10 overflow-hidden rounded-[28px] border border-line">
                <Image src={peaks} alt="Snowy peaks above a low layer of cloud under a pink morning sky" fill sizes="(min-width: 1200px) 1152px, 100vw" className="photo-dim object-cover" />
                <div className="sweep-view relative grid items-center gap-6 p-4 sm:p-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-10 lg:p-14">
                  <div inert className="tilt min-w-0 rounded-[20px] bg-surface/40 p-1.5 shadow-float sm:p-2" style={v({ "--tilt": "-1deg" })}>
                    <ActivityItem activity={psEmail} highlight={findQuote(psEmail.body, psLead.evidence.quote)} clip />
                  </div>
                  <div inert className="grid min-w-0 gap-3">
                    {ps.changes.map((c, i) => (
                      <div key={i} className="glass min-w-0 rounded-[20px] p-1.5">
                        <ChangeCard change={c} contacts={ps.contacts} source={source(c)} active={c === psLead} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <dl className="reveal mt-8 grid gap-x-10 gap-y-3 px-1 text-[13.5px] sm:grid-cols-2 sm:px-0">
                {RECOMMENDERS.filter((id) => id !== "bonjour").map((id) => {
                  const run = scoreboard?.recommenders[id];
                  const s = run?.status === "ran" ? run.perDeal.find((p) => p.dealId === "d-01") : undefined;
                  return (
                    <div key={id} className="flex gap-4 border-t border-line pt-3">
                      <dt className="w-28 shrink-0 font-serif text-[16px] text-ink">{REC_LABEL[id]}</dt>
                      <dd className="text-ink-2">{s ? describe(s) : "not run yet"}</dd>
                    </div>
                  );
                })}
              </dl>
            </div>
          </section>
        )}

        {/* Eval */}
        {scoreboard && (
          <section id="eval" className="scroll-mt-16">
            <div className="mx-auto max-w-4xl px-4 py-24 sm:px-6 sm:py-32">
              <h2 className="reveal font-serif text-[36px] font-normal leading-[1.08] tracking-[-0.025em] text-ink sm:text-[44px]">
                An honest eval, <em>small on purpose.</em>
              </h2>
              {bon?.status === "ran" && (
                <p className="reveal mt-4 max-w-[62ch] text-[15px] leading-relaxed text-ink-2">
                  {bon.aggregate.deals} hand-written deals, each with one trap. Bonjour got {bon.aggregate.correct} of {bon.aggregate.expected} expected changes right
                  {naive?.status === "ran" ? `, against ${naive.aggregate.correct} for a naive prompt that proposed ${naive.aggregate.spurious} changes nobody needed` : ""}.
                </p>
              )}
              <div className="reveal mt-10">
                <EvalTable board={scoreboard} compact />
              </div>
              <p className="mt-5 max-w-[70ch] text-[13px] leading-relaxed text-muted">{CAVEAT}</p>
              <Link
                href="/app/eval"
                className="group mt-5 inline-flex items-center gap-1.5 text-[13.5px] font-medium text-accent-text underline decoration-accent/40 underline-offset-4 hover:decoration-accent"
              >
                See every deal and every proposed change
                <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </section>
        )}

        {/* Open source + MCP */}
        <section className="border-t border-line">
          <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6 sm:py-32">
            <h2 className="reveal font-serif text-[36px] font-normal leading-[1.08] tracking-[-0.025em] text-ink sm:text-[44px]">
              Open source. Works from any MCP client.
            </h2>
            <p className="reveal mx-auto mt-4 max-w-[54ch] text-[15px] leading-relaxed text-ink-2">
              MIT licensed. The same agent runs behind an MCP server with three tools: list deals, read one, and propose updates with citations. Point your assistant at it and
              ask what changed.
            </p>
            <div className="reveal mx-auto mt-10 max-w-[520px] rounded-[22px] bg-[#16130f] p-1.5 text-left shadow-float ring-1 ring-line">
              <div className="flex items-center gap-1.5 px-3 pb-1.5 pt-1">
                <span className="font-mono text-[11px] text-[#a39a8e]">mcp.json</span>
              </div>
              <pre className="overflow-x-auto rounded-[16px] bg-[#221e1a] p-5 font-mono text-[12.5px] leading-relaxed text-[#e9e2d8] shadow-[inset_0_1px_0_rgb(255_255_255/0.06)]">
                <code>{MCP_SNIPPET}</code>
              </pre>
            </div>
            <a href={GITHUB} className={`${btn.secondary} mt-8 h-10 px-5 text-sm`}>
              <Code size={15} />
              <span className="font-mono text-[12.5px]">anushapundir/bonjour</span>
              <ArrowUpRight size={13} className="text-muted" />
            </a>
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 text-[13px] text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <Logo />
          <p>
            MIT licensed. Built by{" "}
            <a href="https://anushapundir.vercel.app" className="text-ink-2 underline decoration-line-strong underline-offset-2 hover:text-ink">
              Anusha Pundir
            </a>
            . Sky photos from Unsplash, credited in the README.
          </p>
          <a href={GITHUB} className="hover:text-ink">
            Source code
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

// A decorative copy of a real component, floating in the hero at its own depth and pace.
function Float({ className, tilt, dur, delay, i, children }: { className: string; tilt: string; dur: string; delay: string; i: number; children: React.ReactNode }) {
  return (
    <div className={`rise absolute ${className}`} style={v({ "--i": i })}>
      <div inert className="tilt drift glass rounded-[20px] p-1.5" style={v({ "--tilt": tilt, "--dur": dur, "--delay": delay })}>
        {children}
      </div>
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
