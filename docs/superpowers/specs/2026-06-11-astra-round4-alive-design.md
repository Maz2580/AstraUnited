# Astra United — Round 4 "Alive": Hero Motion, Dynamism Pass, Hover System, Logo

**Date:** 2026-06-11
**Status:** Approved by Mazdak (brainstorming session 2026-06-11)
**Branch:** `round4-dynamic-motion` (backup of production at `backup/pre-round4`, commit `0501901`)

## Problem

Three pieces of review feedback on the live site (https://astra-united.vercel.app):

1. **The site still looks flat.** After the dark redesign it has the right look but not enough *motion* — it needs to feel dynamic and interactive in a way that suits a football club.
2. **Hover states fail the designer's review.** There is no separation between clickable and non-clickable elements, and the hovers that exist (flat colour swaps) are not professional.
3. **Logo:** the header crest is too small, and "Astra" / "United" is stacked on two lines; the designer wants it bigger with "Astra United" on one line.

Additionally, Mazdak hand-picked burst photos into
`Content Copies-20260602T085649Z-3-001/preparing the motion graphic/` (folders `1` and `2`)
to power a **temporary hero motion effect** until the team delivers real motion frames.

## Decisions (from brainstorming)

| Topic | Decision |
|---|---|
| Motion placement | Homepage hero background, via the existing `HeroMedia` `frames` mode boundary |
| Motion behaviour | Auto-playing stop-motion loop (~7 fps), ping-pong (forward→backward) for a seamless loop |
| Motion tech | **Canvas frame player** (Approach A). Not video, not Three.js. The component is permanent; the team's future frames drop in by swapping the frame set. |
| AI image generation | **Real frames first.** The ChatGPT image API is only called if the real-frame result has a visible problem (loop seam, distracting background). Mazdak provides the API key when/if needed. |
| Scope of dynamism | Full homepage pass; inner pages inherit shared pieces (reveals, hover system) through the block components |
| Hover separation | Interactive elements: strong layered hover. Non-clickable elements: subtle ambient response only — no lift, no pointer cursor |
| Logo | Crest 48→64px, "Astra United" on one line ("United" in brand red), header ~80→96px |
| Safety | Work on `round4-dynamic-motion`; review on a Vercel preview URL; production untouched until approved |

## Source material facts

- Folder `1`: 39 frames — wider full-body shots (kick-ups, volleys, walking). Mostly short bursts and singletons.
- Folder `2`: 96 frames — closer juggling sequences. Strong consecutive runs:
  5881–5888 (8), 5893–5900 (8), 5913–5918 (6), 5923–5929 (7), 5936–5942 (7),
  5953–5959 (7), 5974–5981 (8), 6040–6048 (9).
- All frames are Dr Emamifar's ball-skill demos — appropriate for the hero (he is the founder), per earlier rule still **not** for youth-academy cards.
- DSLR JPGs carry EXIF rotation; the sharp pipeline must call `.rotate()` first (learned in Round 1).

## Design

### 1. Hero motion loop

**Pipeline — `scripts/build-hero-frames.mjs`:**
- Input: a curated list of frame filenames (chosen by visual review of per-burst contact sheets; bursts must share one camera position so the chain doesn't jump).
- Processing per frame: `.rotate()` → consistent crop → resize to 1600px and 960px wide → webp ~q60.
- Output: `public/images/hero-frames/frame-NNN-{1600,960}.webp`, plus `poster` (first frame, 1920px to match current hero images) and its blurDataURL.
- Budget: ~30–40 frames ≈ 2–3 MB total, loaded only after the poster paints.

**Player — implement `frames` mode in `src/components/HeroMedia.tsx`:**
- Poster `<Image>` renders immediately (identical first-paint behaviour to today).
- Frames preload via `Image()` objects in the background; when all are ready, a `<canvas>` fades in over the poster and the loop starts.
- Loop: ~7 fps stepping, ping-pong indexing, driven by `requestAnimationFrame` with timestamp accumulation (not `setInterval`).
- Pauses when `document.visibilitychange` hides the tab or an `IntersectionObserver` reports the hero off-screen.
- `prefers-reduced-motion: reduce` → static poster, frames never fetched.
- Pure logic (ping-pong index math, fps step accumulation, frame-set selection by viewport) lives in `src/lib/hero-frames.ts` with vitest coverage. The React component stays thin.
- Existing dark overlays in `HeroIntro` are unchanged — legibility is unaffected.

### 2. Homepage dynamism pass

- New `src/components/Reveal.tsx`: thin framer-motion `whileInView` wrapper (fires once, y+opacity, optional stagger index). Applied to:
  - `SectionHeader` (slide-fade up),
  - card grids in `CardsBlock`, `StepsBlock`, `PillarsBlock` (staggered) — inner pages inherit automatically,
  - homepage-specific sections in `app/page.tsx`.
- Hero stat rail: staggered entrance with a gold accent sweep. No count-up — the stats ("U6–Snr", "2×", "DISC") are not countable values and we do not fabricate numbers.
- Existing motion (marquee, touchline ball, hero crossfade→frames) is retained.

### 3. Hover system

New shared `src/components/CtaLink.tsx` (wraps `next/link`; variants `primary` | `ghost`; optional icon) replaces the copy-pasted button class strings in `SiteHeader`, `HeroIntro`, `app/[slug]/page.tsx`, `app/shop/page.tsx`, `SiteFooter`, and `ContactForm`'s submit (as a styled `<button>` sharing the same classes).

| Element | Hover behaviour |
|---|---|
| Primary (red fill) | Diagonal light sweep across the fill, slight lift (−2px), shadow grows, arrow nudges right; active = press down |
| Ghost (outline) | Border brightens, interior fills `white/10`, arrow nudge |
| Nav links | Gold underline slides in left→right (replaces the bg-block hover) |
| Non-clickable cards/tiles | Ambient only: border whisper-brightens (toward white/gold at low alpha); **no** transform, **no** pointer cursor |

Transitions 180–260 ms ease. Implemented with CSS utilities in `globals.css` (`.btn-sweep`, `.nav-underline`, `.card-ambient`) + Tailwind classes in the components. `:focus-visible` (gold outline) is preserved.

### 4. Logo & header

In `src/components/SiteHeader.tsx`:
- Crest `h-12 w-12` → `h-16 w-16` (64px), `width/height={64}`.
- Wordmark on one line: `Astra <span class="text-astra-red">United</span>`, `crest-type`, ~`text-xl`.
- Header `min-h-20` → `min-h-24`; verify hero top padding (`pt-28`) still clears it and adjust if needed.

### 5. Error handling & fallbacks

- Any frame fails to preload → stay on the poster (the hero is never blank or broken).
- Canvas unsupported / JS off → poster (server-rendered `<Image>`).
- Reduced motion → poster; reveals render content visible-by-default (framer-motion initial state must not hide content from non-JS/SEO — use `whileInView` with SSR-visible markup).

### 6. Testing & verification

- vitest: `src/lib/hero-frames.test.ts` (ping-pong indexing, step accumulation, frame-set selection), existing suites stay green.
- `npm test` runs on S:; **`next build` cannot** — production build verified via the Vercel cloud preview for branch `round4-dynamic-motion`.
- Visual QA on the preview URL: motion loop, hover separation, logo, reveals, mobile widths, reduced-motion emulation.

## Hard constraint — do not touch (designer-approved)

The designer signed off on the current **text formats, colours, and contrast**. Round 4 must not change them:

- No changes to the palette (`--astra-*` variables), text colours, or opacity levels used for copy.
- No changes to fonts, font sizes, weights, tracking, or the `crest-type` treatment.
- Hover/motion work may only add *behavioural* states (transform, border-alpha, sweep overlays, underline) — a hovered element's resting appearance and its text styling stay identical. The one approved exception: the nav-link hover changes from a background block to a gold underline (behavioural, resting state untouched).
- The logo size/one-line change is layout-only; the wordmark keeps its current font and colours.

## Out of scope (unchanged from Round 3 pending list)

Photo/video gallery, dedicated founder page, functional (non-mailto) forms, fixtures embeds, online store. ChatGPT-generated imagery unless a visible problem demands it.
