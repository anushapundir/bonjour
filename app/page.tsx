import { ArrowRight, ArrowUpRight, CheckCircle, GithubLogo, Quotes } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { ActivityItem, personName } from "../components/deal/ActivityItem";
import { ChangeCard } from "../components/deal/ChangeCard";
import { CAVEAT, EvalTable, REC_LABEL } from "../components/EvalTable";
import { Logo } from "../components/Logo";
import { morningCounts } from "../components/morning";
import { NAV_GROUPS } from "../components/nav";
import { ThemeToggle } from "../components/ThemeToggle";
import { HUES, Monogram, Square, StageBadge, btn, stageTone } from "../components/ui";
import { appData, loadLabels } from "../lib/app-data";
import { findQuote } from "../lib/apply";
import { FIELD_LABEL, day, dealTitle, longDay, money, show, stamp } from "../lib/format";
import type { Scoreboard } from "../lib/results";
import type { DealScore } from "../lib/score";
import { TODAY } from "../lib/today";
import { RECOMMENDERS, type Activity, type RecommenderId } from "../lib/types";
import type { VerifiedChange } from "../lib/verify";

const GITHUB = "https://github.com/anushapundir/bonjour";
const v = (vars: Record<string, string | number>) => vars as React.CSSProperties;

export default function Landing() {
  const { deals, activities, contacts, companies, runs, scoreboard } = appData();
  const labels = loadLabels();
  const counts = morningCounts(deals, activities, runs);
  const companyOf = (dealId: string) => companies.find((c) => c.id === deals.find((d) => d.id === dealId)?.companyId)?.name ?? "";
  const source = (c: VerifiedChange) => {
    const a = activities.find((x) => x.id === c.evidence.activityId);
    return a ? `${a.kind === "email" ? "Email" : a.kind === "call" ? "Call" : "Note"}, ${day(a.at)}` : undefined;
  };
  // A quote shown on this page must appear word for word in the fixture it names, or it is not shown.
  const exact = (activityId: string, text: string) => (activities.find((a) => a.id === activityId)?.body.includes(text) ? text : null);
  const score = (id: RecommenderId, dealId: string) => {
    const run = scoreboard?.recommenders[id];
    return run?.status === "ran" ? run.perDeal.find((p) => p.dealId === dealId) : undefined;
  };

  // The hero deal: the delay hidden in a P.S.
  const deal = deals.find((d) => d.id === "d-01")!;
  const dealContacts = contacts.filter((c) => c.companyId === deal.companyId);
  const changes = runs[deal.id]?.bonjour ?? [];
  const lead = changes.find((c) => c.field === "closeDate") ?? changes[0];
  const leadEmail = activities.find((a) => a.id === lead?.evidence.activityId);
  const company = companyOf(deal.id);
  const dealActivities = activities.filter((a) => a.dealId === deal.id).sort((a, b) => b.at.localeCompare(a.at));

  const agg = (id: RecommenderId) => {
    const run = scoreboard?.recommenders[id];
    return run?.status === "ran" ? run.aggregate : undefined;
  };
  const bon = agg("bonjour");
  const naive = agg("naive");

  const traps = [
    {
      dealId: "d-01",
      activityId: "a-01-4",
      quote: "all new software spend is on hold until our fiscal year starts in January, so we won't be able to sign anything before February 1",
      bg: "#0a0a0a",
    },
    { dealId: "d-02", activityId: "a-02-4", quote: "Sure, another price increase, sounds great.", bg: "#7f1d1d" },
    { dealId: "d-05", activityId: "a-05-3", quote: "my last day here is the 20th.", bg: "#dc2626" },
    { dealId: "d-08", activityId: "a-08-2", quote: "If we went to 40 seats, what would that look like for the year?", bg: "#1c1c1c" },
    { dealId: "d-06", activityId: "a-06-4", quote: "I am out of the office until Monday, October 12 with limited access to email.", bg: "#f3f3f2", light: true },
    { dealId: "d-12", activityId: "a-12-4", quote: "Jordan will sign next Tuesday.", bg: "#450a0a" },
  ]
    .map((t) => ({ ...t, quote: exact(t.activityId, t.quote), trap: labels.find((l) => l.dealId === t.dealId)?.trap ?? "" }))
    .filter((t) => t.quote);

  const proposal = deals.filter((d) => d.stage === "Proposal");
  const seats = activities.find((a) => a.id === "a-08-4");
  const seatsQuote = exact("a-08-4", "let's do 32 seats to start and add more in the spring");
  const psText = exact(
    "a-01-4",
    "P.S. Before I forget: Glen told us on Thursday that all new software spend is on hold until our fiscal year starts in January, so we won't be able to sign anything before February 1.",
  );
  const psMark = "we won't be able to sign anything before February 1";

  return (
    <div className="overflow-x-clip">
      <header className="nav-edge sticky top-0 z-30 border-b bg-bg/95 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-8 px-4 sm:px-6 md:grid md:grid-cols-[1fr_auto_1fr]">
          <Link href="/" aria-label="Bonjour home" className="justify-self-start">
            <Logo />
          </Link>
          <nav className="hidden items-center gap-6 text-[13.5px] text-muted md:flex">
            <a href="#how" className="transition-colors hover:text-ink">
              How it works
            </a>
            <a href="#eval" className="transition-colors hover:text-ink">
              Eval
            </a>
            <a href={GITHUB} className="transition-colors hover:text-ink">
              Source code
            </a>
          </nav>
          <div className="ml-auto flex items-center gap-1.5 justify-self-end sm:gap-3">
            <ThemeToggle />
            <Link href="/login" className="hidden px-1 text-[13.5px] text-ink-2 transition-colors hover:text-ink sm:block">
              Sign in
            </Link>
            <Link href="/login" className={btn.primary}>
              Try the demo
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="mx-auto max-w-6xl px-4 pt-14 sm:px-6 sm:pt-20">
          <div className="rise flex gap-1.5" aria-hidden="true">
            {[HUES.violet, HUES.green, HUES.blue, HUES.orange].map((c) => (
              <Square key={c} color={c} className="size-3.5" />
            ))}
          </div>
          <h1 className="rise mt-5 max-w-[640px] text-[36px] font-medium leading-[1.08] tracking-[-0.035em] text-ink sm:text-[56px]" style={v({ "--i": 1 })}>
            Every CRM update, with the line it came from.
          </h1>
          <p className="rise mt-4 max-w-[52ch] text-[16px] leading-relaxed text-muted sm:text-[17px]" style={v({ "--i": 2 })}>
            Bonjour reads your deal emails and calls, proposes record updates, and shows the exact sentence behind each one.
          </p>
          <div className="rise mt-7 flex flex-wrap gap-2" style={v({ "--i": 3 })}>
            <Link href="/login" className={`${btn.primary} h-9 px-4`}>
              Try the demo
            </Link>
            <a href={GITHUB} className={`${btn.secondary} h-9 px-4`}>
              Read the code
            </a>
          </div>

          {/* The product, built from the app's own components and the d-01 fixture */}
          {lead && leadEmail && (
            <div className="rise mt-12 sm:mt-14" style={v({ "--i": 4 })}>
              <div inert className="relative hidden rounded-[20px] bg-surface-2 py-10 pl-[188px] pr-10 lg:block">
                <Window title={`${company} / ${dealTitle(deal.name)}`}>
                  <div className="grid grid-cols-[176px_minmax(0,1fr)]">
                    <div className="border-r border-line px-3 py-4">
                      <SideNav active="/app/deals" />
                    </div>
                    <div className="min-w-0 p-5">
                      <div className="flex items-center gap-2.5">
                        <Monogram name={company} className="size-7 text-[11px]" />
                        <p className="truncate text-[15px] font-medium tracking-[-0.015em] text-ink">{deal.name}</p>
                        <StageBadge stage={deal.stage} />
                      </div>
                      <div className="mt-4 grid grid-cols-[minmax(0,1fr)_292px] gap-4">
                        <div className="min-w-0 space-y-3">
                          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-[10px] border border-line bg-line">
                            {[
                              ["Amount", money(deal.amount)],
                              ["Close date", day(deal.closeDate)],
                              ["Owner", deal.ownerName],
                              ["Contacts", String(deal.contactIds.length)],
                            ].map(([k, val]) => (
                              <div key={k} className="bg-surface px-3 py-2">
                                <dt className="text-[11.5px] text-muted">{k}</dt>
                                <dd className="mt-0.5 font-mono text-[12.5px] text-ink">{val}</dd>
                              </div>
                            ))}
                          </dl>
                          <ActivityItem activity={leadEmail} highlight={findQuote(leadEmail.body, lead.evidence.quote)} clip />
                        </div>
                        <div className="min-w-0 space-y-2">
                          <p className="flex items-center justify-between text-[12px] font-medium text-ink">
                            Proposed changes <span className="font-mono font-normal text-muted">{changes.length}</span>
                          </p>
                          {changes.map((c, i) => (
                            <ChangeCard key={i} change={c} contacts={dealContacts} source={source(c)} active={c === lead} actions={c === lead ? <FakeActions /> : undefined} />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </Window>

                {bon && naive && (
                  <Window title="Eval, 12 deals" className="absolute bottom-10 left-10 w-[340px]">
                    <MiniScore board={scoreboard!} />
                  </Window>
                )}
              </div>

              {/* Phone and tablet: just the change and the line it came from */}
              <div inert className="grid grid-cols-[minmax(0,1fr)] gap-2.5 rounded-[16px] bg-surface-2 p-3 sm:p-5 lg:hidden">
                <ChangeCard change={lead} contacts={dealContacts} source={source(lead)} active actions={<FakeActions />} />
                <ActivityItem activity={leadEmail} highlight={findQuote(leadEmail.body, lead.evidence.quote)} clip />
              </div>
            </div>
          )}
        </section>

        {/* How it works */}
        <section id="how" className="scroll-mt-14">
          <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32">
            <h2 className="reveal text-[26px] font-medium leading-[1.2] tracking-[-0.03em] sm:text-[34px]">
              <span className="block text-ink">
                Reads your deal emails and calls
                <Sup n="01" />
              </span>
              <span className="block text-muted">
                Proposes updates with the exact sentence
                <Sup n="02" />
              </span>
              <span className="block text-muted">
                You approve, nothing changes without a click
                <Sup n="03" />
              </span>
            </h2>

            <div className="mt-12 grid gap-8 md:grid-cols-3 md:gap-4">
              <Step n="01" title="Read" body={`Every email, call and meeting note on a deal, oldest first. ${counts.activities} of them across ${counts.deals} deals in the demo.`}>
                <ul className="w-full max-w-[290px] divide-y divide-line overflow-hidden rounded-[10px] border border-line bg-surface shadow-panel">
                  {dealActivities.slice(0, 3).map((a) => (
                    <ActivityRow key={a.id} a={a} />
                  ))}
                </ul>
              </Step>
              <Step n="02" title="Propose" body="Each change carries a reason and a quote. Plain code checks the quote is really in that email before you see it.">
                <div className="w-full max-w-[290px] rounded-[10px] border border-line bg-surface p-3.5 shadow-panel">
                  <p className="text-[12px] font-medium text-muted">{FIELD_LABEL.closeDate}</p>
                  <p className="mt-1.5 flex items-center gap-2 text-[14px]">
                    <span className="text-muted line-through decoration-faint">{day(deal.closeDate)}</span>
                    <ArrowRight size={12} className="text-muted" />
                    <span className="font-medium text-ink">{lead ? show("closeDate", lead.to, dealContacts) : ""}</span>
                  </p>
                  {psMark && exact("a-01-4", psMark) && (
                    <p className="mt-3 flex min-w-0 items-center gap-1.5 rounded-[6px] border border-line bg-surface-2 px-1.5 py-1 text-[11.5px]">
                      <Quotes size={12} weight="fill" className="shrink-0 text-ink" />
                      <span className="truncate text-muted">&ldquo;{psMark}&rdquo;</span>
                    </p>
                  )}
                </div>
              </Step>
              <Step n="03" title="Approve" body="Approve or reject each change. A change whose quote cannot be found is struck through and cannot be approved.">
                <div className="flex flex-col items-center gap-3">
                  <div className="flex gap-2">
                    <span className={`${btn.secondary} h-9 px-4`}>Reject</span>
                    <span className={`${btn.primary} h-9 px-4`}>Approve</span>
                  </div>
                  <p className="flex items-center gap-1.5 text-[12.5px] text-ink-2">
                    <CheckCircle size={15} weight="fill" className="text-good" />
                    Close date updated to {lead ? show("closeDate", lead.to, dealContacts) : ""}
                  </p>
                </div>
              </Step>
            </div>
          </div>
        </section>

        {/* Bento */}
        <section className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="reveal text-[26px] font-medium leading-[1.15] tracking-[-0.03em] text-ink sm:text-[34px]">What the morning review looks like</h2>
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Tile title="Morning brief" body="Three counts and the changes worth a look, before the first call.">
              <div className="w-[236px] rounded-[10px] border border-line bg-surface p-3.5 shadow-panel">
                <p className="font-mono text-[10.5px] text-muted">{longDay(TODAY)}</p>
                <p className="mt-0.5 text-[15px] font-medium tracking-[-0.02em] text-ink">Bonjour, Alex</p>
                <dl className="mt-3 space-y-1.5 text-[12px]">
                  {(
                    [
                      [counts.withChanges, "deals with changes", HUES.blue],
                      [counts.atRisk, "deals at risk", HUES.red],
                      [counts.needsReply, "waiting on your reply", HUES.amber],
                    ] as const
                  ).map(([n, label, c]) => (
                    <div key={label} className="flex items-center gap-2">
                      <Square color={c} className="size-2 rounded-[2px]" />
                      <dt className="w-5 font-mono text-[13px] font-medium text-ink">{n}</dt>
                      <dd className="text-ink-2">{label}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </Tile>

            <Tile title="Pipeline" body="A board by stage. A yellow dot means Bonjour has something for you to review.">
              <div className="w-[236px] rounded-[10px] bg-surface/70 p-1.5 ring-1 ring-line">
                <p className="flex items-center gap-2 px-1.5 pb-1.5 pt-0.5 text-[12px] font-medium text-ink">
                  <Square color={stageTone("Proposal")} className="size-2.5 rounded-[3px]" />
                  Proposal <span className="font-mono font-normal text-muted">{proposal.length}</span>
                </p>
                <div className="space-y-1.5">
                  {proposal.slice(0, 2).map((d) => (
                    <div key={d.id} className="rounded-[8px] border border-line bg-surface p-2.5 shadow-panel">
                      <p className="flex items-center gap-2 text-[12px] font-medium text-ink">
                        <Monogram name={companyOf(d.id)} className="size-5 text-[9px]" />
                        <span className="truncate">{companyOf(d.id)}</span>
                        {(runs[d.id]?.bonjour ?? []).some((c) => c.supported) && <span className="ml-auto size-1.5 shrink-0 rounded-full bg-[#eab308]" />}
                      </p>
                      <p className="mt-1.5 flex justify-between font-mono text-[10.5px] text-muted">
                        <span className="text-ink">{money(d.amount)}</span>
                        close {day(d.closeDate)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </Tile>

            <Tile title="Evidence chips" body="Click the chip and the sentence lights up inside the email or call note.">
              {seats && seatsQuote && (
                <div className="flex max-w-[270px] items-center gap-1.5 rounded-[6px] border border-[color-mix(in_srgb,var(--mark)_60%,var(--line-strong))] bg-mark-soft px-2 py-1.5 text-[12px] shadow-panel">
                  <Quotes size={13} weight="fill" className="shrink-0 text-ink" />
                  <span className="shrink-0 font-mono text-[10.5px] text-ink-2">Call, {day(seats.at)}</span>
                  <span className="truncate text-ink-2">&ldquo;{seatsQuote}&rdquo;</span>
                </div>
              )}
            </Tile>

            <Tile title="Catches what people skim" body="The delay was in the P.S. of a long, happy email. Bonjour moved the close date and flagged the risk.">
              {psText && (
                <p className="sweep-view w-full max-w-[290px] rounded-[10px] border border-line bg-surface p-3.5 text-[12.5px] leading-[1.6] text-ink-2 shadow-panel">
                  {psText.split(psMark)[0]}
                  <mark className="evidence">{psMark}</mark>
                  {psText.split(psMark)[1]}
                </p>
              )}
            </Tile>

            <Tile title="Compared with a plain prompt" body="Same model, same output shape, a one-line prompt. Correct changes out of 15 expected.">
              <div className="grid w-[260px] grid-cols-3 gap-1.5">
                {RECOMMENDERS.map((id) => {
                  const a = agg(id);
                  const mine = id === "bonjour";
                  return (
                    <div key={id} className={`rounded-[8px] border px-2.5 py-2.5 ${mine ? "border-ink bg-surface shadow-panel" : "border-line bg-surface/60"}`}>
                      <p className={`font-mono text-[22px] font-medium leading-none tracking-[-0.03em] ${mine ? "text-ink" : "text-muted"}`}>{a ? a.correct : "n/a"}</p>
                      <p className="mt-2 truncate text-[11px] text-muted">{REC_LABEL[id]}</p>
                    </div>
                  );
                })}
              </div>
            </Tile>

            <Tile title="MCP server" body="The same agent behind three tools. Point any MCP client at it and ask what changed.">
              <div className="w-full max-w-[290px] rounded-[10px] bg-[#0a0a0a] p-3.5 font-mono text-[11.5px] leading-[1.7] text-[#a3a3a3] shadow-panel ring-1 ring-white/10">
                <p>
                  <span className="text-[#525252]">$</span> <span className="text-white">npm run mcp</span>
                </p>
                <p className="text-[#86efac]">list_deals</p>
                <p className="text-[#86efac]">get_deal</p>
                <p className="text-[#86efac]">propose_updates</p>
              </div>
            </Tile>
          </div>
        </section>

        {/* The traps */}
        <section className="py-24 sm:py-32">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="reveal max-w-[22ch] text-[26px] font-medium leading-[1.15] tracking-[-0.03em] text-ink sm:text-[34px]">Twelve test deals. Each one hides a trap.</h2>
            <p className="reveal mt-3 max-w-[56ch] text-[15px] leading-relaxed text-muted">
              Six of them, with the line that sets the trap and what each recommender did in the committed run.
            </p>
          </div>
          {/* Starts on the content edge and bleeds off the right of the viewport */}
          <ul
            className="no-bar mt-10 flex snap-x snap-mandatory gap-3 overflow-x-auto px-[var(--edge)] pb-2 [--edge:1rem] [scroll-padding-inline:var(--edge)] sm:[--edge:max(1.5rem,calc((100vw-72rem)/2+1.5rem))]"
            aria-label="Traps from the test set"
          >
            {traps.map((t) => {
              const ink = t.light ? "text-[#0a0a0a]" : "text-white";
              const soft = t.light ? "text-[#525252]" : t.bg === "#dc2626" ? "text-white" : "text-white/70";
              return (
                <li key={t.dealId} className={`flex h-[420px] w-[272px] shrink-0 snap-start flex-col rounded-[10px] border border-line p-5 ${ink}`} style={{ background: t.bg }}>
                  <p className={`text-[12.5px] leading-snug ${soft}`}>{t.trap}</p>
                  <p className="mt-auto text-[17px] font-medium leading-snug tracking-[-0.015em]">&ldquo;{t.quote}&rdquo;</p>
                  <div className={`mt-6 border-t pt-3 ${t.light ? "border-black/10" : "border-white/15"}`}>
                    <p className="text-[13px] font-medium">{companyOf(t.dealId)}</p>
                    <dl className={`mt-2 space-y-1.5 text-[12px] leading-snug ${soft}`}>
                      {(["naive", "bonjour"] as const).map((id) => (
                        <div key={id}>
                          <dt className={`inline font-medium ${ink}`}>{REC_LABEL[id]}: </dt>
                          <dd className="inline">{outcome(score(id, t.dealId))}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Eval */}
        {scoreboard && (
          <section id="eval" className="scroll-mt-14 border-t border-line bg-canvas">
            <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32">
              <h2 className="reveal text-[26px] font-medium leading-[1.15] tracking-[-0.03em] text-ink sm:text-[34px]">An honest eval, small on purpose.</h2>
              {bon && (
                <p className="reveal mt-3 max-w-[62ch] text-[15px] leading-relaxed text-muted">
                  {bon.deals} hand-written deals, each with one trap. Bonjour got {bon.correct} of {bon.expected} expected changes right
                  {naive ? `, against ${naive.correct} for a naive prompt that proposed ${naive.spurious} changes nobody needed` : ""}.
                </p>
              )}
              <div className="reveal mt-10 max-w-4xl">
                <EvalTable board={scoreboard} compact />
              </div>
              <p className="mt-5 max-w-[72ch] text-[13px] leading-relaxed text-muted">{CAVEAT}</p>
              <Link
                href="/app/eval"
                className="group mt-5 inline-flex items-center gap-1.5 text-[13.5px] font-medium text-ink underline decoration-line-strong underline-offset-4 hover:decoration-ink"
              >
                See every deal and every proposed change
                <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </section>
        )}

        {/* Open source + MCP */}
        <section className="border-t border-line">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-24 sm:px-6 sm:py-32 lg:grid-cols-2 lg:gap-16">
            <div className="reveal">
              <h2 className="text-[26px] font-medium leading-[1.15] tracking-[-0.03em] text-ink sm:text-[34px]">Open source. Works from any MCP client.</h2>
              <p className="mt-3 max-w-[50ch] text-[15px] leading-relaxed text-muted">
                MIT licensed. The same agent runs behind an MCP server with three tools: list deals, read one, and propose updates with citations.
              </p>
              <a href={GITHUB} className={`${btn.secondary} mt-7 h-9 px-3.5`}>
                <GithubLogo size={15} />
                <span className="font-mono text-[12.5px]">anushapundir/bonjour</span>
                <ArrowUpRight size={13} className="text-muted" />
              </a>
            </div>
            <Window title="mcp.json" className="reveal min-w-0">
              <pre className="overflow-x-auto p-5 font-mono text-[12.5px] leading-relaxed text-ink-2">
                <code>{MCP_SNIPPET}</code>
              </pre>
            </Window>
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-[13px] text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <Logo />
          <p>
            MIT licensed. Built by{" "}
            <a href="https://anushapundir.vercel.app" className="text-ink-2 underline decoration-line-strong underline-offset-2 hover:text-ink">
              Anusha Pundir
            </a>
            .
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

function describe(s: DealScore) {
  if (s.verdicts.length === 0) return `Proposed nothing. Missed ${s.missed} of ${s.expected}.`;
  const parts = [`${s.correct} of ${s.expected} right`];
  if (s.missed) parts.push(`missed ${s.missed}`);
  if (s.wrongValue) parts.push(`${s.wrongValue} wrong`);
  if (s.spurious) parts.push(`${s.spurious} not needed`);
  if (s.unsupported) parts.push(`${s.unsupported} cited a quote that isn't there`);
  return parts.join(", ") + ".";
}

function outcome(s?: DealScore) {
  if (!s) return "not run yet.";
  if (s.noChangeDeal) {
    const n = s.verdicts.length;
    return s.untouched ? "Left the deal alone." : `Proposed ${n} ${n === 1 ? "change" : "changes"} nobody needed.`;
  }
  return describe(s);
}

function Window({ title, className = "", children }: { title?: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={`window ${className}`}>
      <div className="flex h-9 items-center gap-1.5 border-b border-line bg-surface px-3.5">
        <span className="size-2.5 rounded-full bg-[#ff5f57]" />
        <span className="size-2.5 rounded-full bg-[#febc2e]" />
        <span className="size-2.5 rounded-full bg-[#28c840]" />
        {title && <span className="ml-3 truncate text-[12px] text-muted">{title}</span>}
      </div>
      {children}
    </div>
  );
}

function SideNav({ active }: { active: string }) {
  return (
    <div className="space-y-4">
      {NAV_GROUPS.map((g) => (
        <div key={g.label}>
          <p className="mb-1 px-2 text-[11px] font-medium text-faint">{g.label}</p>
          {g.items.map(({ href, label, icon: Icon, color }) => (
            <p key={href} className={`flex h-7 items-center gap-2 rounded-[7px] px-2 text-[12.5px] ${href === active ? "bg-accent-soft font-medium text-ink" : "text-ink-2"}`}>
              <Square color={color} className="size-4 rounded-[4px]">
                <Icon size={10} weight="bold" />
              </Square>
              {label}
            </p>
          ))}
        </div>
      ))}
    </div>
  );
}

function MiniScore({ board }: { board: Scoreboard }) {
  const rows: [string, (a: NonNullable<ReturnType<typeof aggOf>>) => string][] = [
    ["Correct", (a) => `${a.correct}/${a.expected}`],
    ["Spurious", (a) => String(a.spurious)],
    ["Missed", (a) => String(a.missed)],
    ["Risk recall", (a) => (a.riskRecall === null ? "n/a" : `${Math.round(a.riskRecall * 100)}%`)],
  ];
  function aggOf(id: RecommenderId) {
    const r = board.recommenders[id];
    return r?.status === "ran" ? r.aggregate : undefined;
  }
  return (
    <table className="w-full text-[12px]">
      <thead>
        <tr className="border-b border-line text-[11px] text-muted">
          <th className="px-3.5 py-2 text-left font-normal" />
          {RECOMMENDERS.map((id) => (
            <th key={id} className={`px-2.5 py-2 text-right font-medium ${id === "bonjour" ? "bg-canvas text-ink" : "font-normal"}`}>
              {id === "rules" ? "Rules" : id === "naive" ? "Naive" : "Bonjour"}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-line">
        {rows.map(([label, f]) => (
          <tr key={label}>
            <th scope="row" className="px-3.5 py-2 text-left font-normal text-ink-2">
              {label}
            </th>
            {RECOMMENDERS.map((id) => {
              const a = aggOf(id);
              return (
                <td key={id} className={`px-2.5 py-2 text-right font-mono tabular-nums ${id === "bonjour" ? "bg-canvas font-medium text-ink" : "text-muted"}`}>
                  {a ? f(a) : "n/a"}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Sup({ n }: { n: string }) {
  return <sup className="ml-1 align-super font-mono text-[11px] font-normal tracking-normal text-faint">{n}</sup>;
}

function Step({ n, title, body, children }: { n: string; title: string; body: string; children: React.ReactNode }) {
  return (
    <div className="reveal">
      <div className="grid h-[232px] place-items-center rounded-[14px] border border-line bg-surface p-5">{children}</div>
      <p className="mt-5 font-mono text-[11px] text-[#ea580c]">{n}</p>
      <h3 className="mt-1 text-[15px] font-medium tracking-[-0.01em] text-ink">{title}</h3>
      <p className="mt-1 max-w-[38ch] text-[13.5px] leading-relaxed text-muted">{body}</p>
    </div>
  );
}

function Tile({ title, body, children }: { title: string; body: string; children: React.ReactNode }) {
  return (
    <div className="reveal flex flex-col rounded-[16px] bg-surface-2 p-5">
      <div className="grid h-[196px] place-items-center">{children}</div>
      <h3 className="mt-4 text-[15px] font-medium tracking-[-0.01em] text-ink">{title}</h3>
      <p className="mt-1 text-[13.5px] leading-relaxed text-muted">{body}</p>
    </div>
  );
}

function ActivityRow({ a }: { a: Activity }) {
  const color = a.kind === "email" ? HUES.blue : a.kind === "call" ? HUES.green : HUES.violet;
  return (
    <li className="flex items-center gap-2.5 px-3 py-2.5">
      <Square color={color} className="size-3 rounded-[3px]" />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[12px] font-medium text-ink">{personName(a.from)}</span>
        <span className="block truncate text-[11px] text-muted">{a.subject ?? `${a.kind[0]!.toUpperCase()}${a.kind.slice(1)} notes`}</span>
      </span>
      <time className="shrink-0 font-mono text-[10.5px] text-muted">{stamp(a.at)}</time>
    </li>
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
