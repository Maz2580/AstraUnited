# Astra United — Round 4.5 "Polish & Real Ball" — Design

Date: 2026-06-12
Status: Approved by Mazdak (brainstorm session, visual companion used for ball selection)
Branch: continues on `round4-dynamic-motion` (NOT yet shipped to production)

## Context

Round 4 "Alive" is built and reviewed on `round4-dynamic-motion` (hero stop-motion
loop, hover system, reveals, 64px one-line logo). Before shipping, Mazdak wants
four additions:

1. The Touchline scroll ball "looks like a wheel" (external feedback) — make it
   read as a real football.
2. Some inner-page hero images are still over-zoomed — inspect all of them
   carefully and fix the bad ones.
3. The Women's First Team card image (homepage) is disliked — replace it with a
   stop-motion loop of a female player, hero-style, from newly gathered bursts.
4. A full consistency review of everything on the branch before it ships.

The homepage hero (stop-motion loop) is explicitly **untouched**.

## Hard constraint (carried over from Round 4)

Designer-approved text formats, colours, sizes, weights, tracking, and contrast
are **FROZEN**. The consistency review only catches deviations *from* the
approved system; it never restyles approved text.

## 1. Touchline ball → realistic vector football

Mazdak compared three rolling prototypes in the visual companion and chose
**Option B: classic vector football with sphere shading** (Option A, a circular
clip of the real club ball photo, was rejected for the dark "hollow" ring the
photo edge treatment created; Option C, a minimal de-wheeling of the current
line mark, was the fallback).

### Visual design

- White sphere: circle filled with a radial gradient (`#ffffff` centre →
  `#f0f4f6` → `#cfd8de` → `#aab6c0` at the rim) so it reads round even unlit.
- Black centre pentagon (12-pentagon truncated-icosahedron look): one regular
  pentagon at centre, five radially-squashed pentagons at the rim (radial scale
  ~0.5, tangential ~0.85) to suggest curvature, near-black fill `#10181d`.
- Curved seams (quadratic strokes, `#3a4750`) from centre-pentagon vertices to
  the rim pentagons; thin `#8d9aa6` rim stroke.
- Geometry is generated (pentagon/seam path math), not hand-traced — same
  numbers as the approved prototype.

### Layering: the anti-wheel trick

Two stacked layers inside the ball element:

- **Spinner layer** — the SVG texture. Rotates with scroll velocity exactly as
  the current ball does (Touchline's existing velocity-roll wiring).
- **Fixed lighting overlay** — a non-rotating sibling: radial highlight at
  ~32%/26% (white, fading by 40%) + soft shade at ~72%/80% (dark, fading by
  55%). Because the light stays still while the texture rolls, the flat circle
  reads as a 3D sphere. No inset box-shadow ring (that caused Option A's
  "hollow").

### Component contract

- `SoccerBall.tsx` keeps its name and `className`/`label` props. The `stroke`/
  `strokeWidth` props are removed — the realistic ball is full-colour and no
  longer recolours via stroke. Call sites that passed them are updated.
- The component renders ONLY the textured ball svg (the spinner content).
  The fixed lighting overlay is positioned by the consumer (`Touchline.tsx`)
  as a non-rotating sibling, because only the consumer knows which wrapper
  rotates. A small exported `BallShade` element (or equivalent markup) keeps
  the overlay consistent wherever the ball is used.
- **Hero-handoff state**: the current ball turns gold at the hero handoff.
  A realistic ball cannot swap stroke colour, so the handoff signal becomes a
  **gold glow/ring around the ball** (e.g. outer `box-shadow`/ring element
  toggled by the same state) — same moment, same meaning, new form.
- Ball size on the rail stays 48px.

## 2. Inner-page hero audit + fix

**Method:** screenshot every inner page on the running preview at desktop
(1440-ish) and mobile (390-ish) widths: The Club, Teams, Join Us, News & Media,
Sponsors, Contact, Shop. Judge each hero's framing in context
(the PageHero band is ~60svh; subject must not be over-cropped or "too
zoomed"). Record a verdict per page before changing anything.

**Fix order of preference per bad hero:**

1. Swap to an existing landscape (~1.5 ratio) photo from `public/images` that
   suits the page's subject (rule learned in Round 4: portrait sources
   over-crop in wide hero bands).
2. If no suitable landscape exists, build a properly-framed 1920-wide landscape
   crop from the original DSLR sources with sharp (rotate-then-measure before
   extract, as established).

Every swapped/regenerated hero gets a fresh 16px blurDataURL and honest alt
text. Homepage hero: out of scope.

## 3. Women's First Team card → stop-motion loop

Replace the static `astra-womens-portrait-ball` photo in the homepage "Senior
pathway" section's Women's First Team card (`app/page.tsx`, section 5) with a
ping-pong stop-motion loop of a female player playing with the ball — the same
technique as the hero, making the section distinctive rather than another
static photo. The caption block under the card stays as-is.

### Source material

`Content Copies-…/preparing the motion graphic/women/`, hand-gathered by Mazdak:

- **Character 1** — option 1: 12 frames (0J6A6502–6513); option 2: 21 frames
  (0J6A6423–6443).
- **Character 2** — option 1: 17 frames (0J6A6352–6368); option 2: 40 frames
  (0J6A6380–6419).

Which character + burst to use is chosen WITH Mazdak via a visual contact-sheet
review at implementation start (same as the hero frame selection in Round 4).
Burst continuity (numeric run, same camera position) decides how many frames
survive curation; ping-pong looping means even a short run loops seamlessly.

### Reuse and generalisation

- `frameSrc()` in `src/lib/hero-frames.ts` currently hardcodes
  `/images/hero-frames/` — it gains a frame-set/base-path parameter so multiple
  loops can coexist (`/images/women-frames/` for this one). Existing tests
  extend to cover the parameter.
- `HeroFramesCanvas` accepts the frame set; everything else (rAF stepper, delta
  clamp, ping-pong index, pause off-screen/hidden, poster fallback,
  reduced-motion opt-out) is reused unchanged.
- The build pipeline (`scripts/build-hero-frames.mjs` + config) is extended to
  build multiple sets (hero + women) rather than forked. Frame dimensions are
  tailored to the card (~648×460 rendered on desktop at 45vw, portrait-ish on
  mobile at 100vw) — exact stage/crop decided in implementation after checking
  the source orientation (rotate-then-measure, as established). Payload target:
  meaningfully smaller than the hero's set, since the card renders smaller.

### Loading behaviour (differs from hero)

The card sits below the fold, so frames must NOT preload on page load (the hero
preloads immediately because it's the first paint). Frame preloading is gated
on the card approaching the viewport (IntersectionObserver), with a chosen
still frame as poster until ready. Reduced-motion users keep the poster.

## 4. Full consistency review

Systematic pass over all pages on the preview. Checklist:

- Every button/CTA uses the shared `CtaLink` / `.btn` system (no stray
  one-off button styles).
- Hover separation is consistent: clickable = strong layered hover
  (`.btn*`, `.card-link`, `.nav-underline`); non-clickable = ambient only
  (`.card-ambient`), no lifts or pointer cursors on non-links.
- Reveals behave consistently across pages (SectionHeader/PageHero/blocks).
- Band alternation (`band-fog`/`band-deep`) is even; no double-bands.
- All content images use the sharp 1920 sources where rendered large.
- No console errors on any page.
- Mobile layout clean on every page.
- Frozen design respected: no rogue font sizes/colours that deviate from the
  approved system.

Findings are fixed in place (small diffs, committed per logical group), except
anything that would touch frozen text styling — those get reported instead.

## Out of scope

- Homepage hero (stop-motion loop) — explicitly untouched.
- Shipping to production — remains gated on Mazdak's explicit go-ahead
  (existing plan Task 12).
- Founder page, gallery, video loops, backend forms (future rounds).

## Testing

- Existing vitest suite (21 tests) stays green at every commit; typecheck clean.
- `next build` cannot run on the S: drive — production build verified via the
  Vercel cloud preview deploy for the branch.
- Visual verification on Mazdak's dev server via Playwright (never run a second
  dev server — `.next` corrupts on the network drive).
