// A black rounded square with a lowercase b, next to the wordmark.
export function Mark({ className = "size-[22px]" }: { className?: string }) {
  return (
    <span aria-hidden="true" className={`grid shrink-0 place-items-center rounded-[6px] bg-ink text-[14px] font-semibold leading-none text-bg ${className}`}>
      <span className="-mt-px">b</span>
    </span>
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <Mark />
      <span className="text-[17px] font-medium leading-none tracking-[-0.03em] text-ink">bonjour</span>
    </span>
  );
}
