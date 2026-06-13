# Round 5a — Club Ops (Notices, Event Posts, Hidden Admin) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the club a hidden no-auth admin (`/user/admin/login`) that publishes auto-expiring notices (story ring), special event posts (homepage Spotlight band), and photo-slot swaps — all stored in Vercel Blob at $0/month.

**Architecture:** Three JSON files + uploaded images in Vercel Blob. Server components read them through one cached loader (60s revalidate, fail-soft to "nothing live"). Admin pages in the same Next.js app write via server actions using the server-side Blob token; `revalidatePath` makes changes near-instant. Pure logic (expiry, slot resolution, schema parsing) is vitest-covered; UI is verified via Playwright on Mazdak's dev server.

**Tech Stack:** Next.js 14 App Router, TypeScript, Tailwind, `@vercel/blob`, `zod`, `sharp` (already a dependency), vitest.

**Spec:** `docs/superpowers/specs/2026-06-13-astra-round5a-club-ops-design.md`

**Standing constraints (read first):**
- Branch `round5-dream`; **never merge to `main`** — Mazdak ships explicitly.
- `next build` FAILS on the S: drive. Verify builds via Vercel cloud after pushing the branch (`https://api.github.com/repos/Maz2580/AstraUnited/commits/<sha>/status`).
- NEVER start a second dev server; use Mazdak's at `http://localhost:3000` via Playwright.
- S: git operations may fail with "Permission denied" on new dirs — just re-run.
- Commit identity is already repo-local (`mazdak.gh1995@gmail.com`); NO Co-Authored-By trailer.
- Frozen: approved text styles/colours/contrast. New UI must reuse existing utilities (`card-dark`, `band-*`, `crest-type`, `CtaLink`).

## File structure

```
src/lib/content/types.ts            zod schemas + TS types (Notice, EventPost, PhotoOverrides)
src/lib/content/types.test.ts       schema parse/fallback tests
src/lib/content/expiry.ts           isLive(item, now) pure function
src/lib/content/expiry.test.ts      expiry matrix tests
src/lib/content/photo-slots.ts      slot registry + resolvePhoto()
src/lib/content/photo-slots.test.ts registry/resolution tests
src/lib/content/store.ts            Blob read loader (cached, fail-soft) + write helpers
src/components/content/NoticeRing.tsx        client: ring + overlay + urgent auto-open
src/components/content/NoticeRingServer.tsx  server wrapper (fetch + conditional render)
src/components/content/SpotlightCard.tsx     presentational event card (shared with admin preview)
src/components/content/SpotlightSection.tsx  server: homepage band, absent when nothing live
src/components/content/SlotImage.tsx         server: override-else-default Image
app/user/admin/login/page.tsx       admin dashboard (tabs)
app/user/admin/login/actions.ts     server actions (create/end/upload/restore)
app/user/admin/login/NoticeForm.tsx,EventForm.tsx,PhotoSlotCard.tsx  client form components
Modified: next.config.mjs, app/layout.tsx, app/page.tsx, app/[slug]/page.tsx,
          src/components/blocks/PageHero.tsx, package.json
```

---

### Task 0: One-time Blob store setup (NEEDS MAZDAK — do first, don't block on it)

**This is the only manual step.** Ask Mazdak (or do together):
1. Vercel dashboard → the `astra-united` project → **Storage** tab → **Create Database → Blob** → name it `astra-content` → **Connect** to the project (this auto-adds `BLOB_READ_WRITE_TOKEN` to the project's env for all environments).
2. Copy the token (Storage → store → `.env.local` snippet) into `S:\sash work\Astra united\.env.local` as `BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...` so the local dev server can write too. `.env.local` is gitignored — verify with `git check-ignore .env.local`.

- [ ] **Step 0.1:** Confirm `.env.local` contains `BLOB_READ_WRITE_TOKEN` and `git check-ignore .env.local` prints the path (it is ignored).

All read paths are built fail-soft, so Tasks 1–7 can be implemented and committed before the token exists; admin writes (Task 8+) need it for live testing.

---

### Task 1: Dependencies + Next config

**Files:**
- Modify: `package.json` (via npm)
- Modify: `next.config.mjs`

- [ ] **Step 1.1: Install deps**

Run: `npm install @vercel/blob zod`
Expected: both appear under `dependencies`. (If EBUSY/locked on S: while the dev server runs, re-run once; if still failing, ask Mazdak to stop the dev server for 30 seconds.)

- [ ] **Step 1.2: Replace `next.config.mjs` contents**

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" }
    ]
  },
  experimental: {
    serverActions: { bodySizeLimit: "12mb" }
  }
};

export default nextConfig;
```

(12 MB action body = spec's 10 MB max upload + form overhead.)

- [ ] **Step 1.3: Typecheck**

Run: `npm run typecheck` — Expected: clean (config is JS but catches nothing broken elsewhere).

- [ ] **Step 1.4: Commit**

```
git add package.json package-lock.json next.config.mjs
git commit -m "feat: add @vercel/blob + zod, allow blob images and 12mb server actions"
```

---

### Task 2: Content types (zod) + expiry — TDD

**Files:**
- Create: `src/lib/content/types.ts`, `src/lib/content/expiry.ts`
- Test: `src/lib/content/types.test.ts`, `src/lib/content/expiry.test.ts`

- [ ] **Step 2.1: Write failing tests**

`src/lib/content/expiry.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { isLive } from "./expiry";

const at = (s: string) => new Date(s);

describe("isLive", () => {
  const base = { activeFrom: "2026-06-10T00:00:00.000Z", activeUntil: "2026-06-20T00:00:00.000Z" };

  it("is live inside the window", () => {
    expect(isLive(base, at("2026-06-15T12:00:00.000Z"))).toBe(true);
  });
  it("is not live before activeFrom", () => {
    expect(isLive(base, at("2026-06-09T23:59:59.000Z"))).toBe(false);
  });
  it("expires exactly at activeUntil (now < until is required)", () => {
    expect(isLive(base, at("2026-06-20T00:00:00.000Z"))).toBe(false);
  });
  it("starts exactly at activeFrom (from <= now)", () => {
    expect(isLive(base, at("2026-06-10T00:00:00.000Z"))).toBe(true);
  });
  it("no activeUntil means live forever once started", () => {
    expect(isLive({ activeFrom: base.activeFrom }, at("2030-01-01T00:00:00.000Z"))).toBe(true);
  });
  it("no activeFrom means live immediately", () => {
    expect(isLive({ activeUntil: base.activeUntil }, at("2026-06-01T00:00:00.000Z"))).toBe(true);
  });
  it("invalid dates are treated as unset", () => {
    expect(isLive({ activeFrom: "garbage" }, at("2026-06-15T00:00:00.000Z"))).toBe(true);
  });
});
```

`src/lib/content/types.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { parseEvents, parseNotices, parsePhotoOverrides } from "./types";

describe("content parsing", () => {
  it("parses a valid notices payload", () => {
    const parsed = parseNotices(
      JSON.stringify([
        {
          id: "n1",
          title: "Training cancelled tonight",
          message: "Heavy rain at DISC — all U6-U12 sessions are off.",
          kind: "urgent",
          activeUntil: "2026-06-14T10:00:00.000Z",
          createdAt: "2026-06-13T05:00:00.000Z"
        }
      ])
    );
    expect(parsed).toHaveLength(1);
    expect(parsed[0].kind).toBe("urgent");
  });

  it("falls back to empty on malformed JSON", () => {
    expect(parseNotices("{not json")).toEqual([]);
    expect(parseEvents("[{\"id\":1}]")).toEqual([]);
    expect(parsePhotoOverrides("null")).toEqual({});
  });

  it("parses photo overrides map", () => {
    const parsed = parsePhotoOverrides(
      JSON.stringify({ "home-welcome": { url: "https://x.public.blob.vercel-storage.com/photos/a.webp", updatedAt: "2026-06-13T05:00:00.000Z" } })
    );
    expect(parsed["home-welcome"].url).toContain("blob.vercel-storage.com");
  });
});
```

- [ ] **Step 2.2: Run tests, verify they fail**

Run: `npm test` — Expected: FAIL (`./expiry`, `./types` not found).

- [ ] **Step 2.3: Implement**

`src/lib/content/expiry.ts`:
```ts
export type ActiveWindow = { activeFrom?: string; activeUntil?: string };

function toTime(value: string | undefined): number | null {
  if (!value) return null;
  const t = Date.parse(value);
  return Number.isNaN(t) ? null : t;
}

/** Read-time auto-expiry: live iff activeFrom <= now < activeUntil (unset bounds are open). */
export function isLive(item: ActiveWindow, now: Date): boolean {
  const t = now.getTime();
  const from = toTime(item.activeFrom);
  const until = toTime(item.activeUntil);
  if (from !== null && t < from) return false;
  if (until !== null && t >= until) return false;
  return true;
}
```

`src/lib/content/types.ts`:
```ts
import { z } from "zod";

export const noticeSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  message: z.string().min(1),
  kind: z.enum(["info", "urgent"]),
  activeFrom: z.string().optional(),
  activeUntil: z.string().optional(),
  createdAt: z.string()
});
export type Notice = z.infer<typeof noticeSchema>;

export const eventPostSchema = z.object({
  id: z.string().min(1),
  image: z.string().url(),
  headline: z.string().min(1),
  body: z.string().min(1),
  ctaLabel: z.string().optional(),
  ctaHref: z.string().optional(),
  activeFrom: z.string().optional(),
  activeUntil: z.string().optional(),
  createdAt: z.string()
});
export type EventPost = z.infer<typeof eventPostSchema>;

export const photoOverridesSchema = z.record(
  z.object({ url: z.string().url(), updatedAt: z.string() })
);
export type PhotoOverrides = z.infer<typeof photoOverridesSchema>;

function safeParse<T>(schema: z.ZodType<T>, raw: string, fallback: T): T {
  try {
    const result = schema.safeParse(JSON.parse(raw));
    if (!result.success) {
      console.error("[content] schema mismatch:", result.error.issues[0]);
      return fallback;
    }
    return result.data;
  } catch (error) {
    console.error("[content] malformed JSON:", error);
    return fallback;
  }
}

export const parseNotices = (raw: string): Notice[] => safeParse(z.array(noticeSchema), raw, []);
export const parseEvents = (raw: string): EventPost[] => safeParse(z.array(eventPostSchema), raw, []);
export const parsePhotoOverrides = (raw: string): PhotoOverrides => safeParse(photoOverridesSchema, raw, {});
```

- [ ] **Step 2.4: Run tests, verify pass** — `npm test` → all green (25 existing + new).

- [ ] **Step 2.5: Commit**

```
git add src/lib/content/types.ts src/lib/content/types.test.ts src/lib/content/expiry.ts src/lib/content/expiry.test.ts
git commit -m "feat: club content schemas with fail-soft parsing and read-time expiry"
```

---

### Task 3: Photo slot registry — TDD

**Files:**
- Create: `src/lib/content/photo-slots.ts`
- Test: `src/lib/content/photo-slots.test.ts`

Slot keys cover the 5 homepage photos and the 6 inner-page heroes. Defaults are copied **verbatim** from `app/page.tsx` (photos/academyCards consts) and `src/lib/site-data.ts` (hero blocks) — when implementing, copy each `src`/`alt`/`blurDataURL` exactly from those files rather than from this plan.

- [ ] **Step 3.1: Write failing test**

`src/lib/content/photo-slots.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { PHOTO_SLOTS, resolvePhoto, type SlotKey } from "./photo-slots";

describe("photo slots", () => {
  it("has the expected slot keys", () => {
    const keys = PHOTO_SLOTS.map((s) => s.key);
    expect(keys).toEqual([
      "home-welcome",
      "home-academy-mini",
      "home-academy-junior",
      "home-academy-youth",
      "home-news",
      "hero-the-club",
      "hero-teams",
      "hero-join-us",
      "hero-news-media",
      "hero-sponsors",
      "hero-contact"
    ]);
  });

  it("every slot has a default image and label", () => {
    for (const slot of PHOTO_SLOTS) {
      expect(slot.label.length).toBeGreaterThan(0);
      expect(slot.default.src).toMatch(/^\/images\/.+\.webp$/);
      expect(slot.default.alt.length).toBeGreaterThan(0);
    }
  });

  it("resolvePhoto returns the override url when present", () => {
    const overrides = { "home-welcome": { url: "https://x.public.blob.vercel-storage.com/p.webp", updatedAt: "2026-06-13T00:00:00.000Z" } };
    const resolved = resolvePhoto("home-welcome", overrides);
    expect(resolved.src).toBe(overrides["home-welcome"].url);
    expect(resolved.isOverride).toBe(true);
    expect(resolved.alt.length).toBeGreaterThan(0); // alt always comes from the registry
  });

  it("resolvePhoto falls back to the default", () => {
    const resolved = resolvePhoto("home-news", {});
    expect(resolved.src).toMatch(/^\/images\//);
    expect(resolved.isOverride).toBe(false);
    expect(resolved.blurDataURL).toBeDefined();
  });
});
```

- [ ] **Step 3.2: Run, verify fail** — `npm test` → module not found.

- [ ] **Step 3.3: Implement `src/lib/content/photo-slots.ts`**

```ts
import type { PhotoOverrides } from "./types";

export type PhotoSlot = {
  key: string;
  label: string; // shown in the admin Photos tab
  default: { src: string; alt: string; blurDataURL?: string };
};

// Defaults duplicated from app/page.tsx + site-data heroes ON PURPOSE: the
// registry is the single list the admin sees; the pages keep working even if
// a slot is removed here. Copy src/alt/blurDataURL VERBATIM from the sources.
export const PHOTO_SLOTS: PhotoSlot[] = [
  { key: "home-welcome", label: "Homepage — Welcome section photo", default: { src: "/images/academy/astra-academy-training-wide-1280.webp", alt: "<copy from app/page.tsx photos.welcome>", blurDataURL: "<copy>" } },
  { key: "home-academy-mini", label: "Homepage — Mini-Kickers card", default: { src: "/images/academy/astra-academy-mini-kickers-1280.webp", alt: "<copy>", blurDataURL: "<copy>" } },
  { key: "home-academy-junior", label: "Homepage — Junior Academy card", default: { src: "/images/academy/astra-academy-dribble-duel-1280.webp", alt: "<copy>", blurDataURL: "<copy>" } },
  { key: "home-academy-youth", label: "Homepage — Youth Development card", default: { src: "/images/academy/astra-academy-youth-training-1280.webp", alt: "<copy>", blurDataURL: "<copy>" } },
  { key: "home-news", label: "Homepage — News & media photo", default: { src: "/images/community/astra-community-team-photo-1280.webp", alt: "<copy>", blurDataURL: "<copy>" } },
  { key: "hero-the-club", label: "The Club — page hero", default: { src: "/images/community/astra-community-squad-portrait-1920.webp", alt: "The Club page hero", blurDataURL: "<copy from site-data>" } },
  { key: "hero-teams", label: "Teams — page hero", default: { src: "/images/academy/astra-academy-youth-training-1920.webp", alt: "Teams page hero", blurDataURL: "<copy>" } },
  { key: "hero-join-us", label: "Join Us — page hero", default: { src: "/images/academy/astra-academy-training-wide-1920.webp", alt: "Join Us page hero", blurDataURL: "<copy>" } },
  { key: "hero-news-media", label: "News & Media — page hero", default: { src: "/images/community/astra-community-team-photo-1920.webp", alt: "News page hero", blurDataURL: "<copy>" } },
  { key: "hero-sponsors", label: "Sponsors — page hero", default: { src: "/images/kit/astra-kit-ball-1920.webp", alt: "Sponsors page hero", blurDataURL: "<copy>" } },
  { key: "hero-contact", label: "Contact — page hero", default: { src: "/images/academy/astra-academy-coaching-huddle-1920.webp", alt: "Contact page hero", blurDataURL: "<copy>" } }
];

export type SlotKey = (typeof PHOTO_SLOTS)[number]["key"];

export type ResolvedPhoto = {
  src: string;
  alt: string;
  blurDataURL?: string;
  isOverride: boolean;
};

export function resolvePhoto(key: SlotKey, overrides: PhotoOverrides): ResolvedPhoto {
  const slot = PHOTO_SLOTS.find((s) => s.key === key);
  if (!slot) return { src: "", alt: "", isOverride: false };
  const override = overrides[key];
  if (override?.url) {
    // alt stays from the registry; uploads have no blur placeholder.
    return { src: override.url, alt: slot.default.alt, isOverride: true };
  }
  return { ...slot.default, isOverride: false };
}
```

(The `<copy>` markers above are instructions to the implementer to transplant the exact existing strings — they must NOT survive into the committed file. The test's `blurDataURL toBeDefined` will catch forgotten ones for `home-news`.)

- [ ] **Step 3.4: Run, verify pass** — `npm test`.

- [ ] **Step 3.5: Commit**

```
git add src/lib/content/photo-slots.ts src/lib/content/photo-slots.test.ts
git commit -m "feat: photo slot registry with override-else-default resolution"
```

---

### Task 4: Blob content store (read loader + write helpers)

**Files:**
- Create: `src/lib/content/store.ts`

No unit tests here (it's all I/O glue around the tested parsers); verified live in Tasks 8–10.

- [ ] **Step 4.1: Implement `src/lib/content/store.ts`**

```ts
import { unstable_cache } from "next/cache";
import { list, put } from "@vercel/blob";
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

async function fetchJson(url: string): Promise<string> {
  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`blob fetch ${res.status}`);
  return res.text();
}

/** Cached read of all club content. Fail-soft: any error -> empty content. */
export const getClubContent = unstable_cache(
  async (): Promise<ClubContent> => {
    if (!process.env.BLOB_READ_WRITE_TOKEN) return EMPTY;
    try {
      const { blobs } = await list({ prefix: "content/" });
      const find = (p: string) => blobs.find((b) => b.pathname === p)?.url;
      const [noticesRaw, eventsRaw, photosRaw] = await Promise.all([
        find(PATHS.notices) ? fetchJson(find(PATHS.notices)!) : "[]",
        find(PATHS.events) ? fetchJson(find(PATHS.events)!) : "[]",
        find(PATHS.photos) ? fetchJson(find(PATHS.photos)!) : "{}"
      ]);
      return {
        notices: parseNotices(noticesRaw),
        events: parseEvents(eventsRaw),
        photoOverrides: parsePhotoOverrides(photosRaw)
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
```

- [ ] **Step 4.2:** `npm run typecheck` → clean. `npm test` → still green.

- [ ] **Step 4.3: Commit**

```
git add src/lib/content/store.ts
git commit -m "feat: cached fail-soft blob content store with write helpers"
```

---

### Task 5: Notice ring (visitor side)

**Files:**
- Create: `src/components/content/NoticeRing.tsx` (client), `src/components/content/NoticeRingServer.tsx` (server)
- Modify: `app/layout.tsx`

- [ ] **Step 5.1: Create `src/components/content/NoticeRingServer.tsx`**

```tsx
import { getClubContent } from "@/src/lib/content/store";
import { isLive } from "@/src/lib/content/expiry";
import { NoticeRing } from "./NoticeRing";

export async function NoticeRingServer() {
  const { notices } = await getClubContent();
  const live = notices
    .filter((n) => isLive(n, new Date()))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  if (live.length === 0) return null;
  return <NoticeRing notices={live} />;
}
```

- [ ] **Step 5.2: Create `src/components/content/NoticeRing.tsx`** (client)

Behaviour requirements:
- Fixed bottom-left (`fixed bottom-5 left-5 z-50`), a 56px circle with a 2px `astra-gold` ring + chip showing the newest notice title (truncate ~28ch). Crest-dark fill (`bg-astra-ink` + megaphone `lucide-react` icon in gold).
- `kind === "urgent"` anywhere in the list → ring gets `animate-pulse` (Tailwind built-in, disabled under `motion-reduce:animate-none`).
- Click → full-screen overlay (`fixed inset-0 z-[60] bg-astra-ink/95 backdrop-blur`): dark card per notice (`card-dark p-7 max-w-lg`), title in `crest-type text-3xl text-white`, message `text-white/80`, kicker `URGENT`/`NOTICE` in `text-astra-red`/`text-astra-gold`. Multiple notices → prev/next arrows + counter ("1 / 2"). Close button top-right + Escape + backdrop click. Focus is moved into the dialog on open (`role="dialog"`, `aria-modal`, initial focus on close button) and restored on close.
- Urgent auto-open ONCE per device per day: on mount, if any urgent notice's `id` is missing from `localStorage["astra-urgent-seen"]` (JSON map id -> `YYYY-MM-DD`), open the overlay automatically and record today's date for those ids. Info notices never auto-open. Guard all localStorage access in try/catch (private browsing).

```tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Megaphone, X, ChevronLeft, ChevronRight } from "lucide-react";
import type { Notice } from "@/src/lib/content/types";

const SEEN_KEY = "astra-urgent-seen";

function todaysSeen(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(SEEN_KEY) ?? "{}");
  } catch {
    return {};
  }
}

export function NoticeRing({ notices }: { notices: Notice[] }) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const closeRef = useRef<HTMLButtonElement>(null);
  const hasUrgent = notices.some((n) => n.kind === "urgent");

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const seen = todaysSeen();
    const unseenUrgent = notices.filter((n) => n.kind === "urgent" && seen[n.id] !== today);
    if (unseenUrgent.length > 0) {
      setOpen(true);
      try {
        const next = { ...seen };
        for (const n of unseenUrgent) next[n.id] = today;
        localStorage.setItem(SEEN_KEY, JSON.stringify(next));
      } catch {
        /* private browsing: just open, don't persist */
      }
    }
  }, [notices]);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const current = notices[Math.min(index, notices.length - 1)];
  const step = useCallback(
    (d: number) => setIndex((i) => (i + d + notices.length) % notices.length),
    [notices.length]
  );

  return (
    <>
      <button
        type="button"
        onClick={() => { setIndex(0); setOpen(true); }}
        className="fixed bottom-5 left-5 z-50 flex items-center gap-3"
        aria-label={`Club notices (${notices.length})`}
      >
        <span
          className={`flex h-14 w-14 items-center justify-center rounded-full border-2 border-astra-gold bg-astra-ink shadow-[0_0_0_3px_rgba(200,164,77,0.25)] ${hasUrgent ? "animate-pulse motion-reduce:animate-none" : ""}`}
        >
          <Megaphone aria-hidden="true" className="h-6 w-6 text-astra-gold" />
        </span>
        <span className="max-w-[16rem] truncate rounded-full border border-white/12 bg-astra-ink/90 px-3 py-1.5 text-xs font-bold text-white/85">
          {notices[0].title}
        </span>
      </button>

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Club notice"
          className="fixed inset-0 z-[60] flex items-center justify-center bg-astra-ink/95 px-5 backdrop-blur"
          onClick={() => setOpen(false)}
        >
          <div className="card-dark relative w-full max-w-lg p-7" onClick={(e) => e.stopPropagation()}>
            <button
              ref={closeRef}
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close notice"
              className="absolute right-4 top-4 rounded-full border border-white/12 p-2 text-white/70 transition hover:border-white/35 hover:text-white"
            >
              <X aria-hidden="true" className="h-4 w-4" />
            </button>
            <p className={`text-xs font-black uppercase tracking-[0.14em] ${current.kind === "urgent" ? "text-astra-red" : "text-astra-gold"}`}>
              {current.kind === "urgent" ? "Urgent" : "Club notice"}
            </p>
            <h2 className="crest-type mt-3 text-3xl text-white">{current.title}</h2>
            <p className="mt-4 text-sm leading-6 text-white/80">{current.message}</p>
            {notices.length > 1 ? (
              <div className="mt-6 flex items-center justify-between text-white/70">
                <button type="button" onClick={() => step(-1)} aria-label="Previous notice" className="rounded-full border border-white/12 p-2 transition hover:border-white/35 hover:text-white">
                  <ChevronLeft aria-hidden="true" className="h-4 w-4" />
                </button>
                <span className="text-xs font-bold">{index + 1} / {notices.length}</span>
                <button type="button" onClick={() => step(1)} aria-label="Next notice" className="rounded-full border border-white/12 p-2 transition hover:border-white/35 hover:text-white">
                  <ChevronRight aria-hidden="true" className="h-4 w-4" />
                </button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
```

- [ ] **Step 5.3: Mount in `app/layout.tsx`**

Add import `import { NoticeRingServer } from "@/src/components/content/NoticeRingServer";` and render `<NoticeRingServer />` immediately after `{children}` (before `<SiteFooter />`).

- [ ] **Step 5.4:** `npm run typecheck` + `npm test` → green. Dev-server check happens in Task 8 once content can be created.

- [ ] **Step 5.5: Commit**

```
git add src/components/content/NoticeRing.tsx src/components/content/NoticeRingServer.tsx app/layout.tsx
git commit -m "feat: notice story ring with urgent pulse and once-a-day auto-open"
```

---

### Task 6: Spotlight section (event posts on the homepage)

**Files:**
- Create: `src/components/content/SpotlightCard.tsx`, `src/components/content/SpotlightSection.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 6.1: Create `src/components/content/SpotlightCard.tsx`** (presentational; reused by the admin live preview)

```tsx
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { CtaLink } from "@/src/components/CtaLink";
import type { EventPost } from "@/src/lib/content/types";

export function SpotlightCard({ event }: { event: EventPost }) {
  return (
    <article className="card-dark grid overflow-hidden md:grid-cols-[1fr_1.1fr]">
      <div className="relative min-h-[260px]">
        <Image src={event.image} alt={event.headline} fill sizes="(min-width: 768px) 45vw, 100vw" className="object-cover" />
      </div>
      <div className="p-7 sm:p-9">
        <p className="text-xs font-black uppercase tracking-[0.14em] text-astra-gold">Club spotlight</p>
        <h3 className="crest-type mt-3 text-3xl leading-none text-white sm:text-4xl">{event.headline}</h3>
        <p className="mt-4 text-sm leading-6 text-white/72">{event.body}</p>
        {event.ctaLabel && event.ctaHref ? (
          <CtaLink href={event.ctaHref} className="mt-7 px-5 py-3 text-sm font-black uppercase tracking-wide">
            {event.ctaLabel}
            <ArrowRight aria-hidden="true" className="btn-icon h-4 w-4" />
          </CtaLink>
        ) : null}
      </div>
    </article>
  );
}
```

- [ ] **Step 6.2: Create `src/components/content/SpotlightSection.tsx`** (server)

```tsx
import { getClubContent } from "@/src/lib/content/store";
import { isLive } from "@/src/lib/content/expiry";
import { SpotlightCard } from "./SpotlightCard";

export async function SpotlightSection() {
  const { events } = await getClubContent();
  const live = events
    .filter((e) => isLive(e, new Date()))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  if (live.length === 0) return null;

  return (
    <section className="section-band band-deep border-y border-astra-gold/25">
      <div data-touchline-node className="container-wide">
        {live.length === 1 ? (
          <SpotlightCard event={live[0]} />
        ) : (
          <div className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-3 [scrollbar-width:thin]">
            {live.map((event) => (
              <div key={event.id} className="w-[min(100%,56rem)] shrink-0 snap-center">
                <SpotlightCard event={event} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
```

(Carousel = CSS scroll-snap: swipe on touch, trackpad/shift-scroll on desktop — zero JS, zero annoyance. The gold hairline borders mark it as a deliberate "special" band so the fog/deep alternation around it stays untouched.)

- [ ] **Step 6.3: Insert into `app/page.tsx`** between section 6 (News & media `FlowReveal`) and section 7 (Sponsors): add import `import { SpotlightSection } from "@/src/components/content/SpotlightSection";` and render `<SpotlightSection />` with the comment `{/* 6.5 — Club Spotlight (admin event posts; absent when none live) */}`.

- [ ] **Step 6.4:** `npm run typecheck` + `npm test` → green.

- [ ] **Step 6.5: Commit**

```
git add src/components/content/SpotlightCard.tsx src/components/content/SpotlightSection.tsx app/page.tsx
git commit -m "feat: homepage Club Spotlight band for live event posts"
```

---

### Task 7: SlotImage + wire photo slots into pages

**Files:**
- Create: `src/components/content/SlotImage.tsx`
- Modify: `app/page.tsx`, `src/components/blocks/PageHero.tsx`, `app/[slug]/page.tsx`

- [ ] **Step 7.1: Create `src/components/content/SlotImage.tsx`** (async server component)

```tsx
import Image from "next/image";
import { getClubContent } from "@/src/lib/content/store";
import { resolvePhoto, type SlotKey } from "@/src/lib/content/photo-slots";

type Props = {
  slot: SlotKey;
  width: number;
  height: number;
  sizes: string;
  className: string;
};

export async function SlotImage({ slot, width, height, sizes, className }: Props) {
  const { photoOverrides } = await getClubContent();
  const photo = resolvePhoto(slot, photoOverrides);
  return (
    <Image
      src={photo.src}
      alt={photo.alt}
      width={width}
      height={height}
      sizes={sizes}
      className={className}
      {...(photo.isOverride
        ? {} // uploads have no blurDataURL — render without placeholder
        : photo.blurDataURL
          ? { placeholder: "blur" as const, blurDataURL: photo.blurDataURL }
          : {})}
    />
  );
}
```

- [ ] **Step 7.2: Wire the 5 homepage usages in `app/page.tsx`**

Replace the `<Image src={photos.welcome...}>` with `<SlotImage slot="home-welcome" width={1280} height={853} sizes="(min-width: 1024px) 45vw, 100vw" className="h-[360px] w-full object-cover" />`; same pattern for the three `academyCards` images (slots `home-academy-mini|junior|youth` — map by index: add a `slot` field to each card object) and the news photo (`home-news`, `h-[300px]`). Then delete the now-unused `photos` const and the `blurDataURL`/`src`/`alt` fields from `academyCards` (keep `age/title/copy/slot`). Remove the unused `next/image` import if no direct `Image` use remains.

- [ ] **Step 7.3: PageHero override support**

In `src/components/blocks/PageHero.tsx`, add an optional prop `overrideSrc?: string` and use it:
```tsx
type Props = { eyebrow: string; title: string; intro: string; hero: PageHeroData; overrideSrc?: string };
// in the Image:
src={overrideSrc ?? hero.src}
// blur only when not overridden:
{...(overrideSrc ? {} : { placeholder: "blur" as const, blurDataURL: hero.blurDataURL })}
```

In `app/[slug]/page.tsx`, before rendering PageHero:
```tsx
import { getClubContent } from "@/src/lib/content/store";
import { resolvePhoto } from "@/src/lib/content/photo-slots";
// inside the component:
const { photoOverrides } = await getClubContent();
const heroPhoto = resolvePhoto(`hero-${page.slug}`, photoOverrides);
// pass: overrideSrc={heroPhoto.isOverride ? heroPhoto.src : undefined}
```
(`hero-academy` is not in the registry — `resolvePhoto` returns `isOverride: false` for unknown keys, so the academy page just keeps its default. If the page component isn't already `async`, make it `async`.)

- [ ] **Step 7.4:** `npm run typecheck` + `npm test` → green. Then Playwright against Mazdak's dev server: homepage + `/the-club` render identically to before (no overrides exist yet), zero console errors.

- [ ] **Step 7.5: Commit**

```
git add src/components/content/SlotImage.tsx app/page.tsx src/components/blocks/PageHero.tsx "app/[slug]/page.tsx"
git commit -m "feat: photo slots resolve admin overrides across homepage and page heroes"
```

---

### Task 8: Hidden admin — shell + Notices tab + server actions

**Files:**
- Create: `app/user/admin/login/page.tsx`, `app/user/admin/login/actions.ts`, `app/user/admin/login/NoticeForm.tsx`

- [ ] **Step 8.1: Create `app/user/admin/login/actions.ts`**

```ts
"use server";

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

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

function refresh() {
  revalidateTag("club-content");
  revalidatePath("/", "layout"); // every page can show the ring / photos
}

function requireToken() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("Blob storage is not configured (BLOB_READ_WRITE_TOKEN missing).");
  }
}

const str = (form: FormData, key: string) => String(form.get(key) ?? "").trim();
/** datetime-local inputs are local time; store as ISO. Empty -> undefined. */
function isoOrUndefined(form: FormData, key: string): string | undefined {
  const v = str(form, key);
  if (!v) return undefined;
  const t = new Date(v);
  return Number.isNaN(t.getTime()) ? undefined : t.toISOString();
}

export async function createNotice(form: FormData): Promise<void> {
  requireToken();
  const title = str(form, "title");
  const message = str(form, "message");
  if (!title || !message) throw new Error("Title and message are required.");
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
}

export async function endNotice(form: FormData): Promise<void> {
  requireToken();
  const id = str(form, "id");
  const { notices } = await getClubContent();
  await writeNotices(
    notices.map((n) => (n.id === id ? { ...n, activeUntil: new Date().toISOString() } : n))
  );
  refresh();
}

export async function deleteNotice(form: FormData): Promise<void> {
  requireToken();
  const id = str(form, "id");
  const { notices } = await getClubContent();
  await writeNotices(notices.filter((n) => n.id !== id));
  refresh();
}

/** Shared image processing: webp, max 1920w, EXIF stripped (sharp default). */
async function processUpload(file: File): Promise<Buffer> {
  if (!file.type.startsWith("image/")) throw new Error("Please upload an image file.");
  if (file.size > MAX_UPLOAD_BYTES) throw new Error("Image is larger than 10 MB.");
  const input = Buffer.from(await file.arrayBuffer());
  return sharp(input).rotate().resize({ width: 1920, withoutEnlargement: true }).webp({ quality: 75 }).toBuffer();
}

export async function createEvent(form: FormData): Promise<void> {
  requireToken();
  const headline = str(form, "headline");
  const body = str(form, "body");
  const file = form.get("image");
  if (!headline || !body) throw new Error("Headline and text are required.");
  if (!(file instanceof File) || file.size === 0) throw new Error("An image is required.");
  const id = crypto.randomUUID();
  const processed = await processUpload(file);
  const url = await uploadImage(`events/${id}.webp`, processed); // image first, JSON last
  const event: EventPost = {
    id,
    image: url,
    headline,
    body,
    ctaLabel: str(form, "ctaLabel") || undefined,
    ctaHref: str(form, "ctaHref") || undefined,
    activeFrom: isoOrUndefined(form, "activeFrom"),
    activeUntil: isoOrUndefined(form, "activeUntil"),
    createdAt: new Date().toISOString()
  };
  const { events } = await getClubContent();
  await writeEvents([event, ...events]);
  refresh();
}

export async function endEvent(form: FormData): Promise<void> {
  requireToken();
  const id = str(form, "id");
  const { events } = await getClubContent();
  await writeEvents(
    events.map((e) => (e.id === id ? { ...e, activeUntil: new Date().toISOString() } : e))
  );
  refresh();
}

export async function uploadSlotPhoto(form: FormData): Promise<void> {
  requireToken();
  const slot = str(form, "slot");
  if (!PHOTO_SLOTS.some((s) => s.key === slot)) throw new Error(`Unknown photo slot: ${slot}`);
  const file = form.get("image");
  if (!(file instanceof File) || file.size === 0) throw new Error("Choose an image first.");
  const processed = await processUpload(file);
  const url = await uploadImage(`photos/${slot}-${Date.now()}.webp`, processed);
  const { photoOverrides } = await getClubContent();
  await writePhotoOverrides({ ...photoOverrides, [slot]: { url, updatedAt: new Date().toISOString() } });
  refresh();
}

export async function restoreSlotPhoto(form: FormData): Promise<void> {
  requireToken();
  const slot = str(form, "slot");
  const { photoOverrides } = await getClubContent();
  const { [slot]: _removed, ...rest } = photoOverrides;
  await writePhotoOverrides(rest);
  refresh();
}
```

- [ ] **Step 8.2: Create `app/user/admin/login/page.tsx`** — server component:

- `export const metadata = { title: "Club admin", robots: { index: false, follow: false } };`
- `export const dynamic = "force-dynamic";` (admin always shows fresh content, bypassing the 60s cache where possible — call the uncached pieces via `getClubContent` anyway; the revalidateTag in every action keeps it honest).
- Reads `getClubContent()`, computes status per item with `isLive` (`Live` / `Scheduled` (activeFrom in future) / `Expired`), renders three tab sections via query param `?tab=notices|events|photos` (default notices). Tabs are plain `<Link>`s styled with `nav-underline`; content sections share the dark brand (`bg-astra-ink min-h-screen`, `card-dark` cards, `crest-type` headings).
- Notices tab: `<NoticeForm action={createNotice} />` + a list of all notices, each `card-dark p-5` row showing kind kicker, title, message, window, status chip (`Live` gold / `Scheduled` white/60 / `Expired` white/35), and two inline `<form>`s: `endNotice` ("End now", only when live/scheduled) and `deleteNotice` ("Delete").
- If `BLOB_READ_WRITE_TOKEN` is missing, render a single warning card explaining Task 0 instead of the forms.

- [ ] **Step 8.3: Create `app/user/admin/login/NoticeForm.tsx`** (client) — controlled form with `useFormStatus` submit button ("Publishing…" while pending), fields: title (`mock` of existing input styling: `rounded border border-white/15 bg-white/5 px-3 py-2 text-sm text-white`), message textarea, kind radio (Info / Urgent with one-line explanation "Urgent pulses and opens once automatically"), `datetime-local` inputs for activeFrom/activeUntil (both optional, labelled "Show from (optional)" / "Hide after (optional — auto-expiry)"). Wrap the action with an error boundary pattern: `useState` error + `try/await action/catch setError` via a client wrapper that calls the passed server action and `router.refresh()` on success.

- [ ] **Step 8.4: Verify live with Playwright on `http://localhost:3000/user/admin/login`** (Mazdak's dev server; `.env.local` token from Task 0 required):
  1. Page renders the admin shell; `<meta name="robots" content="noindex, nofollow">` present.
  2. Create an info notice "Test notice — please ignore" → ring appears on `/` with the chip text; click → overlay shows it.
  3. Create an urgent notice → ring pulses; fresh context (Playwright new context = clean localStorage) auto-opens the overlay once; reload → no auto-open (localStorage remembered).
  4. "End now" both notices → ring disappears from `/` (allow one `router.refresh`/reload).
  5. Zero console errors throughout.

- [ ] **Step 8.5: Commit**

```
git add app/user/admin/login
git commit -m "feat: hidden club admin with notices tab (create, end, delete)"
```

---

### Task 9: Admin Events tab with live preview

**Files:**
- Create: `app/user/admin/login/EventForm.tsx`
- Modify: `app/user/admin/login/page.tsx` (events tab content)

- [ ] **Step 9.1: Create `EventForm.tsx`** (client). Same form scaffolding as NoticeForm plus:
- `<input type="file" name="image" accept="image/*">`; on change, `URL.createObjectURL` into local state.
- **Live preview**: renders `<SpotlightCard event={{ id: "preview", image: previewUrl || TRANSPARENT_PIXEL, headline: headline || "Your headline", body: body || "Your text…", ctaLabel, ctaHref, createdAt: "" }} />` under a "Preview — exactly how the homepage will show it" label, updating as the user types. Because `SpotlightCard` uses `next/image` with a blob/object URL, the preview must use a plain `<img>` fallback: give `SpotlightCard` an optional `unoptimized?: boolean` prop that renders `<img className="absolute inset-0 h-full w-full object-cover">` instead of `next/image` when set (preview only — visitor rendering still uses `next/image`).
- Client-side guards mirroring the server: file > 10 MB or non-image → inline error before submit.

- [ ] **Step 9.2: Events tab in `page.tsx`** — `<EventForm action={createEvent} />` + list of all events with thumbnail (`<img>` 96px), headline, window, status chip, "End now" form. 

- [ ] **Step 9.3: Verify with Playwright:** create an event with a real photo from `public/images` (e.g. re-upload `astra-academy-mini-kickers-1280.webp` with headline "Mother's Day Special — test"): preview updates while typing → publish → homepage shows the Spotlight band between News and Sponsors with the image served from `*.public.blob.vercel-storage.com`; "End now" → band gone from the homepage DOM entirely. Zero console errors. Screenshot the band at 1440 and 390 for Mazdak.

- [ ] **Step 9.4: Commit**

```
git add app/user/admin/login/EventForm.tsx app/user/admin/login/page.tsx src/components/content/SpotlightCard.tsx
git commit -m "feat: admin event posts with live spotlight preview"
```

---

### Task 10: Admin Photos tab

**Files:**
- Create: `app/user/admin/login/PhotoSlotCard.tsx`
- Modify: `app/user/admin/login/page.tsx` (photos tab content)

- [ ] **Step 10.1: Create `PhotoSlotCard.tsx`** (client): props `{ slot: { key, label }, currentUrl: string, isOverride: boolean }`. Card shows the label, a 160px-tall `<img>` of `currentUrl`, an "Override active" gold chip when `isOverride`, a file input + "Upload replacement" submit (wraps `uploadSlotPhoto`), and a "Restore default" submit (wraps `restoreSlotPhoto`, only rendered when `isOverride`). Same pending/error handling pattern as the other forms.

- [ ] **Step 10.2: Photos tab in `page.tsx`** — grid (`md:grid-cols-2 xl:grid-cols-3`) of `PhotoSlotCard`s built from `PHOTO_SLOTS` + `resolvePhoto(key, photoOverrides)` (currentUrl = resolved src, which for defaults is the local `/images/...` path — works in `<img>` directly).

- [ ] **Step 10.3: Verify with Playwright:** upload a replacement for `home-welcome` (use a different photo from `public/images`, e.g. the coaching-huddle) → homepage welcome card shows the new image from the blob domain; "Restore default" → original local image is back. Check `/the-club` hero swap + restore via `hero-the-club` the same way. Zero console errors.

- [ ] **Step 10.4: Commit**

```
git add app/user/admin/login/PhotoSlotCard.tsx app/user/admin/login/page.tsx
git commit -m "feat: admin photo slots with upload and restore-default"
```

---

### Task 11: Full verification pass + preview deploy for Mazdak

- [ ] **Step 11.1:** `npm test` (all suites) + `npm run typecheck` → green.

- [ ] **Step 11.2: Playwright sweep on the dev server** — all 8 public pages at 1440×900 and 390×844: zero console errors, no layout shifts vs. live production when **no content is live** (the t1.PNG rule: with everything ended/expired, the DOM must contain no ring, no Spotlight band, no empty containers — assert `document.querySelector('[aria-label^="Club notices"]') === null` and no `border-astra-gold/25` section).

- [ ] **Step 11.3: Reduced-motion check** — emulate `prefers-reduced-motion: reduce`: ring shows without pulse; overlay still opens.

- [ ] **Step 11.4: Push the branch** — `git push personal round5-dream`. Then poll `https://api.github.com/repos/Maz2580/AstraUnited/commits/<sha>/status` until "Vercel: success" (the cloud build is the real build check — S: cannot run `next build`). If the build fails, read the Vercel error from the status target URL, fix, push again.

- [ ] **Step 11.5:** Confirm the Vercel **preview** deployment has the Blob env connected (Task 0's "Connect to project" covers all envs — if the preview can't read content, check the store is connected to Preview env in dashboard settings).

- [ ] **Step 11.6:** Hand Mazdak the preview URL with a 3-line test script: open `/user/admin/login` on his phone → post an urgent notice → see it pulse on the homepage; post an event post → see the Spotlight; end both → site looks exactly like production. **Production merge only on his explicit go-ahead.**

- [ ] **Step 11.7:** Update `resume.md` (Round 5a state: built, on preview, awaiting Mazdak verdict; Round 5b brainstorm next) and memory (`astra-redesign-status.md` Round 5 section).

---

## Self-review notes (done at plan time)

- **Spec coverage:** content model w/ expiry (T2), registry (T3), Blob architecture + fail-soft (T4), ring + urgent auto-open + reduced motion (T5), Spotlight + carousel + no-ghost-box (T6, T11.2), photo swaps incl. inner heroes + restore (T7, T10), hidden admin + noindex + no-auth + validation + EXIF strip (T8–T10), error handling (fail-soft reads T4, image-first-JSON-last T8, inline form errors T8.3), testing + ship gates (every task + T11), cost guard (webp q75 + 1920 cap T8.1). Spec's "PIN later" and gallery pool: explicitly out of scope — no tasks, correct.
- **Known judgment calls:** Spotlight placed between News and Sponsors (spec's stated default was "after teams" — News/Sponsors boundary reads better since the band borrows news energy; flagged for Mazdak on first preview, one-line move if he disagrees). `deleteNotice` added beyond spec (admins make typos; trivial).
- **Type consistency check:** `Notice`/`EventPost`/`PhotoOverrides` flow from `types.ts` through store → components → actions with the same names; `resolvePhoto(key, overrides)` signature consistent in T3/T7/T10; `SpotlightCard({ event })` consistent in T6/T9.
