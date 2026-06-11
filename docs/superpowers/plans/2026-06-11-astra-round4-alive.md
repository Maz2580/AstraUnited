# Astra Round 4 "Alive" Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the live Astra United site feel dynamic — a stop-motion hero loop built from real burst photos, a professional hover system that separates clickable from non-clickable elements, scroll reveals on the inner pages, and a bigger one-line logo.

**Architecture:** A sharp pipeline turns curated burst frames into webp frame sets; a thin canvas player (pure logic in `src/lib/hero-frames.ts`, tested) implements the existing `HeroMedia` `frames` mode. Hover behaviour is a CSS utility layer (`.btn*`, `.nav-underline`, `.card-ambient`, `.card-link`) plus one shared `CtaLink` component. Reveals reuse the existing `PopCard` plus a new thin `Reveal` wrapper.

**Tech Stack:** Next.js 14 App Router, TypeScript, Tailwind, framer-motion, sharp, vitest.

**Spec:** `docs/superpowers/specs/2026-06-11-astra-round4-alive-design.md`

**HARD CONSTRAINT (designer-approved, frozen):** no changes to palette, text colours/opacities, fonts, sizes, weights, tracking, or `crest-type`. Hover/motion adds *behavioural* states only. Resting appearance of every element stays identical (one exception: nav hover becomes gold underline instead of bg block).

**Branch:** `round4-dynamic-motion` (already created; backup at `backup/pre-round4`). Commit as `mazdak.gh1995@gmail.com`, NO Co-Authored-By trailer. `npm test` and `npm run typecheck` work on S:; `next build` does NOT — verify builds via the Vercel preview for this branch. If git fails with "Permission denied" creating a new directory, re-run the same command.

---

### Task 1: Housekeeping — ignore scratch files

**Files:**
- Modify: `.gitignore`

- [ ] **Step 1: Add scratch patterns**

Append to `.gitignore`:

```
resume.md
scripts/_*.jpg
```

- [ ] **Step 2: Verify untracked noise is gone**

Run: `git status --short`
Expected: `.claude/` may remain; `resume.md` and `scripts/_contact-*.jpg` no longer listed.

- [ ] **Step 3: Commit**

```bash
git add .gitignore
git commit -m "chore: ignore resume notes and scratch contact sheets"
```

---

### Task 2: Hero-frames pure logic (TDD)

**Files:**
- Create: `src/lib/hero-frames.ts`
- Test: `src/lib/hero-frames.test.ts`

- [ ] **Step 1: Write the failing tests**

`src/lib/hero-frames.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  advanceStepper,
  frameSetForWidth,
  frameSrc,
  pingPongIndex
} from "./hero-frames";

describe("pingPongIndex", () => {
  it("walks forward then backward without repeating endpoints", () => {
    const seq = Array.from({ length: 8 }, (_, s) => pingPongIndex(s, 4));
    expect(seq).toEqual([0, 1, 2, 3, 2, 1, 0, 1]);
  });

  it("returns 0 for single-frame sets", () => {
    expect(pingPongIndex(5, 1)).toBe(0);
  });
});

describe("advanceStepper", () => {
  it("steps once per frame duration and carries the remainder", () => {
    const next = advanceStepper({ step: 0, carryMs: 0 }, 250, 100);
    expect(next).toEqual({ step: 2, carryMs: 50 });
  });

  it("accumulates sub-frame deltas across calls", () => {
    let s = { step: 0, carryMs: 0 };
    s = advanceStepper(s, 60, 100);
    expect(s.step).toBe(0);
    s = advanceStepper(s, 60, 100);
    expect(s.step).toBe(1);
  });

  it("clamps huge deltas so a paused tab cannot cause a catch-up burst", () => {
    const next = advanceStepper({ step: 0, carryMs: 0 }, 10000, 100);
    expect(next.step).toBeLessThanOrEqual(4);
  });
});

describe("frame sources", () => {
  it("picks 960 for phones and 1600 for desktop", () => {
    expect(frameSetForWidth(390)).toBe(960);
    expect(frameSetForWidth(1440)).toBe(1600);
  });

  it("builds 1-based zero-padded paths", () => {
    expect(frameSrc(0, 1600)).toBe("/images/hero-frames/frame-001-1600.webp");
    expect(frameSrc(11, 960)).toBe("/images/hero-frames/frame-012-960.webp");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- src/lib/hero-frames.test.ts`
Expected: FAIL — cannot resolve `./hero-frames`.

- [ ] **Step 3: Implement**

`src/lib/hero-frames.ts`:

```ts
// Pure logic for the hero stop-motion canvas player. Kept free of DOM so it
// can be unit-tested like src/lib/touchline.

export type StepperState = { step: number; carryMs: number };

/**
 * Advance a fixed-fps stepper by an arbitrary rAF delta, carrying the
 * sub-frame remainder. Deltas are clamped to 4 frames so a backgrounded tab
 * resumes smoothly instead of fast-forwarding.
 */
export function advanceStepper(
  state: StepperState,
  deltaMs: number,
  frameDurationMs: number
): StepperState {
  if (frameDurationMs <= 0) return state;
  const clamped = Math.max(0, Math.min(deltaMs, 4 * frameDurationMs));
  const total = state.carryMs + clamped;
  const steps = Math.floor(total / frameDurationMs);
  return { step: state.step + steps, carryMs: total - steps * frameDurationMs };
}

/** Map a monotonically increasing step onto a forward-then-backward index. */
export function pingPongIndex(step: number, frameCount: number): number {
  if (frameCount <= 1) return 0;
  const cycle = 2 * frameCount - 2;
  const m = ((step % cycle) + cycle) % cycle;
  return m < frameCount ? m : cycle - m;
}

export type FrameWidth = 960 | 1600;

export function frameSetForWidth(viewportWidth: number): FrameWidth {
  return viewportWidth <= 768 ? 960 : 1600;
}

export function frameSrc(index: number, width: FrameWidth): string {
  return `/images/hero-frames/frame-${String(index + 1).padStart(3, "0")}-${width}.webp`;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- src/lib/hero-frames.test.ts`
Expected: 7 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/hero-frames.ts src/lib/hero-frames.test.ts
git commit -m "feat: hero frame stepper + ping-pong loop math (tested)"
```

---

### Task 3: Pick the hero frames (visual review)

**Files:**
- Create: `scripts/hero-frames.config.json`
- Scratch (gitignored): `scripts/_burst-*.jpg`

The candidate bursts in `Content Copies-20260602T085649Z-3-001/preparing the motion graphic/2` (consecutive runs): 5881–5888, 5893–5900, 5913–5918, 5923–5929, 5936–5942, 5953–5959, 5974–5981, 6040–6048.

- [ ] **Step 1: Build one contact sheet per candidate burst**

Run from repo root (PowerShell-safe via Bash tool):

```bash
node -e "
const sharp = require('sharp');
const path = require('path');
const dir = 'Content Copies-20260602T085649Z-3-001/preparing the motion graphic/2';
const bursts = [[5881,5888],[5893,5900],[5913,5918],[5923,5929],[5936,5942],[5953,5959],[5974,5981],[6040,6048]];
(async () => {
  for (const [a,b] of bursts) {
    const thumbs = [];
    for (let n=a; n<=b; n++) {
      const buf = await sharp(path.join(dir, '0J6A'+n+'.JPG')).rotate().resize(260,174,{fit:'cover'}).toBuffer();
      thumbs.push(buf);
    }
    const cols = Math.min(5, thumbs.length), rows = Math.ceil(thumbs.length/cols);
    await sharp({create:{width:cols*260,height:rows*174,channels:3,background:'#111'}})
      .composite(thumbs.map((t,i)=>({input:t,left:(i%cols)*260,top:Math.floor(i/cols)*174})))
      .jpeg({quality:70}).toFile('scripts/_burst-'+a+'.jpg');
    console.log('burst', a+'-'+b, 'ok');
  }
})();
"
```

Expected: 8 files `scripts/_burst-*.jpg`.

- [ ] **Step 2: Review each sheet with the Read tool**

Read each `scripts/_burst-*.jpg`. Choose 3–5 bursts that share ONE camera position and framing (the chain must not jump). Prefer continuous juggling moves; total target 25–40 frames. Note where the subject sits in frame to choose a crop window (the hero is wide; source is 3:2) that keeps him and the ball inside every chosen frame.

- [ ] **Step 3: Write the config**

`scripts/hero-frames.config.json` — fill `frames` with the chosen filenames IN PLAY ORDER and crop percentages from the review (the values below for `crop` are a starting point — tune to keep the subject centered in every chosen frame):

```json
{
  "sourceDir": "Content Copies-20260602T085649Z-3-001/preparing the motion graphic/2",
  "outDir": "public/images/hero-frames",
  "crop": { "leftPct": 0.1, "topPct": 0.05, "widthPct": 0.8, "heightPct": 0.9 },
  "frames": ["0J6A5881.JPG", "FILL_FROM_REVIEW.JPG"]
}
```

- [ ] **Step 4: Commit**

```bash
git add scripts/hero-frames.config.json
git commit -m "feat: curated hero frame selection config"
```

---

### Task 4: Frame pipeline script + generate assets

**Files:**
- Create: `scripts/build-hero-frames.mjs`
- Generated: `public/images/hero-frames/frame-NNN-{1600,960}.webp`, `poster-1920.webp`

- [ ] **Step 1: Write the pipeline**

`scripts/build-hero-frames.mjs`:

```js
// Build the hero stop-motion frame set from curated burst photos.
// Usage: node scripts/build-hero-frames.mjs
// Reads scripts/hero-frames.config.json; outputs webp frames + poster and
// prints { frameCount, blurDataURL } to paste into HeroIntro.

import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const config = JSON.parse(
  fs.readFileSync("scripts/hero-frames.config.json", "utf8")
);
const { sourceDir, outDir, crop, frames } = config;
const WIDTHS = [1600, 960];

fs.mkdirSync(outDir, { recursive: true });

async function cropRegion(file) {
  // .rotate() first so EXIF orientation is applied before measuring (DSLR gotcha).
  const meta = await sharp(path.join(sourceDir, file)).rotate().metadata();
  if (!crop) return null;
  return {
    left: Math.round(meta.width * crop.leftPct),
    top: Math.round(meta.height * crop.topPct),
    width: Math.round(meta.width * crop.widthPct),
    height: Math.round(meta.height * crop.heightPct)
  };
}

async function processFrame(file, index) {
  const region = await cropRegion(file);
  for (const w of WIDTHS) {
    let img = sharp(path.join(sourceDir, file)).rotate();
    if (region) img = img.extract(region);
    const name = `frame-${String(index + 1).padStart(3, "0")}-${w}.webp`;
    await img.resize({ width: w }).webp({ quality: 60 }).toFile(path.join(outDir, name));
  }
}

async function buildPoster(file) {
  const region = await cropRegion(file);
  let img = sharp(path.join(sourceDir, file)).rotate();
  if (region) img = img.extract(region);
  const posterPath = path.join(outDir, "poster-1920.webp");
  await img.resize({ width: 1920 }).webp({ quality: 68 }).toFile(posterPath);
  const blur = await sharp(posterPath).resize(16).webp({ quality: 30 }).toBuffer();
  return `data:image/webp;base64,${blur.toString("base64")}`;
}

const start = Date.now();
for (let i = 0; i < frames.length; i++) {
  await processFrame(frames[i], i);
}
const blurDataURL = await buildPoster(frames[0]);

const totalBytes = fs
  .readdirSync(outDir)
  .reduce((sum, f) => sum + fs.statSync(path.join(outDir, f)).size, 0);

console.log(JSON.stringify({ frameCount: frames.length, blurDataURL }, null, 2));
console.log(
  `${frames.length} frames -> ${outDir} | total ${(totalBytes / 1024 / 1024).toFixed(2)} MB | ${Date.now() - start}ms`
);
```

- [ ] **Step 2: Run it**

Run: `node scripts/build-hero-frames.mjs`
Expected: prints frameCount + blurDataURL; total size ≤ ~3.5 MB. If larger, drop quality to 55 or trim frames. RECORD the printed `frameCount` and `blurDataURL` — Task 6 pastes them.

- [ ] **Step 3: Sanity-check one frame visually**

Read `public/images/hero-frames/frame-001-1600.webp` — subject and ball fully inside frame, correct orientation. Spot-check the LAST frame too.

- [ ] **Step 4: Commit**

```bash
git add scripts/build-hero-frames.mjs public/images/hero-frames
git commit -m "feat: hero frame pipeline + generated stop-motion frame set"
```

---

### Task 5: Canvas player component

**Files:**
- Create: `src/components/HeroFramesCanvas.tsx`

- [ ] **Step 1: Write the component**

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import {
  advanceStepper,
  frameSetForWidth,
  frameSrc,
  pingPongIndex,
  type StepperState
} from "@/src/lib/hero-frames";

type Props = { frameCount: number; fps?: number };

/**
 * Stop-motion canvas player for the hero. Invisible until every frame is
 * loaded, then fades in over the poster and ping-pong loops. On any frame
 * load error, reduced motion, or missing canvas support the poster simply
 * stays — the hero is never blank.
 */
export function HeroFramesCanvas({ frameCount, fps = 7 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let cancelled = false;
    let started = false;
    let inView = true;
    let raf = 0;
    let last: number | null = null;
    let stepper: StepperState = { step: 0, carryMs: 0 };
    const frameDurationMs = 1000 / fps;
    const size = frameSetForWidth(window.innerWidth);
    const images: HTMLImageElement[] = [];
    let loadedCount = 0;

    const drawFrame = (index: number) => {
      const img = images[index];
      if (!img) return;
      const cw = canvas.width;
      const ch = canvas.height;
      const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
      const dw = img.naturalWidth * scale;
      const dh = img.naturalHeight * scale;
      ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(canvas.clientWidth * dpr);
      canvas.height = Math.round(canvas.clientHeight * dpr);
      if (started) drawFrame(pingPongIndex(stepper.step, frameCount));
    };

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (document.hidden || !inView) {
        last = null; // resume without a catch-up jump
        return;
      }
      if (last === null) {
        last = now;
        return;
      }
      const next = advanceStepper(stepper, now - last, frameDurationMs);
      last = now;
      if (next.step !== stepper.step) {
        drawFrame(pingPongIndex(next.step, frameCount));
      }
      stepper = next;
    };

    const start = () => {
      if (cancelled || started) return;
      started = true;
      resize();
      drawFrame(0);
      setReady(true);
      raf = requestAnimationFrame(tick);
    };

    for (let i = 0; i < frameCount; i++) {
      const img = new Image();
      img.decoding = "async";
      img.src = frameSrc(i, size);
      img.onload = () => {
        loadedCount += 1;
        if (loadedCount === frameCount) start();
      };
      img.onerror = () => {
        cancelled = true; // poster stays; never show a broken loop
      };
      images.push(img);
    }

    const observer = new IntersectionObserver((entries) => {
      inView = entries[0]?.isIntersecting ?? true;
    });
    observer.observe(canvas);
    window.addEventListener("resize", resize);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener("resize", resize);
    };
  }, [frameCount, fps]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`absolute inset-0 h-full w-full transition-opacity duration-700 ${ready ? "opacity-100" : "opacity-0"}`}
    />
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add src/components/HeroFramesCanvas.tsx
git commit -m "feat: stop-motion canvas player with pause/fallback behaviour"
```

---

### Task 6: Wire frames mode into HeroMedia + switch the hero

**Files:**
- Modify: `src/components/HeroMedia.tsx` (frames variant + branch)
- Modify: `src/components/HeroIntro.tsx:10-37` (heroMedia const)

- [ ] **Step 1: Update the frames variant of HeroSource**

In `src/components/HeroMedia.tsx`, replace the old frames variant
`| { kind: "frames"; framePattern: string; frameCount: number; poster: string }` with:

```ts
| {
    kind: "frames";
    frameCount: number;
    poster: string;
    blurDataURL?: string;
    fps?: number;
  }
```

Add the import at the top:

```ts
import { HeroFramesCanvas } from "@/src/components/HeroFramesCanvas";
```

Replace the whole `if (source.kind === "frames") { ... }` block (the poster-only Round 1 stub) with:

```tsx
if (source.kind === "frames") {
  return (
    <div className="absolute inset-0 -z-20" aria-hidden="true">
      <Image
        src={source.poster}
        alt=""
        fill
        priority
        placeholder={source.blurDataURL ? "blur" : "empty"}
        blurDataURL={source.blurDataURL}
        sizes="100vw"
        className="object-cover"
      />
      <HeroFramesCanvas frameCount={source.frameCount} fps={source.fps} />
    </div>
  );
}
```

Also update the component doc comment if it references `framePattern`.

- [ ] **Step 2: Switch HeroIntro to the frames source**

In `src/components/HeroIntro.tsx`, replace the entire `const heroMedia: HeroSource = { kind: "crossfade", ... }` block (lines ~10–37) with — pasting the REAL values printed by Task 4 Step 2:

```ts
// Temporary stop-motion loop from curated burst photos (Dr Emamifar ball
// skills) until the team delivers production motion frames.
const heroMedia: HeroSource = {
  kind: "frames",
  frameCount: 0, // PASTE frameCount from `node scripts/build-hero-frames.mjs`
  poster: "/images/hero-frames/poster-1920.webp",
  blurDataURL: "PASTE_BLUR_FROM_PIPELINE_OUTPUT",
  fps: 7
};
```

Also update the comment above it (it currently says "Three strongest hero photos").

- [ ] **Step 3: Tests + typecheck**

Run: `npm test` and `npm run typecheck`
Expected: all suites pass; typecheck clean.

- [ ] **Step 4: Commit and push for an early cloud-build check**

```bash
git add src/components/HeroMedia.tsx src/components/HeroIntro.tsx
git commit -m "feat: hero runs the stop-motion frame loop"
git push -u personal round4-dynamic-motion
```

Expected: Vercel builds preview `astra-united-git-round4-dynamic-motion-mazdaks-projects-dffe9641.vercel.app`. Verify the build succeeds (this is our only `next build` check). Visually confirm the hero loop plays.

---

### Task 7: Hover-system CSS utilities

**Files:**
- Modify: `app/globals.css` (append after the `.card-dark` block, before the marquee section)

- [ ] **Step 1: Add the utilities**

Append to the "Dark $10k theme utilities" area of `app/globals.css`:

```css
/* --- Round 4: hover system (behavioural states only; resting styles frozen) --- */
.btn {
  position: relative;
  overflow: hidden;
  transition:
    transform 220ms ease,
    box-shadow 220ms ease,
    border-color 220ms ease,
    background-color 220ms ease;
}

.btn:hover {
  transform: translateY(-2px);
}

.btn:active {
  transform: translateY(0);
  transition-duration: 80ms;
}

.btn .btn-icon {
  transition: transform 220ms ease;
}

.btn:hover .btn-icon {
  transform: translateX(3px);
}

.btn-primary:hover {
  box-shadow: 0 16px 34px rgba(200, 25, 22, 0.34);
}

.btn-sweep::before {
  content: "";
  position: absolute;
  inset: 0;
  transform: translateX(-130%) skewX(-18deg);
  background: linear-gradient(
    105deg,
    transparent 35%,
    rgba(248, 251, 253, 0.25) 50%,
    transparent 65%
  );
  transition: transform 520ms ease;
  pointer-events: none;
}

.btn-sweep:hover::before {
  transform: translateX(130%) skewX(-18deg);
}

.btn-ghost:hover {
  border-color: rgba(248, 251, 253, 0.55);
  background-color: rgba(248, 251, 253, 0.1);
}

/* Nav links: gold underline slides in (replaces the bg-block hover) */
.nav-underline {
  position: relative;
}

.nav-underline::after {
  content: "";
  position: absolute;
  left: 0.75rem;
  right: 0.75rem;
  bottom: 0.3rem;
  height: 2px;
  background: var(--astra-gold);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 220ms ease;
}

.nav-underline:hover::after,
.nav-underline:focus-visible::after {
  transform: scaleX(1);
}

/* Non-clickable cards: ambient whisper only — no lift, no pointer */
.card-ambient {
  transition: border-color 240ms ease, background-color 240ms ease;
}

.card-ambient:hover {
  border-color: rgba(242, 201, 76, 0.26);
  background-color: rgba(248, 251, 253, 0.06);
}

/* Clickable cards: unmistakably interactive */
.card-link {
  transition: transform 220ms ease, box-shadow 220ms ease, border-color 220ms ease;
}

.card-link:hover {
  transform: translateY(-4px);
  border-color: rgba(248, 251, 253, 0.32);
  box-shadow: 0 22px 50px rgba(0, 0, 0, 0.4);
}
```

NOTE: these rules come AFTER `.card-dark` in the file, so their hover declarations win the cascade (same specificity, later order). Do not move them above `.card-dark`. The existing `prefers-reduced-motion` block at the end of the file already neutralises all of these transitions.

- [ ] **Step 2: Commit**

```bash
git add app/globals.css
git commit -m "feat: hover utility layer - buttons, nav underline, ambient vs interactive cards"
```

---

### Task 8: CtaLink component + replace button call sites

**Files:**
- Create: `src/components/CtaLink.tsx`
- Modify: `src/components/SiteHeader.tsx:35-41`, `src/components/HeroIntro.tsx:147-161`, `app/[slug]/page.tsx:37-43`, `app/page.tsx:323-329`, `app/shop/page.tsx:51-54`, `src/components/blocks/ContactForm.tsx:43-46`

- [ ] **Step 1: Create CtaLink**

`src/components/CtaLink.tsx`:

```tsx
import Link from "next/link";
import type { ReactNode } from "react";

type Props = {
  href: string;
  variant?: "primary" | "ghost";
  className?: string;
  children: ReactNode;
};

const VARIANT_CLASSES = {
  primary: "btn btn-primary btn-sweep bg-astra-red",
  ghost: "btn btn-ghost border border-white/30 backdrop-blur"
} as const;

/**
 * Shared CTA link. Adds only the hover behaviour layer; each call site keeps
 * its approved text styling (size, tracking, padding) via className.
 * Put `btn-icon` on a trailing arrow icon to get the hover nudge.
 */
export function CtaLink({ href, variant = "primary", className = "", children }: Props) {
  return (
    <Link
      href={href}
      className={`${VARIANT_CLASSES[variant]} inline-flex items-center justify-center gap-2 rounded text-white ${className}`.trim()}
    >
      {children}
    </Link>
  );
}
```

- [ ] **Step 2: SiteHeader Register button**

In `src/components/SiteHeader.tsx`, add `import { CtaLink } from "@/src/components/CtaLink";` and replace the Register `<Link ...>...</Link>` (lines 35–41) with:

```tsx
<CtaLink
  href="/join-us"
  className="px-4 py-2.5 text-sm font-black uppercase tracking-normal shadow-lg shadow-red-950/20"
>
  Register
  <ArrowRight aria-hidden="true" className="btn-icon h-4 w-4" />
</CtaLink>
```

- [ ] **Step 3: HeroIntro CTAs**

In `src/components/HeroIntro.tsx`, add `import { CtaLink } from "@/src/components/CtaLink";` and replace the two `<Link ...>` CTAs inside the CTA `motion.div` (lines ~147–161) with:

```tsx
<CtaLink
  href={heroContent.primaryCta.href}
  className="px-6 py-3.5 text-sm font-black uppercase tracking-wide"
>
  {heroContent.primaryCta.label}
  <ArrowRight aria-hidden="true" className="btn-icon h-4 w-4" />
</CtaLink>
<CtaLink
  href={heroContent.secondaryCta.href}
  variant="ghost"
  className="px-6 py-3.5 text-sm font-black uppercase tracking-wide"
>
  <Play aria-hidden="true" className="h-4 w-4" />
  {heroContent.secondaryCta.label}
</CtaLink>
```

(`Link` may become an unused import in HeroIntro — remove it if so.)

- [ ] **Step 4: Inner-page CTA (`app/[slug]/page.tsx`)**

Add `import { CtaLink } from "@/src/components/CtaLink";`, replace the Contact `<Link ...>` (lines 37–43) with:

```tsx
<CtaLink href="/contact" className="px-5 py-3 text-sm font-black uppercase tracking-normal">
  Contact Astra
  <ArrowRight aria-hidden="true" className="btn-icon h-4 w-4" />
</CtaLink>
```

Remove the now-unused `Link` import if nothing else uses it.

- [ ] **Step 5: Homepage sponsors CTA (`app/page.tsx`)**

Add `import { CtaLink } from "@/src/components/CtaLink";`, replace the "View sponsorship packages" `<Link ...>` (lines 323–329) with:

```tsx
<CtaLink href="/sponsors" className="mt-9 px-5 py-3 text-sm font-black uppercase tracking-wide">
  View sponsorship packages
  <ExternalLink aria-hidden="true" className="btn-icon h-4 w-4" />
</CtaLink>
```

- [ ] **Step 6: Shop text link gets the arrow nudge**

In `app/shop/page.tsx`, the "Contact the club" red text link (lines 51–54): add `group` to the link's className and `transition group-hover:translate-x-1` to the ArrowRight:

```tsx
<Link href="/contact" className="group mt-7 inline-flex items-center gap-2 text-sm font-black uppercase tracking-normal text-astra-red">
  Contact the club
  <ArrowRight aria-hidden="true" className="h-4 w-4 transition group-hover:translate-x-1" />
</Link>
```

- [ ] **Step 7: ContactForm submit button**

In `src/components/blocks/ContactForm.tsx`, replace the submit `<button ...>` (lines 43–46) with:

```tsx
<button
  type="submit"
  className="btn btn-primary btn-sweep inline-flex items-center justify-center gap-2 rounded bg-astra-red px-6 py-3.5 text-sm font-black uppercase tracking-wide text-white"
>
  {submitLabel}
  <Send aria-hidden="true" className="btn-icon h-4 w-4" />
</button>
```

- [ ] **Step 8: Tests + typecheck**

Run: `npm test` and `npm run typecheck`
Expected: pass/clean. (Watch for unused `Link`/`ArrowRight` imports.)

- [ ] **Step 9: Commit**

```bash
git add src/components/CtaLink.tsx src/components/SiteHeader.tsx src/components/HeroIntro.tsx "app/[slug]/page.tsx" app/page.tsx app/shop/page.tsx src/components/blocks/ContactForm.tsx
git commit -m "feat: shared CtaLink with sweep/lift hover across all buttons"
```

---

### Task 9: Logo bigger + one line, nav underline

**Files:**
- Modify: `src/components/SiteHeader.tsx`

- [ ] **Step 1: Logo + wordmark**

Replace the logo `<Link href="/" ...>` block (crest + stacked span) with:

```tsx
<Link href="/" className="flex items-center gap-3">
  <Image
    src="/images/astra-logo.png"
    alt="Astra United Football Club"
    width={64}
    height={64}
    className="h-16 w-16 object-contain"
    priority
  />
  <span className="crest-type hidden text-xl leading-none sm:block">
    Astra <span className="text-astra-red">United</span>
  </span>
</Link>
```

(The wordmark keeps `crest-type` and the red "United" — only layout changes: one line, slightly larger to balance the bigger crest.)

- [ ] **Step 2: Header height + nav hover**

In the same file: change `min-h-20` to `min-h-24` on the `<nav>`; change each nav item's className from
`"rounded px-3 py-2 text-sm font-semibold text-white/82 transition hover:bg-white/8 hover:text-white"` to:

```
"nav-underline rounded px-3 py-2 text-sm font-semibold text-white/82 transition hover:text-white"
```

- [ ] **Step 3: Check clearance below the taller header**

The hero uses `pt-28` (112px) against the new 96px header — still clears, but verify visually in the dev server or preview that the pitch-status pill is not cramped; if it is, bump the hero section's `pt-28` to `pt-32` in `HeroIntro.tsx`. `PageHero` uses `pt-32` (128px) — fine.

- [ ] **Step 4: Typecheck + commit**

Run: `npm run typecheck` — clean.

```bash
git add src/components/SiteHeader.tsx
git commit -m "feat: bigger 64px crest, one-line Astra United wordmark, nav underline hover"
```

---

### Task 10: Clickable/non-clickable separation + inner-page reveals + stat rail

**Files:**
- Create: `src/components/Reveal.tsx`
- Modify: `src/components/FlowReveal.tsx:50-63` (PopCard), `src/components/SectionHeader.tsx`, `src/components/blocks/CardsBlock.tsx`, `src/components/blocks/StepsBlock.tsx`, `src/components/blocks/PillarsBlock.tsx`, `src/components/blocks/PageHero.tsx`, `app/page.tsx:343-362` (clickable cards), `src/components/HeroIntro.tsx:164-184` (stat rail)

- [ ] **Step 1: PopCard stops lifting on hover (it wraps NON-clickable cards)**

In `src/components/FlowReveal.tsx`, in `PopCard`:
1. Delete the line `whileHover={reducedMotion ? undefined : { y: -6, scale: 1.01 }}`.
2. Change the className to add the ambient class:

```tsx
className={`tunnel-card touchline-react card-ambient ${className}`.trim()}
```

This is the designer's core complaint fixed: non-clickable cards no longer behave like buttons.

- [ ] **Step 2: Clickable homepage cards get the strong treatment**

In `app/page.tsx` section 8 ("Join / contact CTA", lines ~343–362), the two `<Link className="card-dark group block h-full p-6 text-white transition hover:-translate-y-1">` become:

```tsx
<Link href="/join-us" className="card-dark card-link group block h-full p-6 text-white">
```

and

```tsx
<Link href="/contact" className="card-dark card-link group block h-full p-6 text-white">
```

(drop `transition hover:-translate-y-1` — `.card-link` handles it; inner arrow `group-hover:translate-x-1` spans stay).

- [ ] **Step 3: Create the Reveal wrapper**

`src/components/Reveal.tsx`:

```tsx
"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

type Props = { children: ReactNode; className?: string; delay?: number };

/** Soft one-time scroll reveal for headings and prose on inner pages. */
export function Reveal({ children, className = "", delay = 0 }: Props) {
  const reducedMotion = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reducedMotion ? false : { opacity: 0, y: 28 }}
      whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
```

- [ ] **Step 4: SectionHeader reveals everywhere**

`src/components/SectionHeader.tsx` — wrap the existing content in `Reveal` (the outer div's classes move onto Reveal):

```tsx
import { Reveal } from "@/src/components/Reveal";

type SectionHeaderProps = {
  eyebrow: string;
  title: string;
  copy?: string;
  align?: "left" | "center";
  inverse?: boolean;
};

export function SectionHeader({
  eyebrow,
  title,
  copy,
  align = "left",
  inverse = false
}: SectionHeaderProps) {
  return (
    <Reveal className={align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      <p className={`mb-3 text-sm font-black uppercase tracking-normal ${inverse ? "text-astra-gold" : "text-astra-red"}`}>
        {eyebrow}
      </p>
      <h2 className={`crest-type text-4xl leading-[0.95] sm:text-5xl ${inverse ? "text-white" : "text-astra-ink"}`}>
        {title}
      </h2>
      {copy ? (
        <p className={`mt-5 text-base leading-7 sm:text-lg ${inverse ? "text-white/72" : "text-slate-700"}`}>
          {copy}
        </p>
      ) : null}
    </Reveal>
  );
}
```

- [ ] **Step 5: Inner-page blocks get staggered card entrances**

`src/components/blocks/CardsBlock.tsx` — replace the `<article>` map with PopCard:

```tsx
import { PopCard } from "@/src/components/FlowReveal";
import { SectionHeader } from "@/src/components/SectionHeader";

type Props = { title?: string; intro?: string; items: { title: string; copy: string }[] };

export function CardsBlock({ title, intro, items }: Props) {
  return (
    <div className="container-wide">
      {title ? <SectionHeader eyebrow="Astra United" title={title} copy={intro} inverse /> : null}
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, index) => (
          <PopCard key={item.title} className="card-dark p-6" delay={index * 0.05}>
            <h3 className="text-xl font-black text-white">{item.title}</h3>
            <p className="mt-3 text-sm leading-6 text-white/72">{item.copy}</p>
          </PopCard>
        ))}
      </div>
    </div>
  );
}
```

`src/components/blocks/StepsBlock.tsx` — wrap each `<li>`'s content (the `li` keeps list semantics):

```tsx
import { PopCard } from "@/src/components/FlowReveal";
import { SectionHeader } from "@/src/components/SectionHeader";

type Props = { title?: string; items: { title: string; copy: string }[] };

export function StepsBlock({ title, items }: Props) {
  return (
    <div className="container-wide">
      {title ? <SectionHeader eyebrow="Step by step" title={title} inverse /> : null}
      <ol className="mt-10 grid gap-5 md:grid-cols-3">
        {items.map((item, i) => (
          <li key={item.title}>
            <PopCard className="card-dark h-full p-6" delay={i * 0.05}>
              <span className="crest-type flex h-10 w-10 items-center justify-center rounded-full bg-astra-red text-lg text-white">
                {i + 1}
              </span>
              <h3 className="mt-4 text-lg font-black text-white">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-white/72">{item.copy}</p>
            </PopCard>
          </li>
        ))}
      </ol>
    </div>
  );
}
```

`src/components/blocks/PillarsBlock.tsx` — same pattern:

```tsx
import { PopCard } from "@/src/components/FlowReveal";
import { SectionHeader } from "@/src/components/SectionHeader";

type Props = { title?: string; items: { label: string; copy: string }[] };

export function PillarsBlock({ title, items }: Props) {
  return (
    <div className="container-wide">
      {title ? <SectionHeader eyebrow="What we look for" title={title} inverse /> : null}
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item, index) => (
          <PopCard key={item.label} className="card-dark p-5" delay={index * 0.04}>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-astra-red">{item.label}</p>
            <p className="mt-2 text-sm leading-6 text-white/72">{item.copy}</p>
          </PopCard>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 6: PageHero text reveals on load**

In `src/components/blocks/PageHero.tsx`, add `import { Reveal } from "@/src/components/Reveal";` and change `<div className="container-wide">` to `<Reveal className="container-wide">` (and the closing tag to `</Reveal>`).

- [ ] **Step 7: Hero stat rail — staggered entrance + gold sweep**

In `src/components/HeroIntro.tsx`, add above the component (module scope, after `stats`):

```tsx
const railVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.14, delayChildren: 0.3 } }
};

const statVariants = {
  hidden: { opacity: 0, x: 24 },
  show: { opacity: 1, x: 0, transition: { duration: 0.7, ease: "easeOut" } }
};

const sweepVariants = {
  hidden: { scaleX: 0 },
  show: { scaleX: 1, transition: { duration: 0.5, delay: 0.25, ease: "easeOut" } }
};
```

Replace the `<motion.dl ...>` block (lines ~165–184) with:

```tsx
<motion.dl
  variants={railVariants}
  initial="hidden"
  animate="show"
  className="mt-2 grid gap-px overflow-hidden rounded-xl border border-white/12 bg-white/5 backdrop-blur lg:ml-auto lg:max-w-xs"
>
  {stats.map((stat) => (
    <motion.div
      key={stat.value}
      variants={statVariants}
      className="flex flex-col gap-1 bg-astra-ink/30 px-5 py-5"
    >
      <dt className="crest-type text-3xl leading-none text-white lg:text-4xl">
        <span className="text-astra-gold">{stat.value}</span>
      </dt>
      <motion.span
        variants={sweepVariants}
        aria-hidden="true"
        className="block h-px w-10 origin-left bg-astra-gold/70"
      />
      <dd className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-white/60">
        {stat.label}
      </dd>
    </motion.div>
  ))}
</motion.dl>
```

- [ ] **Step 8: Tests + typecheck**

Run: `npm test` and `npm run typecheck`
Expected: pass/clean.

- [ ] **Step 9: Commit**

```bash
git add src/components/Reveal.tsx src/components/FlowReveal.tsx src/components/SectionHeader.tsx src/components/blocks/CardsBlock.tsx src/components/blocks/StepsBlock.tsx src/components/blocks/PillarsBlock.tsx src/components/blocks/PageHero.tsx app/page.tsx src/components/HeroIntro.tsx
git commit -m "feat: hover separation (ambient vs interactive), inner-page reveals, stat rail stagger"
```

---

### Task 11: Full verification + preview QA

- [ ] **Step 1: Full local checks**

Run: `npm test` then `npm run typecheck`
Expected: all green. (`next build` is NOT runnable on S: — the preview deploy is the build check.)

- [ ] **Step 2: Push and confirm the preview build**

```bash
git push personal round4-dynamic-motion
```

Expected: Vercel preview at `astra-united-git-round4-dynamic-motion-mazdaks-projects-dffe9641.vercel.app` builds successfully.

- [ ] **Step 3: Visual QA on the preview** *(note: preview URLs are auth-protected — if I can't reach it headlessly, verify what I can on the local dev server and hand Mazdak the QA list for the preview)*

Check each item:
- Hero: poster paints fast, loop fades in and ping-pongs smoothly, no jump at the ends; text remains legible.
- Loop pauses when the tab is hidden / hero scrolled away (check via DevTools performance or visually).
- Reduced motion (DevTools emulation): poster only, no reveals hidden.
- Buttons: sweep + lift + arrow nudge on hero CTAs, header Register, sponsors CTA, inner-page CTA, form submit; ghost variant distinct.
- Nav: gold underline slide; no bg block.
- Non-clickable cards: ambient border/bg shift only, no lift, default cursor. Clickable join/contact cards: clear lift + shadow + pointer.
- Logo: 64px crest, "Astra United" one line, nothing overlaps at 1280/768/390 widths.
- Inner pages (the-club, teams, join-us, contact, shop): headers and cards reveal on scroll; nothing stays invisible.
- Mobile width: hero loop uses 960 frames (Network tab), layout intact.

- [ ] **Step 4: Report to Mazdak with the preview URL for approval. STOP — production only after his sign-off.**

---

### Task 12: Ship (only after Mazdak approves the preview)

- [ ] **Step 1: Use superpowers:finishing-a-development-branch**

Merge `round4-dynamic-motion` → `main`, push `personal main` (auto-deploys production), verify live site, then delete the feature branch (keep `backup/pre-round4` until Mazdak confirms production looks right).
