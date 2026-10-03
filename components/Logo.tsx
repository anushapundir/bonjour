export function Mark({ className = "size-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <rect width="24" height="24" rx="6.5" fill="var(--accent)" />
      <path d="M8.2 15.2a3.8 3.8 0 0 1 7.6 0Z" fill="var(--accent-ink)" />
      <path d="M5.5 15.2h13" stroke="var(--accent-ink)" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <Mark />
      <span className="text-[15px] font-semibold tracking-tight text-ink">bonjour</span>
    </span>
  );
}
