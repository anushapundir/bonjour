"use client";

import { useActionState, useRef } from "react";
import { btn } from "../../components/ui";
import { DEMO_EMAIL, DEMO_PASSWORD } from "../../lib/demo";
import { signIn } from "./actions";

const input =
  "h-10 w-full rounded-[12px] border border-line-strong bg-bg px-3.5 text-sm text-ink shadow-[inset_0_1px_2px_rgb(70_45_20/0.06)] placeholder:text-muted focus:border-accent-text focus:outline-none focus:ring-3 focus:ring-accent-soft";

export function LoginForm({ next }: { next: string }) {
  const [error, action, pending] = useActionState(signIn, null);
  const email = useRef<HTMLInputElement>(null);
  const password = useRef<HTMLInputElement>(null);

  const fill = () => {
    if (email.current) email.current.value = DEMO_EMAIL;
    if (password.current) password.current.value = DEMO_PASSWORD;
  };

  return (
    <>
      <div className="mt-6 rounded-[16px] border border-dashed border-line-strong bg-surface-2/50 p-4">
        <p className="text-[13px] font-medium text-ink">Demo account</p>
        <dl className="mt-2 grid grid-cols-[76px_1fr] gap-y-1 text-[13px]">
          <dt className="text-muted">Email</dt>
          <dd className="font-mono text-[12.5px] text-ink">{DEMO_EMAIL}</dd>
          <dt className="text-muted">Password</dt>
          <dd className="font-mono text-[12.5px] text-ink">{DEMO_PASSWORD}</dd>
        </dl>
        <button type="button" onClick={fill} className={`${btn.secondary} mt-3 w-full`}>
          Fill demo credentials
        </button>
      </div>

      <form action={action} className="mt-6 space-y-4">
        <input type="hidden" name="next" value={next} />
        <div className="grid gap-1.5">
          <label htmlFor="email" className="text-[13px] font-medium text-ink">
            Email
          </label>
          <input ref={email} id="email" name="email" type="email" autoComplete="username" required className={input} />
        </div>
        <div className="grid gap-1.5">
          <label htmlFor="password" className="text-[13px] font-medium text-ink">
            Password
          </label>
          <input ref={password} id="password" name="password" type="password" autoComplete="current-password" required className={input} />
        </div>
        {error && (
          <p role="alert" className="rounded-[12px] bg-bad-soft px-3 py-2 text-[13px] text-bad">
            {error}
          </p>
        )}
        <button disabled={pending} className={`${btn.primary} h-10 w-full text-sm`}>
          {pending ? "Signing in" : "Sign in"}
        </button>
      </form>
    </>
  );
}
