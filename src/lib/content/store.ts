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
// null = file doesn't exist yet (nothing published).
async function fetchJson(pathname: string): Promise<string | null> {
  const res = await fetch(`${BLOB_BASE}/${pathname}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`blob fetch ${res.status}`);
  return res.text();
}

/** Cached read of all club content. Fail-soft: any error -> empty content. */
export const getClubContent = unstable_cache(
  async (): Promise<ClubContent> => {
    try {
      const [noticesRaw, eventsRaw, photosRaw] = await Promise.all([
        fetchJson(PATHS.notices),
        fetchJson(PATHS.events),
        fetchJson(PATHS.photos)
      ]);
      return {
        notices: parseNotices(noticesRaw ?? "[]"),
        events: parseEvents(eventsRaw ?? "[]"),
        photoOverrides: parsePhotoOverrides(photosRaw ?? "{}")
      };
    } catch (error) {
      console.error("[content] read failed, rendering without club content:", error);
      return EMPTY;
    }
  },
  ["club-content"],
  { revalidate: 60, tags: ["club-content"] }
);

async function writeJson(pathname: string, data: unknown): Promise<void> {
  await put(pathname, JSON.stringify(data, null, 2), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
    cacheControlMaxAge: 60
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
