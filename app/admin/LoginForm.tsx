"use client";

import { useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { login } from "./actions";
import { IDLE_STATE } from "./shared";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn btn-primary btn-sweep inline-flex items-center justify-center gap-2 rounded bg-astra-red px-5 py-3 text-sm font-black uppercase tracking-wide text-white disabled:opacity-60"
    >
      {pending ? "Signing in…" : "Sign in"}
    </button>
  );
}

export function LoginForm() {
  const [state, formAction] = useFormState(login, IDLE_STATE);
  const router = useRouter();

  useEffect(() => {
    if (state?.ok) router.refresh();
  }, [state, router]);

  return (
    <main className="grid min-h-screen place-items-center bg-astra-ink px-5 pb-16 pt-32 text-white">
      <form action={formAction} className="card-dark grid w-full max-w-sm gap-4 p-7">
        <p className="text-xs font-black uppercase tracking-[0.14em] text-astra-gold">Astra United</p>
        <h1 className="crest-type text-3xl text-white">Club admin</h1>
        <label className="grid gap-1.5">
          <span className="text-xs font-bold uppercase tracking-wide text-white/60">Password</span>
          <input
            type="password"
            name="password"
            required
            autoFocus
            autoComplete="current-password"
            className="w-full rounded border border-white/15 bg-white/5 px-3 py-2 text-sm text-white"
          />
        </label>
        {state?.error ? <p className="text-sm font-semibold text-astra-red">{state.error}</p> : null}
        <SubmitButton />
      </form>
    </main>
  );
}
