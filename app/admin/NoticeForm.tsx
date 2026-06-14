"use client";

import { useEffect, useRef, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createNotice, updateNotice } from "./actions";
import { IDLE_STATE } from "./shared";
import type { Notice } from "@/src/lib/content/types";

const inputCls = "w-full rounded border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40";
const labelCls = "text-xs font-bold uppercase tracking-wide text-white/60";

// datetime-local has no timezone; the browser knows the admin's local zone, so
// convert to UTC ISO on the client (the server can't infer the zone). Empty -> "".
const toISO = (local: string) => (local ? new Date(local).toISOString() : "");

// UTC ISO -> the value a datetime-local input wants (the admin's local wall time).
function toLocalInput(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function SubmitButton({ idleLabel, pendingLabel }: { idleLabel: string; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn btn-primary btn-sweep inline-flex items-center justify-center gap-2 rounded bg-astra-red px-5 py-3 text-sm font-black uppercase tracking-wide text-white disabled:opacity-60"
    >
      {pending ? pendingLabel : idleLabel}
    </button>
  );
}

export function NoticeForm({ initial }: { initial?: Notice }) {
  const isEdit = Boolean(initial);
  const [state, formAction] = useFormState(isEdit ? updateNotice : createNotice, IDLE_STATE);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const [from, setFrom] = useState(toLocalInput(initial?.activeFrom));
  const [until, setUntil] = useState(toLocalInput(initial?.activeUntil));

  useEffect(() => {
    if (!state?.ok) return;
    if (isEdit) {
      router.push("/admin?tab=notices"); // leave edit mode, back to the list
      router.refresh();
      return;
    }
    formRef.current?.reset();
    setFrom("");
    setUntil("");
    router.refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, router]);

  return (
    <form ref={formRef} action={formAction} className="card-dark grid gap-4 p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="crest-type text-2xl text-white">{isEdit ? "Edit notice" : "New notice"}</h2>
        {isEdit ? (
          <Link href="/admin?tab=notices" className="text-xs font-bold text-white/55 underline-offset-2 hover:text-white hover:underline">
            Cancel
          </Link>
        ) : null}
      </div>
      {isEdit ? <input type="hidden" name="id" value={initial!.id} /> : null}
      <label className="grid gap-1.5">
        <span className={labelCls}>Title</span>
        <input name="title" required maxLength={80} defaultValue={initial?.title ?? ""} className={inputCls} placeholder="Training cancelled tonight" />
      </label>
      <label className="grid gap-1.5">
        <span className={labelCls}>Message</span>
        <textarea name="message" required rows={3} defaultValue={initial?.message ?? ""} className={inputCls} placeholder="Heavy rain at DISC — all U6-U12 sessions are off." />
      </label>
      <fieldset className="grid gap-2">
        <span className={labelCls}>Type</span>
        <label className="flex items-center gap-2 text-sm text-white/80">
          <input type="radio" name="kind" value="info" defaultChecked={initial?.kind !== "urgent"} /> Info
        </label>
        <label className="flex items-center gap-2 text-sm text-white/80">
          <input type="radio" name="kind" value="urgent" defaultChecked={initial?.kind === "urgent"} /> Urgent — pulses and opens once automatically
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
      {state?.error ? <p className="text-sm font-semibold text-astra-red">{state.error}</p> : null}
      <SubmitButton idleLabel={isEdit ? "Save changes" : "Publish notice"} pendingLabel={isEdit ? "Saving…" : "Publishing…"} />
    </form>
  );
}
