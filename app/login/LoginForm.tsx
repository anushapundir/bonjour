"use client";

import { useActionState, useRef } from "react";
import { btn } from "../../components/ui";
import { DEMO_EMAIL, DEMO_PASSWORD } from "../../lib/demo";
import { signIn } from "./actions";

const input =
  "h-9 w-full rounded-md border border-line-strong bg-surface px-3 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-mark";

export function LoginForm() {
  const [error, action, pending] = useActionState(signIn, null);
  const email = useRef<HTMLInputElement>(null);
  const password = useRef<HTMLInputElement>(null);

  const fill = () => {
    if (email.current) email.current.value = DEMO_EMAIL;
    if (password.current) password.current.value = DEMO_PASSWORD;
  };

  return (
    <>
      <div className="mt-6 rounded-lg border border-line bg-surface-2/60 p-3.5">
        <p className="text-[13px] font-medium text-ink">Demo account</p>
        <dl className="mt-1.5 grid grid-cols-[72px_1fr] gap-y-0.5 text-[13px]">
          <dt className="text-muted">Email</dt>
          <dd className="text-ink-2">{DEMO_EMAIL}</dd>
          <dt className="text-muted">Password</dt>
          <dd className="text-ink-2">{DEMO_PASSWORD}</dd>
        </dl>
        <button type="button" onClick={fill} className={`${btn.secondary} mt-3 w-full`}>
          Fill demo credentials
        </button>
      </div>

      <form action={action} className="mt-6 space-y-4">
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
          <p role="alert" className="rounded-md bg-bad-soft px-3 py-2 text-[13px] text-bad">
            {error}
          </p>
        )}
        <button disabled={pending} className={`${btn.primary} h-9 w-full text-sm`}>
          {pending ? "Signing in" : "Sign in"}
        </button>
      </form>
    </>
  );
}
