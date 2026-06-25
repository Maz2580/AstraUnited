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
      className="btn btn-primary btn-sweep inline-flex shrink-0 items-center justify-center gap-2 rounded bg-astra-red px-5 py-3 text-sm font-black uppercase tracking-wide text-white disabled:opacity-60"
    >
      {pending ? "Joining…" : "Subscribe"}
      {pending ? null : <ArrowRight aria-hidden="true" className="btn-icon h-4 w-4" />}
    </button>
  );
}

/**
 * Newsletter signup beside the News section. Posts to the public `subscribe`
 * server action, which captures the email to the club's store (viewable in
 * /admin). A real email service can be wired on top later. Shows an inline
 * thank-you on success; the box keeps the section's navy + gold brand look.
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
      className="relative flex h-full flex-col justify-center overflow-hidden rounded-[1.75rem] p-7 ring-1 ring-astra-gold/25 sm:p-8"
      style={{
        background:
          "radial-gradient(120% 120% at 0% 0%, rgba(242,201,76,0.14), rgba(242,201,76,0) 48%), linear-gradient(160deg, #0d2c4d 0%, #06141f 100%)"
      }}
    >
      <span
        aria-hidden="true"
        className="grid h-12 w-12 place-items-center rounded-2xl bg-astra-gold/10 ring-1 ring-astra-gold/30"
      >
        <Mail className="h-6 w-6 text-astra-gold" />
      </span>

      <h3 className="crest-type mt-5 text-3xl leading-tight text-white">
        Never miss a <span className="text-astra-gold">match report</span>
      </h3>
      <p className="mt-3 text-sm leading-6 text-white/72">
        Fixtures, results and club news — straight to your inbox.
      </p>

      {done ? (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-astra-gold/30 bg-astra-gold/10 p-4">
          <Check aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-astra-gold" />
          <div>
            <p className="text-sm font-black text-white">You&apos;re on the list!</p>
            <p className="mt-1 text-xs text-white/65">We&apos;ll be in touch with the latest from the club.</p>
          </div>
        </div>
      ) : (
        <form ref={formRef} action={formAction} className="mt-6 grid gap-3">
          <label className="grid gap-1.5">
            <span className="sr-only">Email address</span>
            <input
              type="email"
              name="email"
              required
              maxLength={160}
              autoComplete="email"
              placeholder="you@email.com"
              className="w-full rounded border border-white/15 bg-white/5 px-3.5 py-3 text-sm text-white placeholder:text-white/40 focus:border-astra-gold/50 focus:outline-none"
            />
          </label>
          <SubmitButton />
          {state?.error ? <p className="text-xs font-semibold text-astra-red">{state.error}</p> : null}
          <p className="text-[0.7rem] leading-5 text-white/45">
            We&apos;ll only email club updates. Unsubscribe anytime.
          </p>
        </form>
      )}
    </div>
  );
}
