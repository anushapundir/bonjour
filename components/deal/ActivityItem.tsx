import { CalendarBlank, EnvelopeSimple, NotePencil, Phone } from "@phosphor-icons/react/dist/ssr";
import { stamp } from "../../lib/format";
import type { Activity } from "../../lib/types";

const KIND = {
  email: { label: "Email", icon: EnvelopeSimple },
  call: { label: "Call", icon: Phone },
  note: { label: "Note", icon: NotePencil },
  meeting: { label: "Meeting", icon: CalendarBlank },
};

export const personName = (from: string) => from.replace(/\s*<.*>\s*$/, "").trim();

type Props = {
  activity: Activity;
  highlight?: { start: number; end: number } | null;
  // Only show the paragraph around the highlight, for small previews.
  clip?: boolean;
};

export function ActivityItem({ activity, highlight, clip }: Props) {
  const { icon: Icon, label } = KIND[activity.kind];
  let body = activity.body;
  let range = highlight ?? null;
  if (clip && range) {
    const start = body.lastIndexOf("\n\n", range.start) + 1;
    const nextBreak = body.indexOf("\n\n", range.end);
    const end = nextBreak === -1 ? body.length : nextBreak;
    body = body.slice(start, end).trim();
    const offset = activity.body.indexOf(body);
    range = { start: range.start - offset, end: range.end - offset };
  }

  return (
    <article id={activity.id} className="scroll-mt-24 rounded-lg border border-line bg-surface">
      <header className="flex items-start gap-3 border-b border-line px-4 py-3">
        <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-md bg-surface-2 text-muted">
          <Icon size={15} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
            <p className="truncate text-[13px] text-ink">
              <span className="font-medium">{personName(activity.from)}</span>
              {activity.to && <span className="text-muted"> to {personName(activity.to)}</span>}
            </p>
            <time dateTime={activity.at} className="shrink-0 text-xs tabular-nums text-muted">
              {label}, {stamp(activity.at)}
            </time>
          </div>
          {activity.subject && <p className="mt-0.5 truncate text-[13px] font-medium text-ink-2">{activity.subject}</p>}
        </div>
      </header>
      <div className="whitespace-pre-wrap break-words px-4 py-3 text-[13.5px] leading-relaxed text-ink-2">
        {range ? (
          <>
            {body.slice(0, range.start)}
            <mark id={`mark-${activity.id}`} className="evidence">
              {body.slice(range.start, range.end)}
            </mark>
            {body.slice(range.end)}
          </>
        ) : (
          body
        )}
      </div>
    </article>
  );
}
