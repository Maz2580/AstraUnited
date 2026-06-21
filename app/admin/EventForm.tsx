"use client";

import { useEffect, useRef, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createEvent, updateEvent } from "./actions";
import { IDLE_STATE } from "./shared";
import { downscaleImage } from "./downscale";
import { SpotlightCard } from "@/src/components/content/SpotlightCard";
import type { EventPost } from "@/src/lib/content/types";

const inputCls = "w-full rounded border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40";
const selectCls = `${inputCls} [&>option]:bg-astra-ink [&>option]:text-white`;
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

// Every post is a news article; placement controls whether it ALSO appears as a
// featured Spotlight band on the homepage. "none" = news only (matches the enum).
const PLACEMENTS: { value: string; label: string }[] = [
  { value: "none", label: "News only — no spotlight band (default)" },
  { value: "top", label: "Also feature: top — under the hero" },
  { value: "mid", label: "Also feature: middle of the page" },
  { value: "after-news", label: "Also feature: after the News section" },
  { value: "before-join", label: "Also feature: before the Join section" }
];

// News category shown on the card + article page.
const CATEGORIES = ["Club News", "Match Report", "Community Update", "Academy", "Event"];

// Defaults for the optional design panel — close to the standard Spotlight look.
const DEFAULT_BG = "#101a23";
const DEFAULT_TEXT = "#f8fbfd";
const DEFAULT_HEADLINE = 36;
const DEFAULT_BODY = 15;
const TRANSPARENT = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

// datetime-local has no timezone; convert to UTC ISO on the client.
const toISO = (local: string) => (local ? new Date(local).toISOString() : "");

// UTC ISO -> the value a datetime-local input wants (the admin's local wall time).
function toLocalInput(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// Map a stored ctaHref back to the dropdown state (preset vs custom).
function deriveLink(href?: string): { choice: string; custom: string } {
  if (!href) return { choice: "", custom: "" };
  if (LINK_PRESETS.some((p) => p.href === href)) return { choice: href, custom: "" };
  return { choice: "custom", custom: href };
}

function SubmitButton({
  idleLabel,
  pendingLabel,
  disabled,
  busyLabel
}: {
  idleLabel: string;
  pendingLabel: string;
  disabled?: boolean;
  busyLabel?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className="btn btn-primary btn-sweep inline-flex items-center justify-center gap-2 rounded bg-astra-red px-5 py-3 text-sm font-black uppercase tracking-wide text-white disabled:opacity-60"
    >
      {pending ? pendingLabel : busyLabel ?? idleLabel}
    </button>
  );
}

export function EventForm({ initial }: { initial?: EventPost }) {
  const isEdit = Boolean(initial);
  const [state, formAction] = useFormState(isEdit ? updateEvent : createEvent, IDLE_STATE);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  const initialLink = deriveLink(initial?.ctaHref);
  const [headline, setHeadline] = useState(initial?.headline ?? "");
  const [category, setCategory] = useState(initial?.category ?? "Club News");
  const [body, setBody] = useState(initial?.body ?? "");
  const [ctaLabel, setCtaLabel] = useState(initial?.ctaLabel ?? "");
  const [ctaHref, setCtaHref] = useState(initialLink.custom); // holds the custom link text
  const [linkChoice, setLinkChoice] = useState(initialLink.choice); // "", a preset href, or "custom"
  const [from, setFrom] = useState(toLocalInput(initial?.activeFrom));
  const [until, setUntil] = useState(toLocalInput(initial?.activeUntil));
  const [placement, setPlacement] = useState<string>(initial?.placement ?? "none");
  const [customise, setCustomise] = useState(Boolean(initial?.style));
  const [bgColor, setBgColor] = useState(initial?.style?.bg ?? DEFAULT_BG);
  const [textColor, setTextColor] = useState(initial?.style?.text ?? DEFAULT_TEXT);
  const [headlineSize, setHeadlineSize] = useState(initial?.style?.headlineSize ?? DEFAULT_HEADLINE);
  const [bodySize, setBodySize] = useState(initial?.style?.bodySize ?? DEFAULT_BODY);
  const [align, setAlign] = useState<"left" | "center" | "right">(initial?.style?.align ?? "left");
  const [imageSide, setImageSide] = useState<"left" | "right" | "top">(initial?.style?.imageSide ?? "left");
  const [imageFit, setImageFit] = useState<"cover" | "contain">(initial?.style?.imageFit ?? "cover");
  const [size, setSize] = useState<"sm" | "md" | "lg">(initial?.style?.size ?? "lg");
  const [previewUrl, setPreviewUrl] = useState(initial?.image ?? "");
  const [fileError, setFileError] = useState<string | null>(null);
  const [compressing, setCompressing] = useState(false);

  // This effect's cleanup solely owns object-URL revocation: it fires with the
  // previous url whenever previewUrl changes (and on unmount). Revoking a normal
  // https url (the existing image in edit mode) is a harmless no-op.
  useEffect(() => {
    if (!previewUrl || !previewUrl.startsWith("blob:")) return;
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  useEffect(() => {
    if (!state?.ok) return;
    if (isEdit) {
      router.push("/admin?tab=events"); // leave edit mode, back to the list
      router.refresh();
      return;
    }
    // Create: clear the form for the next post.
    formRef.current?.reset();
    setHeadline("");
    setCategory("Club News");
    setBody("");
    setCtaLabel("");
    setCtaHref("");
    setLinkChoice("");
    setFrom("");
    setUntil("");
    setPlacement("none");
    setCustomise(false);
    setBgColor(DEFAULT_BG);
    setTextColor(DEFAULT_TEXT);
    setHeadlineSize(DEFAULT_HEADLINE);
    setBodySize(DEFAULT_BODY);
    setAlign("left");
    setImageSide("left");
    setImageFit("cover");
    setSize("lg");
    setPreviewUrl("");
    setFileError(null);
    router.refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, router]);

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.target;
    const file = input.files?.[0];
    setFileError(null);
    if (!file) {
      // In edit mode, clearing the picker keeps the existing image.
      setPreviewUrl(initial?.image ?? "");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setFileError("Please choose an image file.");
      setPreviewUrl(initial?.image ?? "");
      input.value = "";
      return;
    }
    if (file.size > MAX_BYTES) {
      setFileError("Image is larger than 10 MB.");
      setPreviewUrl(initial?.image ?? "");
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
    style: customise ? { bg: bgColor, text: textColor, headlineSize, bodySize, align, imageSide, imageFit, size } : undefined,
    createdAt: ""
  };

  return (
    <div className="grid gap-6">
      <form ref={formRef} action={formAction} className="card-dark grid gap-4 p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="crest-type text-2xl text-white">{isEdit ? "Edit news post" : "New news post"}</h2>
          {isEdit ? (
            <Link href="/admin?tab=events" className="text-xs font-bold text-white/55 underline-offset-2 hover:text-white hover:underline">
              Cancel
            </Link>
          ) : null}
        </div>
        <p className="rounded border border-white/12 bg-white/5 px-3 py-2.5 text-xs leading-5 text-white/65">
          Publishing adds this to the <strong className="text-white/85">News</strong> section — the three newest show on
          the homepage, and every post gets its own page at <span className="text-astra-gold">/news-media</span>. Use{" "}
          <strong className="text-white/85">Where it appears</strong> below to also pin it as a featured spotlight band.
        </p>
        {isEdit ? <input type="hidden" name="id" value={initial!.id} /> : null}
        <label className="grid gap-1.5">
          <span className={labelCls}>Image</span>
          <input
            type="file"
            name="image"
            accept="image/*"
            required={!isEdit}
            onChange={onFileChange}
            className="text-sm text-white/80 file:mr-3 file:rounded file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-white"
          />
          {isEdit ? <span className="text-xs text-white/40">Leave empty to keep the current image.</span> : null}
        </label>
        <div className="grid gap-4 sm:grid-cols-[1.4fr_1fr]">
          <label className="grid gap-1.5">
            <span className={labelCls}>Headline</span>
            <input name="headline" required maxLength={80} value={headline} onChange={(e) => setHeadline(e.target.value)} className={inputCls} placeholder="Senior Team Secure Three Points" />
          </label>
          <label className="grid gap-1.5">
            <span className={labelCls}>Category</span>
            <input name="category" list="news-categories" maxLength={60} value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls} placeholder="Club News" />
            <datalist id="news-categories">
              {CATEGORIES.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </label>
        </div>
        <label className="grid gap-1.5">
          <span className={labelCls}>Article text</span>
          <textarea name="body" required rows={7} value={body} onChange={(e) => setBody(e.target.value)} className={inputCls} placeholder={"Write the full post here.\n\nLeave a blank line between paragraphs — each becomes its own paragraph on the news page."} />
          <span className="text-xs text-white/40">Separate paragraphs with a blank line. The first lines show as the preview on cards.</span>
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1.5">
            <span className={labelCls}>Button text</span>
            <input name="ctaLabel" value={ctaLabel} onChange={(e) => setCtaLabel(e.target.value)} className={inputCls} placeholder="Register now" />
          </label>
          <label className="grid gap-1.5">
            <span className={labelCls}>Button goes to</span>
            <select value={linkChoice} onChange={(e) => setLinkChoice(e.target.value)} className={selectCls}>
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
          <select name="placement" value={placement} onChange={(e) => setPlacement(e.target.value)} className={selectCls}>
            {PLACEMENTS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
          <span className="text-xs text-white/40">
            It always appears in News. Pick a spotlight position only for important announcements.
          </span>
        </label>

        <div className="rounded border border-white/12 p-4">
          <label className="flex items-center gap-2 text-sm font-semibold text-white/85">
            <input type="checkbox" name="customise" checked={customise} onChange={(e) => setCustomise(e.target.checked)} />
            Customise design (colours, sizes, image &amp; box)
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
                  <span className={labelCls}>Text alignment</span>
                  <select name="align" value={align} onChange={(e) => setAlign(e.target.value as "left" | "center" | "right")} className={selectCls}>
                    <option value="left">Left</option>
                    <option value="center">Centre</option>
                    <option value="right">Right</option>
                  </select>
                </label>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <label className="grid gap-1.5">
                  <span className={labelCls}>Image position</span>
                  <select name="imageSide" value={imageSide} onChange={(e) => setImageSide(e.target.value as "left" | "right" | "top")} className={selectCls}>
                    <option value="left">Left</option>
                    <option value="right">Right</option>
                    <option value="top">Top</option>
                  </select>
                </label>
                <label className="grid gap-1.5">
                  <span className={labelCls}>Image fit</span>
                  <select name="imageFit" value={imageFit} onChange={(e) => setImageFit(e.target.value as "cover" | "contain")} className={selectCls}>
                    <option value="cover">Fill the space (crop)</option>
                    <option value="contain">Show whole image</option>
                  </select>
                </label>
                <label className="grid gap-1.5">
                  <span className={labelCls}>Box width</span>
                  <select name="size" value={size} onChange={(e) => setSize(e.target.value as "sm" | "md" | "lg")} className={selectCls}>
                    <option value="lg">Full width</option>
                    <option value="md">Medium</option>
                    <option value="sm">Compact</option>
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
        <SubmitButton
          idleLabel={isEdit ? "Save changes" : "Publish event post"}
          pendingLabel={isEdit ? "Saving…" : "Publishing…"}
          disabled={compressing}
          busyLabel={compressing ? "Optimising image…" : undefined}
        />
      </form>

      <div className="grid gap-6">
        <div>
          <p className={labelCls}>Preview — how it appears in News</p>
          <div className="mt-3 max-w-sm">
            <div className="card-dark overflow-hidden">
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-white/5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={previewUrl || TRANSPARENT} alt="" className="absolute inset-0 h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-astra-ink/85 via-astra-ink/10 to-transparent" />
              </div>
              <div className="p-6">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-astra-gold">{category || "Club News"}</p>
                <h3 className="mt-3 text-xl font-black leading-tight text-white">{headline || "Your headline"}</h3>
                <p className="mt-3 line-clamp-3 text-sm leading-6 text-white/72">
                  {body || "Your article text will appear here…"}
                </p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-black text-astra-red">Read more →</span>
              </div>
            </div>
          </div>
        </div>
        {placement !== "none" ? (
          <div>
            <p className={labelCls}>Preview — featured spotlight band</p>
            <div className="mt-3">
              <SpotlightCard event={previewEvent} unoptimized />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
