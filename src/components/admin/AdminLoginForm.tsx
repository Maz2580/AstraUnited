"use client";

import { FormEvent, useMemo, useState } from "react";
import { KeyRound, Mail } from "lucide-react";
import { createSupabaseBrowserClient, hasSupabaseBrowserEnv } from "@/src/lib/supabase/browser";

type AuthMode = "magic" | "password";

export function AdminLoginForm() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [mode, setMode] = useState<AuthMode>("magic");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const configured = hasSupabaseBrowserEnv() && supabase;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);
    setError(null);

    if (!supabase) {
      setError("Supabase env vars are not configured yet.");
      return;
    }

    setSubmitting(true);

    const result =
      mode === "magic"
        ? await supabase.auth.signInWithOtp({
            email,
            options: {
              emailRedirectTo: `${window.location.origin}/admin`
            }
          })
        : await supabase.auth.signInWithPassword({
            email,
            password
          });

    setSubmitting(false);

    if (result.error) {
      setError(result.error.message);
      return;
    }

    setStatus(mode === "magic" ? "Magic link sent. Check the inbox for this admin email." : "Signed in. Redirecting to admin...");

    if (mode === "password") {
      window.location.href = "/admin";
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card-plain mx-auto w-full max-w-lg p-6 sm:p-8">
      <div className="mb-6 flex gap-2 rounded bg-slate-100 p-1" role="tablist" aria-label="Admin sign in method">
        <button
          type="button"
          onClick={() => setMode("magic")}
          className={`flex flex-1 items-center justify-center gap-2 rounded px-3 py-2 text-sm font-black ${mode === "magic" ? "bg-white text-astra-ink shadow-sm" : "text-slate-600"}`}
        >
          <Mail aria-hidden="true" className="h-4 w-4" />
          Magic link
        </button>
        <button
          type="button"
          onClick={() => setMode("password")}
          className={`flex flex-1 items-center justify-center gap-2 rounded px-3 py-2 text-sm font-black ${mode === "password" ? "bg-white text-astra-ink shadow-sm" : "text-slate-600"}`}
        >
          <KeyRound aria-hidden="true" className="h-4 w-4" />
          Password
        </button>
      </div>

      <label className="block text-sm font-black text-astra-ink" htmlFor="admin-email">
        Admin email
      </label>
      <input
        id="admin-email"
        type="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        className="mt-2 w-full rounded border border-slate-300 px-4 py-3 text-base text-astra-ink"
        placeholder="admin@example.com"
        disabled={!configured || submitting}
      />

      {mode === "password" ? (
        <>
          <label className="mt-5 block text-sm font-black text-astra-ink" htmlFor="admin-password">
            Password
          </label>
          <input
            id="admin-password"
            type="password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-2 w-full rounded border border-slate-300 px-4 py-3 text-base text-astra-ink"
            disabled={!configured || submitting}
          />
        </>
      ) : null}

      <button
        type="submit"
        disabled={!configured || submitting}
        className="mt-6 w-full rounded bg-astra-red px-5 py-3 text-sm font-black uppercase tracking-normal text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {submitting ? "Signing in..." : mode === "magic" ? "Send magic link" : "Sign in"}
      </button>

      {!configured ? (
        <p className="mt-4 rounded bg-amber-50 p-3 text-sm leading-6 text-amber-900">
          Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to enable this form.
        </p>
      ) : null}
      {status ? <p className="mt-4 rounded bg-emerald-50 p-3 text-sm leading-6 text-emerald-900">{status}</p> : null}
      {error ? <p className="mt-4 rounded bg-red-50 p-3 text-sm leading-6 text-red-900">{error}</p> : null}
    </form>
  );
}
