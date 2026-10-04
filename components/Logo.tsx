// The bonjour mark: a lowercase b whose bowl holds a rising sun, next to the wordmark.
export function Mark({ className = "size-[22px]" }: { className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src="/bonjour-mark.png" alt="" aria-hidden="true" className={`shrink-0 rounded-[6px] object-cover ${className}`} />;
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <Mark />
      <span className="text-[17px] font-medium leading-none tracking-[-0.03em] text-ink">bonjour</span>
    </span>
  );
}
