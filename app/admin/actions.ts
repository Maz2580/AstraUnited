"use server";

import { cookies } from "next/headers";
import { revalidatePath, revalidateTag } from "next/cache";
import sharp from "sharp";
import {
  getClubContent,
  uploadImage,
  writeEvents,
  writeNotices,
  writePhotoOverrides
} from "@/src/lib/content/store";
import { PHOTO_SLOTS } from "@/src/lib/content/photo-slots";
import type { EventPost, Notice } from "@/src/lib/content/types";
import type { ActionState } from "./shared";
import { ADMIN_COOKIE, adminToken, isAdmin, passwordMatches } from "./auth";

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
// Mirrors the ctaHref allowlist in types.ts / SpotlightCard (kept local to the
// action so a bad link is rejected at the form, before any image upload).
const SAFE_HREF = /^(https?:\/\/|\/(?!\/))/;

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
    const { notices } = await getClubContent();
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
  const { notices } = await getClubContent();
  await writeNotices(notices.map((n) => (n.id === id ? { ...n, activeUntil: new Date().toISOString() } : n)));
  refresh();
}

export async function deleteNotice(form: FormData): Promise<void> {
  requireAdmin();
  assertConfigured();
  const id = str(form, "id");
  const { notices } = await getClubContent();
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
    const ctaHref = str(form, "ctaHref") || undefined;
    if (ctaHref && !SAFE_HREF.test(ctaHref)) {
      return fail("Link must be a relative path (/...) or an http(s):// URL.");
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
      activeFrom: isoOrUndefined(form, "activeFrom"),
      activeUntil: isoOrUndefined(form, "activeUntil"),
      createdAt: new Date().toISOString()
    };
    const { events } = await getClubContent();
    await writeEvents([event, ...events]);
    refresh();
    return { ok: true };
  } catch (err) {
    return fail(err instanceof Error ? err.message : "Could not publish the event.");
  }
}

export async function endEvent(form: FormData): Promise<void> {
  requireAdmin();
  assertConfigured();
  const id = str(form, "id");
  const { events } = await getClubContent();
  await writeEvents(events.map((e) => (e.id === id ? { ...e, activeUntil: new Date().toISOString() } : e)));
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
    const { photoOverrides } = await getClubContent();
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
  const { photoOverrides } = await getClubContent();
  const { [slot]: _removed, ...rest } = photoOverrides;
  await writePhotoOverrides(rest);
  refresh();
}
