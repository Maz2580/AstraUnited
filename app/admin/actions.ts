"use server";

import { cookies } from "next/headers";
import { revalidatePath, revalidateTag } from "next/cache";
import sharp from "sharp";
import {
  deleteImage,
  getClubContentForWrite,
  uploadImage,
  writeEvents,
  writeNotices,
  writePhotoOverrides
} from "@/src/lib/content/store";
import { PHOTO_SLOTS } from "@/src/lib/content/photo-slots";
import type { EventPost, EventStyle, Notice, Placement } from "@/src/lib/content/types";
import type { ActionState } from "./shared";
import { ADMIN_COOKIE, adminToken, isAdmin, passwordMatches } from "./auth";

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
// Mirrors the ctaHref allowlist in types.ts / SpotlightCard (kept local to the
// action so a bad link is rejected at the form, before any image upload).
const SAFE_HREF = /^(https?:\/\/|\/(?!\/))/;

// Coerce a friendly link into a known-safe shape rather than rejecting it:
//   "/teams"            -> "/teams"            (already a relative path)
//   "https://x.com/a"   -> unchanged          (already absolute http(s))
//   "instagram.com/abc" -> "https://instagram.com/abc"   (bare domain)
//   "join-us"           -> "/join-us"          (treated as an internal path)
// Anything with another scheme (javascript:, mailto:, data:) or a protocol-
// relative "//host" returns null so the caller rejects it. Returns null for
// empty input (meaning: no button link).
function normalizeHref(raw: string): string | null {
  const v = raw.trim();
  if (!v) return null;
  if (/^https?:\/\//i.test(v)) return v;
  if (/^\/(?!\/)/.test(v)) return v;
  if (v.startsWith("//") || /^[a-z][a-z0-9+.-]*:/i.test(v)) return null; // unsafe scheme
  if (/^[\w-]+(\.[\w-]+)+/.test(v)) return `https://${v}`; // looks like a domain
  return `/${v.replace(/^\/+/, "")}`; // otherwise an internal path
}

function refresh() {
  revalidateTag("club-content");
  revalidatePath("/", "layout"); // every page can show the ring / photos
}

function assertConfigured() {
  // Token locally, OIDC (BLOB_STORE_ID) on Vercel — either lets the SDK write.
  if (!process.env.BLOB_READ_WRITE_TOKEN && !process.env.BLOB_STORE_ID) {
    throw new Error("Storage write access isn't configured in this environment.");
  }
}

// Gate every mutation on a valid admin session — defence in depth so a direct
// POST to an action without the cookie is rejected, not just the page render.
function requireAdmin() {
  if (!isAdmin()) throw new Error("Please sign in to the admin first.");
}

export async function login(_prev: ActionState, form: FormData): Promise<ActionState> {
  const token = adminToken();
  if (!token) return fail("Admin password isn't configured on the server yet.");
  if (!passwordMatches(String(form.get("password") ?? ""))) return fail("Incorrect password.");
  cookies().set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30
  });
  return { ok: true };
}

export async function logout(): Promise<void> {
  cookies().delete(ADMIN_COOKIE);
  revalidatePath("/admin", "layout");
}

const str = (form: FormData, key: string) => String(form.get(key) ?? "").trim();

/** datetime-local is local wall time; store as ISO UTC. Empty/invalid -> undefined. */
function isoOrUndefined(form: FormData, key: string): string | undefined {
  const v = str(form, key);
  if (!v) return undefined;
  const t = new Date(v);
  return Number.isNaN(t.getTime()) ? undefined : t.toISOString();
}

const fail = (error: string): ActionState => ({ ok: false, error });

const HEX_COLOR = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
const hexOrUndefined = (v: string) => (HEX_COLOR.test(v) ? v : undefined);
const PLACEMENTS = new Set<Placement>(["top", "mid", "after-news", "before-join"]);
const placementOf = (v: string): Placement => (PLACEMENTS.has(v as Placement) ? (v as Placement) : "top");
const alignOf = (v: string): "left" | "center" | "right" => (v === "center" || v === "right" ? v : "left");
const imageSideOf = (v: string): "left" | "right" | "top" => (v === "right" || v === "top" ? v : "left");
const sizeOf = (v: string): "sm" | "md" | "lg" => (v === "sm" || v === "md" ? v : "lg");
function clampSize(v: string, min: number, max: number): number | undefined {
  const n = Number(v);
  if (!Number.isFinite(n)) return undefined;
  return Math.min(max, Math.max(min, Math.round(n)));
}

// Build a style object only when the admin opted in; bad colours/sizes drop to
// undefined so the post falls back to the default look for that field.
function readStyle(form: FormData): EventStyle | undefined {
  if (str(form, "customise") !== "on") return undefined;
  return {
    bg: hexOrUndefined(str(form, "bgColor")),
    text: hexOrUndefined(str(form, "textColor")),
    headlineSize: clampSize(str(form, "headlineSize"), 12, 120),
    bodySize: clampSize(str(form, "bodySize"), 10, 48),
    align: alignOf(str(form, "align")),
    imageSide: imageSideOf(str(form, "imageSide")),
    imageFit: str(form, "imageFit") === "contain" ? "contain" : "cover",
    size: sizeOf(str(form, "size"))
  };
}

/** Shared image processing: webp, max 1920w, EXIF stripped (sharp drops it). */
async function processUpload(file: File): Promise<Buffer> {
  if (!file.type.startsWith("image/")) throw new Error("Please choose an image file.");
  if (file.size > MAX_UPLOAD_BYTES) throw new Error("Image is larger than 10 MB.");
  const input = Buffer.from(await file.arrayBuffer());
  return sharp(input).rotate().resize({ width: 1920, withoutEnlargement: true }).webp({ quality: 75 }).toBuffer();
}

export async function createNotice(_prev: ActionState, form: FormData): Promise<ActionState> {
  try {
    requireAdmin();
    assertConfigured();
    const title = str(form, "title");
    const message = str(form, "message");
    if (!title || !message) return fail("Title and message are required.");
    const notice: Notice = {
      id: crypto.randomUUID(),
      title,
      message,
      kind: str(form, "kind") === "urgent" ? "urgent" : "info",
      activeFrom: isoOrUndefined(form, "activeFrom"),
      activeUntil: isoOrUndefined(form, "activeUntil"),
      createdAt: new Date().toISOString()
    };
    const { notices } = await getClubContentForWrite();
    await writeNotices([notice, ...notices]);
    refresh();
    return { ok: true };
  } catch (err) {
    return fail(err instanceof Error ? err.message : "Could not save the notice.");
  }
}

export async function endNotice(form: FormData): Promise<void> {
  requireAdmin();
  assertConfigured();
  const id = str(form, "id");
  const { notices } = await getClubContentForWrite();
  await writeNotices(notices.map((n) => (n.id === id ? { ...n, activeUntil: new Date().toISOString() } : n)));
  refresh();
}

export async function deleteNotice(form: FormData): Promise<void> {
  requireAdmin();
  assertConfigured();
  const id = str(form, "id");
  const { notices } = await getClubContentForWrite();
  await writeNotices(notices.filter((n) => n.id !== id));
  refresh();
}

export async function createEvent(_prev: ActionState, form: FormData): Promise<ActionState> {
  try {
    requireAdmin();
    assertConfigured();
    const headline = str(form, "headline");
    const body = str(form, "body");
    if (!headline || !body) return fail("Headline and text are required.");
    const ctaLabel = str(form, "ctaLabel") || undefined;
    const ctaHrefRaw = str(form, "ctaHref");
    const ctaHref = normalizeHref(ctaHrefRaw) ?? undefined;
    if (ctaHrefRaw && (!ctaHref || !SAFE_HREF.test(ctaHref))) {
      return fail("That button link doesn't look valid. Use a page like /join-us or a full https:// address.");
    }
    const file = form.get("image");
    if (!(file instanceof File) || file.size === 0) return fail("An image is required.");
    const id = crypto.randomUUID();
    const processed = await processUpload(file); // validates type/size (may throw -> caught)
    const url = await uploadImage(`events/${id}.webp`, processed); // image first, JSON last
    const event: EventPost = {
      id,
      image: url,
      headline,
      body,
      ctaLabel,
      ctaHref,
      placement: placementOf(str(form, "placement")),
      style: readStyle(form),
      activeFrom: isoOrUndefined(form, "activeFrom"),
      activeUntil: isoOrUndefined(form, "activeUntil"),
      createdAt: new Date().toISOString()
    };
    const { events } = await getClubContentForWrite();
    await writeEvents([event, ...events]);
    refresh();
    return { ok: true };
  } catch (err) {
    return fail(err instanceof Error ? err.message : "Could not publish the event.");
  }
}

export async function updateEvent(_prev: ActionState, form: FormData): Promise<ActionState> {
  try {
    requireAdmin();
    assertConfigured();
    const id = str(form, "id");
    if (!id) return fail("Missing post id.");
    const { events } = await getClubContentForWrite();
    const existing = events.find((e) => e.id === id);
    if (!existing) return fail("That post no longer exists — it may have been deleted.");
    const headline = str(form, "headline");
    const body = str(form, "body");
    if (!headline || !body) return fail("Headline and text are required.");
    const ctaLabel = str(form, "ctaLabel") || undefined;
    const ctaHrefRaw = str(form, "ctaHref");
    const ctaHref = normalizeHref(ctaHrefRaw) ?? undefined;
    if (ctaHrefRaw && (!ctaHref || !SAFE_HREF.test(ctaHref))) {
      return fail("That button link doesn't look valid. Use a page like /join-us or a full https:// address.");
    }
    // Replace the image only if a new one was chosen; otherwise keep the current.
    let image = existing.image;
    const file = form.get("image");
    if (file instanceof File && file.size > 0) {
      const processed = await processUpload(file);
      image = await uploadImage(`events/${id}-${Date.now()}.webp`, processed);
      if (existing.image && existing.image !== image) {
        try {
          await deleteImage(existing.image);
        } catch (err) {
          console.error("[content] old event image delete failed (harmless):", err);
        }
      }
    }
    const updated: EventPost = {
      ...existing, // keeps id + createdAt (and so the post's position)
      image,
      headline,
      body,
      ctaLabel,
      ctaHref,
      placement: placementOf(str(form, "placement")),
      style: readStyle(form),
      activeFrom: isoOrUndefined(form, "activeFrom"),
      activeUntil: isoOrUndefined(form, "activeUntil")
    };
    await writeEvents(events.map((e) => (e.id === id ? updated : e)));
    refresh();
    return { ok: true };
  } catch (err) {
    return fail(err instanceof Error ? err.message : "Could not save the changes.");
  }
}

export async function endEvent(form: FormData): Promise<void> {
  requireAdmin();
  assertConfigured();
  const id = str(form, "id");
  const { events } = await getClubContentForWrite();
  await writeEvents(events.map((e) => (e.id === id ? { ...e, activeUntil: new Date().toISOString() } : e)));
  refresh();
}

export async function deleteEvent(form: FormData): Promise<void> {
  requireAdmin();
  assertConfigured();
  const id = str(form, "id");
  const { events } = await getClubContentForWrite();
  const target = events.find((e) => e.id === id);
  await writeEvents(events.filter((e) => e.id !== id));
  if (target?.image) {
    try {
      await deleteImage(target.image); // free the blob; harmless if it fails
    } catch (err) {
      console.error("[content] event image delete failed (harmless):", err);
    }
  }
  refresh();
}

export async function uploadSlotPhoto(_prev: ActionState, form: FormData): Promise<ActionState> {
  try {
    requireAdmin();
    assertConfigured();
    const slot = str(form, "slot");
    if (!PHOTO_SLOTS.some((s) => s.key === slot)) return fail(`Unknown photo slot: ${slot}`);
    const file = form.get("image");
    if (!(file instanceof File) || file.size === 0) return fail("Choose an image first.");
    const processed = await processUpload(file);
    const url = await uploadImage(`photos/${slot}-${Date.now()}.webp`, processed);
    const { photoOverrides } = await getClubContentForWrite();
    await writePhotoOverrides({ ...photoOverrides, [slot]: { url, updatedAt: new Date().toISOString() } });
    refresh();
    return { ok: true };
  } catch (err) {
    return fail(err instanceof Error ? err.message : "Could not upload the photo.");
  }
}

export async function restoreSlotPhoto(form: FormData): Promise<void> {
  requireAdmin();
  assertConfigured();
  const slot = str(form, "slot");
  const { photoOverrides } = await getClubContentForWrite();
  const { [slot]: _removed, ...rest } = photoOverrides;
  await writePhotoOverrides(rest);
  refresh();
}
