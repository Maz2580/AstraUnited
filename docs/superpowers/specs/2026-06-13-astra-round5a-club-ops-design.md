# Astra United — Round 5a: Club Ops (Notices, Event Posts, Hidden Admin)

**Date:** 2026-06-13
**Branch:** `round5-dream` (nothing merges to `main` until Mazdak's explicit go-ahead)
**Status:** Approved direction from brainstorm with Mazdak (visual companion session)

Round 5 has two halves. This spec covers **5a — Club Ops**: the first
*functional* features of the site. **5b — Experience Elevation** (page
transitions, micro-interactions, signature section, AI atmosphere) gets its
own spec afterwards.

## Goals

1. The club can tell visitors something urgent ("training cancelled — rain")
   within a minute, from a phone, with no developer involved.
2. The club can publish a temporary, professionally designed event post
   (e.g. Mother's Day discount) that appears and disappears on schedule.
3. The club can swap the site's section/hero photos without a deploy.
4. All of it costs the owner **$0/month** (Vercel Hobby free quotas;
   absolute worst case Pro at $20/month — under the $30 Wix benchmark).
5. The approved design is untouched: when no content is live, the site is
   pixel-identical to today. No empty containers, ever.

## Non-goals (this round)

- No authentication (deferred; design leaves a clean slot for a PIN later).
- No gallery pool, no fixtures, no store, no backend forms.
- No changes to approved text formats, colours, contrast, or layout.
- No experience-elevation work (that is 5b).

## Content model

Three content types, stored as JSON in Vercel Blob:

### Notice — `content/notices.json`
| Field | Type | Notes |
|---|---|---|
| `id` | string | generated |
| `title` | string | short, e.g. "Training cancelled tonight" |
| `message` | string | a few sentences max |
| `kind` | `"info" \| "urgent"` | urgent = pulse + one-time auto-open |
| `activeFrom` | ISO datetime | optional; default now |
| `activeUntil` | ISO datetime | optional; **auto-expiry** — site stops showing it after this moment, no cleanup needed |
| `createdAt` | ISO datetime | set server-side at publish |

### Event post — `content/events.json`
| Field | Type | Notes |
|---|---|---|
| `id` | string | generated |
| `image` | Blob URL | uploaded via admin, processed server-side |
| `headline` | string | e.g. "Mother's Day Special" |
| `body` | string | short designed-post copy |
| `ctaLabel` / `ctaHref` | string | optional link (e.g. Register) |
| `activeFrom` / `activeUntil` | ISO datetime | same auto-expiry semantics |
| `createdAt` | ISO datetime | server-side |

### Photo slot — `content/photo-slots.json`
A map of `slotKey -> { url, updatedAt }`. Slot keys are defined **in code**
in a registry (`src/lib/content/photo-slots.ts`): each entry has the slot
key, a human label for the admin UI, and the built-in default image. The
JSON only stores *overrides*; "Restore default" deletes the override.

Slots covered: homepage section card photos (academy, camps, juniors,
sponsors, etc.) and inner-page hero images. **Not** covered: hero
stop-motion frames and the women's motion frames (special pipelines),
the crest, and the favicon.

### Expiry rule (shared)
An item is *live* iff `activeFrom ≤ now` and (`activeUntil` unset or
`now < activeUntil`). Pure function `isLive(item, now)` in
`src/lib/content/expiry.ts`, vitest-covered. Read-time filtering only —
no cron, no cleanup jobs.

## Visitor experience

### Notices → the story ring (Mazdak's pick: option B)
- A gold-ringed circle (Instagram-story style) floats bottom-left on all
  pages while ≥1 notice is live; label chip shows the newest title.
- Tap → a full-screen dark overlay presents the notice(s) in brand style;
  swipe/arrow between multiple. Dismiss returns to the page.
- `kind: "urgent"`: the ring pulses subtly AND auto-opens once per device
  per day (localStorage memory) so a parent glancing at a phone cannot
  miss a cancellation. Info notices never auto-open.
- Zero live notices → the component renders nothing at all.
- Reduced-motion: no pulse animation; ring still shows.

### Event posts → the Spotlight section (Mazdak's pick: option A)
- A "Club Spotlight" band appears on the homepage between existing
  sections (position: after the teams section, before sponsors — exact
  insertion point confirmed during build preview) only while ≥1 event
  post is live.
- The post renders as a designed card: image left, headline/body/CTA
  right, gold kicker — matching the approved band system and frozen type
  styles. Multiple live posts → carousel with dots, swipe on touch.
- Zero live posts → the section does not exist in the DOM (no ghost box —
  the t1.PNG lesson).

### Photo swaps
- Components that render registry slots resolve override-else-default at
  render. Visitors just see the photo; swaps propagate within ~1 minute.

## Hidden admin

- **Route:** `/user/admin/login` — Mazdak's requested style: looks like a
  mundane login path, linked from nowhere, `robots` meta `noindex,nofollow`
  (deliberately NOT listed in robots.txt, which would advertise it).
- **No auth this round** (explicit decision; nobody but Mazdak knows the
  URL). Honest risk, accepted: anyone who finds the URL can edit content.
  Mitigations now: noindex, no internal links, server-side validation,
  size limits. Upgrade path: a `ADMIN_PIN` env check in one middleware —
  one small step when the club starts using it for real.
- **Three tabs** (dark brand, CtaLink buttons, frozen type styles):
  1. **Notices** — live + scheduled + expired list; create form (title,
     message, info/urgent, active window); "End now" sets `activeUntil`
     to the current time.
  2. **Events** — create form with image upload and **live preview** of
     the Spotlight card exactly as the homepage will render it; same
     end-early control.
  3. **Photos** — every registry slot with its current image, "Upload
     replacement" and "Restore default".
- **Image handling (server-side, on upload):** sharp converts to webp,
  resizes to max 1920px wide, strips EXIF (no GPS leaks from phone
  photos), rejects non-images and files > 10 MB pre-processing. Stored
  in Blob as `photos/<slot>-<timestamp>.webp` / `events/<id>.webp`.

## Architecture

- **Storage:** Vercel Blob (public read URLs — all of this content is
  public anyway; the write token stays server-side).
  Setup step: enable Blob store in the Vercel dashboard for the project
  and add `BLOB_READ_WRITE_TOKEN` to env (+ `.env.local` for dev).
- **Reads:** server components fetch the three JSON files with
  `next: { revalidate: 60 }` — content propagates within a minute, site
  stays statically fast. Blob fetch failure → treat as "no live content"
  and log; the site never breaks because the CMS is down.
- **Writes:** Next.js server actions under the admin route using
  `@vercel/blob` `put()`. Read-modify-write of the JSON files (single
  admin user — no concurrency machinery needed this round).
- **Images:** `next.config` gains a `remotePatterns` entry for
  `*.public.blob.vercel-storage.com`; all visitor-facing images still go
  through `next/image`.
- **New code layout:**
  - `src/lib/content/` — types, `expiry.ts`, `photo-slots.ts` registry,
    Blob read/write helpers (pure logic vitest-covered)
  - `src/components/content/` — `NoticeRing.tsx`, `SpotlightSection.tsx`,
    `SlotImage.tsx`
  - `app/user/admin/login/` — admin pages + server actions
- **Local dev:** Mazdak's dev server only (never run a second one on S:).
  `next build` fails on S: — verify via Vercel cloud build status
  (GitHub commit-status API), preview deploys from branch pushes.

## Error handling

- Content fetch fails → render as if no content live; `console.error`
  server-side. Never a broken band or empty box.
- Upload/processing fails → admin sees an inline error with the reason;
  nothing partial is written (process first, then `put()` image, then
  update JSON last).
- Malformed JSON in Blob (manual tampering) → zod-parse with safe
  fallback to empty content + server log.

## Testing & ship gates

- vitest: `isLive` matrix (timezone-safe, boundary times), slot
  resolution (override/default/restore), JSON schema parsing, upload
  validation rules. Target: every pure function covered.
- Playwright on the dev server: ring appears/auto-opens for urgent,
  Spotlight renders only when live, admin flows (create notice → ring on
  homepage; upload photo → slot updates; expiry hides content), zero
  console errors on all 8 pages, 1440px and 390px.
- Branch pushes → Vercel preview; Mazdak reviews on the preview URL.
- **Nothing merges to `main` until Mazdak says it ships.**

## Cost guard

Quota math: ~50 photos × ~300 KB webp ≈ 15 MB of the 1 GB free Blob
storage; JSON is kilobytes. Reads are cached by the 60s revalidate, far
inside free transfer. Hobby has **no overage billing** — Vercel pauses
rather than charges, so a surprise invoice is impossible. Ceiling if
Vercel ever enforces non-commercial limits: Pro $20/month < $30 benchmark.
