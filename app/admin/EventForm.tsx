"use client";

import { useEffect, useRef, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { createEvent } from "./actions";
import { IDLE_STATE } from "./shared";
import { downscaleImage } from "./downscale";
import { SpotlightCard } from "@/src/components/content/SpotlightCard";
import type { EventPost } from "@/src/lib/content/types";

const inputCls = "w-full rounded border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40";
const labelCls = "text-xs font-bold uppercase tracking-wide text-white/60";
const MAX_BYTES = 10 * 1024 * 1024;
const TRANSPARENT = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
// datetime-local has no timezone; convert to UTC ISO on the client.
const toISO = (local: string) => (local ? new Date(local).toISOString() : "");

function SubmitButton({ disabled, busyLabel }: { disabled?: boolean; busyLabel?: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className="btn btn-primary btn-sweep inline-flex items-center justify-center gap-2 rounded bg-astra-red px-5 py-3 text-sm font-black uppercase tracking-wide text-white disabled:opacity-60"
    >
      {pending ? "Publishing…" : busyLabel ?? "Publish event post"}
    </button>
  );
}

export function EventForm() {
  const [state, formAction] = useFormState(createEvent, IDLE_STATE);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  const [headline, setHeadline] = useState("");
  const [body, setBody] = useState("");
  const [ctaLabel, setCtaLabel] = useState("");
  const [ctaHref, setCtaHref] = useState("");
  const [from, setFrom] = useState("");
  const [until, setUntil] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [fileError, setFileError] = useState<string | null>(null);
  const [compressing, setCompressing] = useState(false);

  // This effect's cleanup solely owns object-URL revocation: it fires with the
  // previous url whenever previewUrl changes (and on unmount), so callers just
  // setPreviewUrl and never revoke manually.
  useEffect(() => {
    if (!previewUrl) return;
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  useEffect(() => {
    if (state?.ok) {
      formRef.current?.reset();
      setHeadline("");
      setBody("");
      setCtaLabel("");
      setCtaHref("");
      setFrom("");
      setUntil("");
      setPreviewUrl(""); // effect cleanup revokes the old url
      setFileError(null);
      router.refresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, router]);

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.target;
    const file = input.files?.[0];
    setFileError(null);
    // No manual revoke here — changing previewUrl triggers the effect cleanup.
    if (!file) {
      setPreviewUrl("");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setFileError("Please choose an image file.");
      setPreviewUrl("");
      input.value = "";
      return;
    }
    if (file.size > MAX_BYTES) {
      setFileError("Image is larger than 10 MB.");
      setPreviewUrl("");
      input.value = "";
      return;
    }
    // Shrink in the browser and swap the small webp back into the input, so the
    // normal form submit sends a tiny body (well under Vercel's 4.5 MB limit).
    setCompressing(true);
    try {
      const optimized = await downscaleImage(file);
      const dt = new DataTransfer();
      dt.items.add(optimized);
      input.files = dt.files;
      setPreviewUrl(URL.createObjectURL(optimized));
    } catch {
      setPreviewUrl(URL.createObjectURL(file)); // keep original; server validates
    } finally {
      setCompressing(false);
    }
  }

  // state is undefined only if the action POST failed at the platform level
  // (e.g. a 413) — guard so the admin shows a message instead of crashing.
  const errorMsg = state ? state.error : "Something interrupted the upload — please try a smaller image.";

  const previewEvent: EventPost = {
    id: "preview",
    image: previewUrl || TRANSPARENT,
    headline: headline || "Your headline",
    body: body || "Your event text will appear here…",
    ctaLabel: ctaLabel || undefined,
    ctaHref: ctaHref || undefined,
    createdAt: ""
  };

  return (
    <div className="grid gap-6">
      <form ref={formRef} action={formAction} className="card-dark grid gap-4 p-6">
        <h2 className="crest-type text-2xl text-white">New event post</h2>
        <label className="grid gap-1.5">
          <span className={labelCls}>Image</span>
          <input
            type="file"
            name="image"
            accept="image/*"
            required
            onChange={onFileChange}
            className="text-sm text-white/80 file:mr-3 file:rounded file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-white"
          />
        </label>
        <label className="grid gap-1.5">
          <span className={labelCls}>Headline</span>
          <input name="headline" required maxLength={80} value={headline} onChange={(e) => setHeadline(e.target.value)} className={inputCls} placeholder="Mother's Day Special" />
        </label>
        <label className="grid gap-1.5">
          <span className={labelCls}>Text</span>
          <textarea name="body" required rows={3} value={body} onChange={(e) => setBody(e.target.value)} className={inputCls} placeholder="20% off all academy registrations this weekend." />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1.5">
            <span className={labelCls}>Button label (optional)</span>
            <input name="ctaLabel" value={ctaLabel} onChange={(e) => setCtaLabel(e.target.value)} className={inputCls} placeholder="Register now" />
          </label>
          <label className="grid gap-1.5">
            <span className={labelCls}>Button link (optional)</span>
            <input name="ctaHref" value={ctaHref} onChange={(e) => setCtaHref(e.target.value)} className={inputCls} placeholder="/join-us" />
          </label>
        </div>
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
        {fileError ? <p className="text-sm font-semibold text-astra-red">{fileError}</p> : null}
        {errorMsg ? <p className="text-sm font-semibold text-astra-red">{errorMsg}</p> : null}
        <SubmitButton disabled={compressing} busyLabel={compressing ? "Optimising image…" : undefined} />
      </form>

      <div>
        <p className={labelCls}>Preview — exactly how the homepage will show it</p>
        <div className="mt-3">
          <SpotlightCard event={previewEvent} unoptimized />
        </div>
      </div>
    </div>
  );
}
