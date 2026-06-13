import { cache } from "react";
import { unstable_cache } from "next/cache";
import { put } from "@vercel/blob";
import {
  parseEvents,
  parseNotices,
  parsePhotoOverrides,
  type EventPost,
  type Notice,
  type PhotoOverrides
} from "./types";

export type ClubContent = {
  notices: Notice[];
  events: EventPost[];
  photoOverrides: PhotoOverrides;
};

const EMPTY: ClubContent = { notices: [], events: [], photoOverrides: {} };

const PATHS = {
  notices: "content/notices.json",
  events: "content/events.json",
  photos: "content/photo-overrides.json"
} as const;

// The store is PUBLIC: reads are plain CDN fetches, no auth anywhere.
// Base URL is public information (it's in every served image URL anyway);
// env override exists for store migration without a code change.
const BLOB_BASE =
  process.env.BLOB_PUBLIC_BASE_URL ?? "https://6yywru0gnpljts2r.public.blob.vercel-storage.com";

// no-store on the inner fetch makes unstable_cache the SINGLE cache layer:
// when an admin action calls revalidateTag("club-content"), the wrapper re-runs
// and hits the origin immediately (no second 60s Data-Cache window to wait out).
// `bust` appends a unique query string so the Blob CDN edge can't serve a stale
// copy either — used by the write path, which must read the very latest before
// it modifies-and-writes back (otherwise concurrent/rapid edits clobber).
// null = file doesn't exist yet (nothing published).
async function fetchJson(pathname: string, bust = false): Promise<string | null> {
  const url = bust ? `${BLOB_BASE}/${pathname}?t=${Date.now()}` : `${BLOB_BASE}/${pathname}`;
  const res = await fetch(url, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`blob fetch ${res.status} for ${pathname}`);
  return res.text();
}

// allSettled (not all): a transient failure on one file shouldn't hide the
// other two. A rejected file falls back to its own empty default + logs which.
function settledRaw(result: PromiseSettledResult<string | null>): string | null {
  if (result.status === "fulfilled") return result.value;
  console.error("[content] partial read failed:", result.reason);
  return null;
}

async function readAll(bust: boolean): Promise<ClubContent> {
  try {
    const [notices, events, photos] = await Promise.allSettled([
      fetchJson(PATHS.notices, bust),
      fetchJson(PATHS.events, bust),
      fetchJson(PATHS.photos, bust)
    ]);
    return {
      notices: parseNotices(settledRaw(notices) ?? "[]"),
      events: parseEvents(settledRaw(events) ?? "[]"),
      photoOverrides: parsePhotoOverrides(settledRaw(photos) ?? "{}")
    };
  } catch (error) {
    console.error("[content] read failed, rendering without club content:", error);
    return EMPTY;
  }
}

// Two cache layers: unstable_cache persists across requests (60s + tag bust);
// React cache() dedupes within a single request, so the 5-7 server components
// that read content on one page resolve to ONE underlying fetch even on a cold
// cache, instead of racing to populate it.
const loadClubContent = unstable_cache(() => readAll(false), ["club-content"], {
  revalidate: 60,
  tags: ["club-content"]
});

/** Request-deduped, cross-request-cached read of all club content (for display). */
export const getClubContent = cache(loadClubContent);

/**
 * Uncached, CDN-busting read for the admin WRITE path only. A write action does
 * read-modify-write; it must see the latest array, never a stale unstable_cache
 * entry or a 60s-old CDN edge copy — otherwise a second quick edit overwrites
 * the first. Never use this for page rendering (it skips all caching on purpose).
 */
export const getClubContentForWrite = () => readAll(true);

async function writeJson(pathname: string, data: unknown): Promise<void> {
  await put(pathname, JSON.stringify(data, null, 2), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
    // These tiny control files are overwritten on every edit and must read back
    // fresh — both for the admin's display refresh and for the next read-modify-
    // write. unstable_cache (60s) already absorbs public read load, so the Blob
    // copy itself stays uncached at the edge. Images keep their long cache.
    cacheControlMaxAge: 0
  });
}

export const writeNotices = (n: Notice[]) => writeJson(PATHS.notices, n);
export const writeEvents = (e: EventPost[]) => writeJson(PATHS.events, e);
export const writePhotoOverrides = (p: PhotoOverrides) => writeJson(PATHS.photos, p);

/** Upload a processed image buffer; returns its public URL. */
export async function uploadImage(pathname: string, body: Buffer): Promise<string> {
  const blob = await put(pathname, body, {
    access: "public",
    contentType: "image/webp",
    cacheControlMaxAge: 31536000
  });
  return blob.url;
}
