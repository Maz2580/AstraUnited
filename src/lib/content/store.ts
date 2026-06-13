import { cache } from "react";
import { unstable_cache } from "next/cache";
import { put, list, del } from "@vercel/blob";
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

// Each content type is stored as IMMUTABLE, versioned JSON under its own prefix.
// Every edit writes a brand-new file (addRandomSuffix) and prunes the old ones;
// a URL's bytes never change, so the Blob CDN can never serve a stale copy of an
// edited file. (Overwriting one fixed file is the trap: the CDN caches by
// pathname and ignores query strings, so an overwrite reads back stale for up to
// its TTL — which resurrected deleted notices on the next read-modify-write.)
const PREFIXES = {
  notices: "content/notices/",
  events: "content/events/",
  photos: "content/photo-overrides/"
} as const;

// Resolve and fetch the newest version under a prefix. list() is the
// strongly-consistent metadata API (read-after-write), so it always sees the
// file a just-completed put() created; the file it points at is immutable, so
// fetching it can't be stale. null = nothing published yet.
async function readLatest(prefix: string): Promise<string | null> {
  const { blobs } = await list({ prefix, limit: 1000 });
  if (blobs.length === 0) return null;
  const newest = blobs.reduce((a, b) => (b.uploadedAt > a.uploadedAt ? b : a));
  const res = await fetch(newest.url, { cache: "no-store" });
  if (res.status === 404) return null; // pruned mid-read; treat as empty
  if (!res.ok) throw new Error(`blob fetch ${res.status} for ${newest.pathname}`);
  return res.text();
}

// allSettled (not all): a transient failure on one type shouldn't hide the
// other two. A rejected type falls back to its own empty default + logs which.
function settledRaw(result: PromiseSettledResult<string | null>): string | null {
  if (result.status === "fulfilled") return result.value;
  console.error("[content] partial read failed:", result.reason);
  return null;
}

async function readAll(): Promise<ClubContent> {
  try {
    const [notices, events, photos] = await Promise.allSettled([
      readLatest(PREFIXES.notices),
      readLatest(PREFIXES.events),
      readLatest(PREFIXES.photos)
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

// Two cache layers for display: unstable_cache persists across requests (60s +
// tag bust on every admin write); React cache() dedupes within a single request,
// so the 5-7 server components that read content on one page resolve to ONE
// underlying read even on a cold cache.
const loadClubContent = unstable_cache(() => readAll(), ["club-content"], {
  revalidate: 60,
  tags: ["club-content"]
});

/** Request-deduped, cross-request-cached read of all club content (for display). */
export const getClubContent = cache(loadClubContent);

/**
 * Uncached read for the admin WRITE path only. A write action does read-modify-
 * write; it must start from the latest committed state, never a 60s-old
 * unstable_cache entry. readLatest() resolves the newest version via the
 * strongly-consistent list() API, so this is always current.
 */
export const getClubContentForWrite = () => readAll();

// Write a new immutable version, then prune older versions of the same type.
// Pruning is best-effort: a failed delete just leaves an extra file behind, and
// readLatest() still picks the newest, so correctness never depends on it.
async function writeVersion(prefix: string, data: unknown): Promise<void> {
  const before = await list({ prefix, limit: 1000 });
  const written = await put(`${prefix}data.json`, JSON.stringify(data, null, 2), {
    access: "public",
    addRandomSuffix: true, // immutable unique URL — never overwrite
    contentType: "application/json"
  });
  const stale = before.blobs.filter((b) => b.url !== written.url).map((b) => b.url);
  if (stale.length) {
    try {
      await del(stale);
    } catch (error) {
      console.error("[content] pruning old versions failed (harmless):", error);
    }
  }
}

export const writeNotices = (n: Notice[]) => writeVersion(PREFIXES.notices, n);
export const writeEvents = (e: EventPost[]) => writeVersion(PREFIXES.events, e);
export const writePhotoOverrides = (p: PhotoOverrides) => writeVersion(PREFIXES.photos, p);

/** Upload a processed image buffer; returns its public URL. Image filenames are
 *  already unique (uuid / slot+timestamp), so these stay long-cached. */
export async function uploadImage(pathname: string, body: Buffer): Promise<string> {
  const blob = await put(pathname, body, {
    access: "public",
    contentType: "image/webp",
    cacheControlMaxAge: 31536000
  });
  return blob.url;
}
