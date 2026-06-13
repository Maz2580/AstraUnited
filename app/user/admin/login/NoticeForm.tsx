"use client";

import { useEffect, useRef, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { createNotice } from "./actions";
import { IDLE_STATE } from "./shared";

const inputCls = "w-full rounded border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40";
const labelCls = "text-xs font-bold uppercase tracking-wide text-white/60";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn btn-primary btn-sweep inline-flex items-center justify-center gap-2 rounded bg-astra-red px-5 py-3 text-sm font-black uppercase tracking-wide text-white disabled:opacity-60"
    >
      {pending ? "Publishing…" : "Publish notice"}
    </button>
  );
}

// datetime-local has no timezone; the browser knows the admin's local zone, so
// convert to UTC ISO on the client (the server can't infer the zone). Empty -> "".
const toISO = (local: string) => (local ? new Date(local).toISOString() : "");

export function NoticeForm() {
  const [state, formAction] = useFormState(createNotice, IDLE_STATE);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const [from, setFrom] = useState("");
  const [until, setUntil] = useState("");

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
      setFrom("");
      setUntil("");
      router.refresh();
    }
  }, [state, router]);

  return (
    <form ref={formRef} action={formAction} className="card-dark grid gap-4 p-6">
      <h2 className="crest-type text-2xl text-white">New notice</h2>
      <label className="grid gap-1.5">
        <span className={labelCls}>Title</span>
        <input name="title" required maxLength={80} className={inputCls} placeholder="Training cancelled tonight" />
      </label>
      <label className="grid gap-1.5">
        <span className={labelCls}>Message</span>
        <textarea name="message" required rows={3} className={inputCls} placeholder="Heavy rain at DISC — all U6-U12 sessions are off." />
      </label>
      <fieldset className="grid gap-2">
        <span className={labelCls}>Type</span>
        <label className="flex items-center gap-2 text-sm text-white/80">
          <input type="radio" name="kind" value="info" defaultChecked /> Info
        </label>
        <label className="flex items-center gap-2 text-sm text-white/80">
          <input type="radio" name="kind" value="urgent" /> Urgent — pulses and opens once automatically
        </label>
      </fieldset>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1.5">
          <span className={labelCls}>Show from (optional)</span>
          <input type="datetime-local" value={from} onChange={(e) => setFrom(e.target.value)} className={inputCls} />
          <input type="hidden" name="activeFrom" value={toISO(from)} />
        </label>
        <label className="grid gap-1.5">
          <span className={labelCls}>Hide after (optional — auto-expiry)</span>
          <input type="datetime-local" value={until} onChange={(e) => setUntil(e.target.value)} className={inputCls} />
          <input type="hidden" name="activeUntil" value={toISO(until)} />
        </label>
      </div>
      {state.error ? <p className="text-sm font-semibold text-astra-red">{state.error}</p> : null}
      <SubmitButton />
    </form>
  );
}
