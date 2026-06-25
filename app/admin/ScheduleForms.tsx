"use client";

import { useEffect, useRef } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { createSpecialEvent, createTrainingSession } from "./actions";
import { IDLE_STATE } from "./shared";

const inputCls = "w-full rounded border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40";
const labelCls = "text-xs font-bold uppercase tracking-wide text-white/60";

const DAY_OPTIONS = [
  { value: "mon", label: "Monday" },
  { value: "tue", label: "Tuesday" },
  { value: "wed", label: "Wednesday" },
  { value: "thu", label: "Thursday" },
  { value: "fri", label: "Friday" },
  { value: "sat", label: "Saturday" },
  { value: "sun", label: "Sunday" }
];

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

/** Add a recurring weekly training slot. */
export function TrainingForm() {
  const [state, formAction] = useFormState(createTrainingSession, IDLE_STATE);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!state?.ok) return;
    formRef.current?.reset();
    router.refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="card-dark grid gap-4 p-6">
      <h2 className="crest-type text-2xl text-white">Add training session</h2>
      <label className="grid gap-1.5">
        <span className={labelCls}>Group</span>
        <input name="group" required maxLength={60} className={inputCls} placeholder="U10 – U12" />
      </label>
      <label className="grid gap-1.5">
        <span className={labelCls}>Day</span>
        <select name="day" required defaultValue="tue" className={inputCls}>
          {DAY_OPTIONS.map((d) => (
            <option key={d.value} value={d.value} className="bg-astra-ink">
              {d.label}
            </option>
          ))}
        </select>
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1.5">
          <span className={labelCls}>Start</span>
          <input type="time" name="start" required defaultValue="17:00" className={inputCls} />
        </label>
        <label className="grid gap-1.5">
          <span className={labelCls}>End</span>
          <input type="time" name="end" required defaultValue="18:00" className={inputCls} />
        </label>
      </div>
      <label className="grid gap-1.5">
        <span className={labelCls}>Location (optional)</span>
        <input name="location" maxLength={80} className={inputCls} placeholder="DISC Darebin" />
      </label>
      {state?.error ? <p className="text-sm font-semibold text-astra-red">{state.error}</p> : null}
      <SubmitButton idleLabel="Add session" pendingLabel="Adding…" />
    </form>
  );
}

/** Add a one-off dated special event. */
export function SpecialEventForm() {
  const [state, formAction] = useFormState(createSpecialEvent, IDLE_STATE);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!state?.ok) return;
    formRef.current?.reset();
    router.refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="card-dark grid gap-4 p-6">
      <h2 className="crest-type text-2xl text-white">Add special event</h2>
      <label className="grid gap-1.5">
        <span className={labelCls}>Title</span>
        <input name="title" required maxLength={100} className={inputCls} placeholder="Community Gala Day" />
      </label>
      <label className="grid gap-1.5">
        <span className={labelCls}>Date</span>
        <input type="date" name="date" required className={inputCls} />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1.5">
          <span className={labelCls}>Start (optional)</span>
          <input type="time" name="start" className={inputCls} />
        </label>
        <label className="grid gap-1.5">
          <span className={labelCls}>End (optional)</span>
          <input type="time" name="end" className={inputCls} />
        </label>
      </div>
      <label className="grid gap-1.5">
        <span className={labelCls}>Location (optional)</span>
        <input name="location" maxLength={80} className={inputCls} placeholder="DISC Darebin" />
      </label>
      <label className="grid gap-1.5">
        <span className={labelCls}>Note (optional)</span>
        <input name="note" maxLength={200} className={inputCls} placeholder="All age groups — family day" />
      </label>
      {state?.error ? <p className="text-sm font-semibold text-astra-red">{state.error}</p> : null}
      <SubmitButton idleLabel="Add event" pendingLabel="Adding…" />
    </form>
  );
}
