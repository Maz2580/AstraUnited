"use client";

import { useEffect, useRef, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { ArrowRight, Check, Mail } from "lucide-react";
import { subscribe } from "@/app/admin/actions";
import { IDLE_STATE } from "@/app/admin/shared";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn btn-primary btn-sweep inline-flex shrink-0 items-center justify-center gap-2 rounded bg-astra-red px-5 py-2.5 text-sm font-black uppercase tracking-wide text-white disabled:opacity-60"
    >
      {pending ? "Joining…" : "Subscribe"}
      {pending ? null : <ArrowRight aria-hidden="true" className="btn-icon h-4 w-4" />}
    </button>
  );
}

/**
 * Compact newsletter signup bar beneath the News cards. Posts to the public
 * `subscribe` server action, which captures the email to the club's store
 * (viewable in /admin); an email service can be wired on top later. One row on
 * desktop, stacking on mobile; shows an inline thank-you on success.
 */
export function SubscribeBox() {
  const [state, formAction] = useFormState(subscribe, IDLE_STATE);
  const [done, setDone] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) {
      setDone(true);
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <div
      className="relative overflow-hidden rounded-2xl p-5 ring-1 ring-astra-gold/25 sm:p-6"
      style={{
        background:
          "radial-gradient(120% 180% at 0% 0%, rgba(242,201,76,0.12), rgba(242,201,76,0) 42%), linear-gradient(160deg, #0d2c4d 0%, #06141f 100%)"
      }}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-astra-gold/10 ring-1 ring-astra-gold/30"
          >
            <Mail className="h-5 w-5 text-astra-gold" />
          </span>
          <div>
            <p className="text-base font-black text-white">
              Never miss a <span className="text-astra-gold">match report</span>
            </p>
            <p className="mt-0.5 text-sm text-white/60">
              Fixtures, results &amp; club news — straight to your inbox.
            </p>
          </div>
        </div>

        {done ? (
          <div className="flex shrink-0 items-center gap-2 rounded-xl border border-astra-gold/30 bg-astra-gold/10 px-4 py-2.5 text-sm font-bold text-white">
            <Check aria-hidden="true" className="h-4 w-4 text-astra-gold" />
            You&apos;re on the list!
          </div>
        ) : (
          <form
            ref={formRef}
            action={formAction}
            className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row sm:items-center"
          >
            <input
              type="email"
              name="email"
              required
              maxLength={160}
              autoComplete="email"
              placeholder="you@email.com"
              aria-label="Email address"
              className="w-full rounded border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-white/40 focus:border-astra-gold/50 focus:outline-none sm:w-60"
            />
            <SubmitButton />
          </form>
        )}
      </div>
      {state?.error ? <p className="mt-3 text-xs font-semibold text-astra-red sm:text-right">{state.error}</p> : null}
    </div>
  );
}
