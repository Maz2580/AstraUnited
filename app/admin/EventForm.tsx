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

// The club's real pages, so the admin picks a destination instead of typing a
// path. "Join Us / Register" is the registration page (/join-us).
const LINK_PRESETS: { label: string; href: string }[] = [
  { label: "Join Us / Register", href: "/join-us" },
  { label: "Contact the club", href: "/contact" },
  { label: "Teams", href: "/teams" },
  { label: "News & media", href: "/news-media" },
  { label: "The Club", href: "/the-club" },
  { label: "Sponsors", href: "/sponsors" }
];

// Where the post appears on the homepage (matches the placement enum in types).
const PLACEMENTS: { value: string; label: string }[] = [
  { value: "top", label: "Top — under the hero (default)" },
  { value: "mid", label: "Middle — after the academy section" },
  { value: "after-news", label: "After News & media" },
  { value: "before-join", label: "Bottom — before the Join section" }
];

// Defaults for the optional design panel — close to the standard Spotlight look.
const DEFAULT_BG = "#0b1722";
const DEFAULT_TEXT = "#f8fbfd";
const DEFAULT_HEADLINE = 36;
const DEFAULT_BODY = 15;
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
  const [ctaHref, setCtaHref] = useState(""); // holds the custom link text
  const [linkChoice, setLinkChoice] = useState(""); // "", a preset href, or "custom"
  const [from, setFrom] = useState("");
  const [until, setUntil] = useState("");
  const [placement, setPlacement] = useState("top");
  const [customise, setCustomise] = useState(false);
  const [bgColor, setBgColor] = useState(DEFAULT_BG);
  const [textColor, setTextColor] = useState(DEFAULT_TEXT);
  const [headlineSize, setHeadlineSize] = useState(DEFAULT_HEADLINE);
  const [bodySize, setBodySize] = useState(DEFAULT_BODY);
  const [align, setAlign] = useState<"left" | "center" | "right">("left");
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
      setLinkChoice("");
      setFrom("");
      setUntil("");
      setPlacement("top");
      setCustomise(false);
      setBgColor(DEFAULT_BG);
      setTextColor(DEFAULT_TEXT);
      setHeadlineSize(DEFAULT_HEADLINE);
      setBodySize(DEFAULT_BODY);
      setAlign("left");
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

  // Where the button points: a chosen preset, the custom text, or nothing.
  const effectiveHref = linkChoice === "custom" ? ctaHref.trim() : linkChoice;

  const previewEvent: EventPost = {
    id: "preview",
    image: previewUrl || TRANSPARENT,
    headline: headline || "Your headline",
    body: body || "Your event text will appear here…",
    ctaLabel: ctaLabel || undefined,
    ctaHref: effectiveHref || undefined,
    style: customise ? { bg: bgColor, text: textColor, headlineSize, bodySize, align } : undefined,
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
            <span className={labelCls}>Button text</span>
            <input name="ctaLabel" value={ctaLabel} onChange={(e) => setCtaLabel(e.target.value)} className={inputCls} placeholder="Register now" />
          </label>
          <label className="grid gap-1.5">
            <span className={labelCls}>Button goes to</span>
            <select
              value={linkChoice}
              onChange={(e) => setLinkChoice(e.target.value)}
              className={`${inputCls} [&>option]:bg-astra-ink [&>option]:text-white`}
            >
              <option value="">No button</option>
              {LINK_PRESETS.map((p) => (
                <option key={p.href} value={p.href}>
                  {p.label}
                </option>
              ))}
              <option value="custom">Custom link…</option>
            </select>
          </label>
        </div>
        {linkChoice === "custom" ? (
          <label className="grid gap-1.5">
            <span className={labelCls}>Custom link</span>
            <input value={ctaHref} onChange={(e) => setCtaHref(e.target.value)} className={inputCls} placeholder="https://instagram.com/…" />
            <span className="text-xs text-white/40">A page path like /news-media, or a full https:// web address.</span>
          </label>
        ) : null}
        <input type="hidden" name="ctaHref" value={effectiveHref} />
        <p className="text-xs text-white/40">The button only appears when you give it both text and a destination.</p>

        <label className="grid gap-1.5">
          <span className={labelCls}>Where it appears</span>
          <select
            name="placement"
            value={placement}
            onChange={(e) => setPlacement(e.target.value)}
            className={`${inputCls} [&>option]:bg-astra-ink [&>option]:text-white`}
          >
            {PLACEMENTS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </label>

        <div className="rounded border border-white/12 p-4">
          <label className="flex items-center gap-2 text-sm font-semibold text-white/85">
            <input type="checkbox" name="customise" checked={customise} onChange={(e) => setCustomise(e.target.checked)} />
            Customise design (colours, sizes, alignment)
          </label>
          {customise ? (
            <div className="mt-4 grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-1.5">
                  <span className={labelCls}>Background colour</span>
                  <input type="color" name="bgColor" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="h-9 w-full rounded border border-white/15 bg-white/5" />
                </label>
                <label className="grid gap-1.5">
                  <span className={labelCls}>Text colour</span>
                  <input type="color" name="textColor" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="h-9 w-full rounded border border-white/15 bg-white/5" />
                </label>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <label className="grid gap-1.5">
                  <span className={labelCls}>Headline size (px)</span>
                  <input type="number" name="headlineSize" min={12} max={120} value={headlineSize} onChange={(e) => setHeadlineSize(Number(e.target.value))} className={inputCls} />
                </label>
                <label className="grid gap-1.5">
                  <span className={labelCls}>Text size (px)</span>
                  <input type="number" name="bodySize" min={10} max={48} value={bodySize} onChange={(e) => setBodySize(Number(e.target.value))} className={inputCls} />
                </label>
                <label className="grid gap-1.5">
                  <span className={labelCls}>Alignment</span>
                  <select
                    name="align"
                    value={align}
                    onChange={(e) => setAlign(e.target.value as "left" | "center" | "right")}
                    className={`${inputCls} [&>option]:bg-astra-ink [&>option]:text-white`}
                  >
                    <option value="left">Left</option>
                    <option value="center">Centre</option>
                    <option value="right">Right</option>
                  </select>
                </label>
              </div>
            </div>
          ) : null}
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
