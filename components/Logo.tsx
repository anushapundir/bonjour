// A half sun coming up over the horizon, with three short rays.
export function Mark({ className = "size-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none">
      <path d="M6.5 16.5a5.5 5.5 0 0 1 11 0Z" fill="var(--accent)" />
      <path d="M2.75 16.5h18.5" stroke="var(--ink)" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M12 5.25v2.1M5.6 7.9l1.45 1.45M18.4 7.9l-1.45 1.45" stroke="var(--accent)" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M7 19.75h10" stroke="var(--ink)" strokeOpacity=".35" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <Mark />
      <span className="font-serif text-[21px] font-medium leading-none tracking-[-0.02em] text-ink">bonjour</span>
    </span>
  );
}
