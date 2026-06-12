# Astra Round 4.5 "Polish & Real Ball" Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the "wheel" line-ball with the approved realistic vector football, audit/fix over-zoomed inner-page heroes, turn the Women's First Team card into a stop-motion loop, and run a full consistency review — all on `round4-dynamic-motion`, no production ship.

**Architecture:** The ball becomes two stacked layers (rotating SVG texture + fixed lighting overlay) so scroll-roll reads as a 3D sphere. The hero stop-motion system (`frameSrc`, `HeroFramesCanvas`, `build-hero-frames.mjs`) is generalised to support multiple frame sets via a base-path parameter and config-file argument, then reused for the women's card with IntersectionObserver-gated preloading. Hero audit and consistency review are Playwright passes over Mazdak's dev server with fixes committed in small groups.

**Tech Stack:** Next.js 14 App Router, TypeScript, Tailwind, framer-motion, vitest, sharp, Playwright MCP.

**Spec:** `docs/superpowers/specs/2026-06-12-astra-round4-polish-real-ball-design.md`

---

## Non-negotiable working rules (from Mazdak)

- Commit as `mazdak.gh1995@gmail.com` (already the repo-local git identity — verify with `git config user.email`). **NO `Co-Authored-By` trailer on any commit.**
- `next build` FAILS on the S: network drive. Production build is verified via the Vercel cloud preview that builds on branch push. Local verification = `npm test` + `npm run typecheck` only.
- **NEVER start a second dev server.** Mazdak runs `next dev`; view pages via Playwright MCP against `http://localhost:3000`. If it isn't running, ask him to start it.
- Designer-approved text formats, colours, sizes, weights, tracking, contrast are **FROZEN**. Consistency findings that would touch them get *reported*, not fixed.
- S: drive quirk: git checkout/merge "Permission denied" on new dirs → just re-run the command. Glob tool can time out on `public/images/**` → use targeted `Get-ChildItem` instead.
- sharp on DSLR JPGs: `.rotate().toBuffer()` FIRST, then re-measure with `metadata()` before any `.extract()`/`.resize()` (EXIF rotation gotcha).
- Homepage hero loop is **out of scope** — do not touch `HeroIntro`'s media, frames, or pipeline output in `public/images/hero-frames/`.

## File structure (what's created / modified)

| File | Role |
|---|---|
| `src/components/SoccerBall.tsx` | REWRITE: realistic vector football SVG (spinner texture) + exported `BallShade` fixed-light overlay. Props shrink to `className`/`label`. |
| `src/components/Touchline.tsx` | MODIFY: split ball transform into translating wrapper + rotating spinner, add `BallShade` sibling, drop gold ring + stroke props. |
| `src/components/HeroIntro.tsx` | MODIFY: handoff ball becomes white realistic ball + gold glow ring (replaces gold stroke). |
| `src/lib/hero-frames.ts` + `.test.ts` | MODIFY: `frameSrc()` gains `basePath` param (TDD). |
| `src/components/HeroFramesCanvas.tsx` | MODIFY: `basePath` + `preload: "eager" \| "near-viewport"` props. |
| `scripts/build-hero-frames.mjs` | MODIFY: config path as CLI arg; stage/portrait/subjectX/mode read from config with current values as defaults. |
| `scripts/women-frames.config.json` | CREATE: chosen women's burst → `public/images/women-frames`. |
| `src/components/WomensMotionCard.tsx` | CREATE: poster + lazy canvas loop for homepage section 5. |
| `app/page.tsx` | MODIFY: section 5 card uses `WomensMotionCard`; drop `photos.womens`. |
| `src/lib/site-data.ts` / `app/shop/page.tsx` | MODIFY (audit-dependent): hero src/alt/blurDataURL swaps. |
| `.superpowers/round4.5/make-women-contact-sheet.mjs` | CREATE (gitignored): contact sheet for Mazdak's burst pick. |

Current inner-page hero sources (for Task 8 reference):

| Page | URL | Hero source | Where defined |
|---|---|---|---|
| The Club | `/the-club` | `community/astra-community-squad-portrait-1920.webp` | `site-data.ts:169` |
| Teams | `/teams` | `academy/astra-academy-dribble-duel-1920.webp` | `site-data.ts:243` |
| Join Us | `/join-us` | `academy/astra-academy-training-wide-1920.webp` | `site-data.ts:292` |
| News & Media | `/news-media` | `community/astra-community-team-photo-1920.webp` | `site-data.ts:360` |
| Sponsors | `/sponsors` | `kit/astra-kit-ball-1920.webp` | `site-data.ts:407` |
| Contact | `/contact` | `academy/astra-academy-coaching-huddle-1920.webp` | `site-data.ts:459` |
| Shop | `/shop` | `kit/astra-kit-ball-1920.webp` | `app/shop/page.tsx:32` (inline, NOT site-data) |

---

### Task 1: Realistic vector football — `SoccerBall.tsx` rewrite

**Files:**
- Rewrite: `src/components/SoccerBall.tsx`

The geometry below is the exact output of the approved prototype's generator (centre pentagon r=32 at −90°, five rim pentagons r=21 at radius 84 with radial 0.5 / tangential 0.85 squash, quadratic seams 32→66 bulged +5°). Do not re-derive it.

- [ ] **Step 1: Replace the file contents**

```tsx
import { useId } from "react";

type SoccerBallProps = {
  className?: string;
  label?: string;
};

// Generated truncated-icosahedron approximation (see Round 4.5 spec §1):
// one regular centre pentagon + five radially-squashed rim pentagons +
// curved quadratic seams. Numbers come from the approved prototype generator.
const CENTER_PENTAGON = "M100.0 68.0L130.4 90.1L118.8 125.9L81.2 125.9L69.6 90.1Z";
const RIM_PENTAGONS = [
  "M100.0 26.5L83.0 19.2L89.5 7.5L110.5 7.5L117.0 19.2Z",
  "M169.9 77.3L171.6 58.9L184.7 61.4L191.2 81.4L182.0 91.2Z",
  "M143.2 159.5L161.2 155.4L162.9 168.7L145.9 181.0L133.7 175.3Z",
  "M56.8 159.5L66.3 175.3L54.1 181.0L37.1 168.7L38.8 155.4Z",
  "M30.1 77.3L18.0 91.2L8.8 81.4L15.3 61.4L28.4 58.9Z"
];
const SEAMS = [
  "M100.0 68.0Q104.3 51.2 100.0 34.0",
  "M130.4 90.1Q147.7 89.0 162.8 79.6",
  "M118.8 125.9Q125.2 142.0 138.8 153.4",
  "M81.2 125.9Q67.9 137.0 61.2 153.4",
  "M69.6 90.1Q54.9 80.9 37.2 79.6"
];

/**
 * Realistic vector football (Round 4.5): white sphere radial gradient,
 * black pentagons, curved seams. This is the TEXTURE layer only — it is
 * meant to rotate. Pair it with a non-rotating <BallShade /> sibling so the
 * fixed light makes the flat circle read as a 3D sphere (the anti-wheel
 * trick). The ball is full-colour; it no longer recolours via stroke.
 */
export function SoccerBall({ className = "", label = "Astra football" }: SoccerBallProps) {
  // The ball renders twice on the homepage (rail + hero handoff); useId keeps
  // the gradient ids unique so the two SVGs don't silently share one def.
  const id = useId();
  const sphereId = `ball-sphere-${id}`;
  return (
    <svg
      className={className}
      viewBox="0 0 200 200"
      role="img"
      aria-label={label}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id={sphereId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="62%" stopColor="#f0f4f6" />
          <stop offset="88%" stopColor="#cfd8de" />
          <stop offset="100%" stopColor="#aab6c0" />
        </radialGradient>
      </defs>
      <circle cx="100" cy="100" r="96" fill={`url(#${sphereId})`} />
      <g stroke="#3a4750" strokeWidth="2.4" fill="none">
        {SEAMS.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
      <path d={CENTER_PENTAGON} fill="#10181d" />
      <g fill="#10181d">
        {RIM_PENTAGONS.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
      <circle cx="100" cy="100" r="95" fill="none" stroke="#8d9aa6" strokeWidth="2" />
    </svg>
  );
}

/**
 * Fixed lighting overlay for the ball: radial highlight up-left, soft shade
 * down-right. Must be a NON-ROTATING sibling of the rotating texture —
 * the stationary light over a rolling texture is what kills the wheel look.
 * Deliberately NO inset box-shadow ring (it created a "hollow" edge).
 */
export function BallShade({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 rounded-full ${className}`}
      style={{
        background:
          "radial-gradient(circle at 32% 26%, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0) 40%), radial-gradient(circle at 72% 80%, rgba(2,10,18,0.42) 0%, rgba(2,10,18,0) 55%)"
      }}
    />
  );
}
```

- [ ] **Step 2: Typecheck — EXPECT FAILURES at the two call sites**

Run: `npm run typecheck`
Expected: errors in `src/components/Touchline.tsx` (passes `strokeWidth={1.4}`) — that prop no longer exists. (`HeroIntro.tsx` passes only `className`/`label`, so it compiles but renders wrong until Task 3.) This confirms the contract change; the call sites are fixed in Tasks 2–3.

- [ ] **Step 3: Do NOT commit yet** — Touchline must compile first; Task 2 commits both together.

### Task 2: Touchline — rotating spinner + fixed shade + remove stroke-era styling

**Files:**
- Modify: `src/components/Touchline.tsx` (import at line 5, refs near line 50, transform write at lines 171–173, ball markup at lines 247–255)

- [ ] **Step 1: Update the import**

```tsx
import { BallShade, SoccerBall } from "@/src/components/SoccerBall";
```

- [ ] **Step 2: Add a spinner ref next to `ballRef` (line ~50)**

```tsx
const ballRef = useRef<HTMLDivElement>(null);
const spinnerRef = useRef<HTMLDivElement>(null);
```

- [ ] **Step 3: Split the transform in the rAF loop (replace lines 171–173)**

```tsx
        if (ballRef.current) {
          ballRef.current.style.transform = `translate3d(${cx}px, ${cy}px, 0) translate(-50%, -50%)`;
        }
        if (spinnerRef.current) {
          spinnerRef.current.style.transform = `rotate(${rotationRef.current}deg)`;
        }
```

- [ ] **Step 4: Replace the ball markup (lines 247–255)**

The gold ring span and `text-white` go (stroke-era styling; the approved 48px prototype had neither). The drop-shadow stays — it grounds the ball on the rail.

```tsx
          <div
            ref={ballRef}
            aria-hidden="true"
            className="pointer-events-none absolute left-0 top-0 z-10 drop-shadow-[0_6px_14px_rgba(0,0,0,0.55)]"
            style={{ width: BALL_SIZE, height: BALL_SIZE, willChange: "transform" }}
          >
            <div ref={spinnerRef} className="absolute inset-0" style={{ willChange: "transform" }}>
              <SoccerBall className="h-full w-full" />
            </div>
            <BallShade />
          </div>
```

- [ ] **Step 5: Verify**

Run: `npm run typecheck` → PASS. Run: `npm test` → all tests pass (ball math in `src/lib/touchline` is untouched).

- [ ] **Step 6: Commit**

```bash
git add src/components/SoccerBall.tsx src/components/Touchline.tsx
git commit -m "feat: realistic vector football with fixed-light shade on the touchline rail"
```

### Task 3: Hero handoff — gold glow ring replaces gold stroke

**Files:**
- Modify: `src/components/HeroIntro.tsx` (import line 7, handoff ball block lines 197–212)

- [ ] **Step 1: Update the import**

```tsx
import { BallShade, SoccerBall } from "@/src/components/SoccerBall";
```

- [ ] **Step 2: Replace the handoff ball block**

The wrapper loses `text-astra-gold` (no longer drives anything); the gold signal becomes a glow ring around the white ball — same moment, same meaning, new form. The gentle ±4° float on the wrapper is fine: the shade tilting 4° is imperceptible.

```tsx
      {/* Touchline handoff ball (decorative) — gold glow marks the handoff */}
      <motion.div
        className="pointer-events-none absolute z-[5] h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24"
        style={{
          left: "var(--hero-handoff-x)",
          top: "var(--hero-handoff-y)",
          translateX: "-50%",
          translateY: "-50%"
        }}
        animate={{ y: [-4, 6, -4], rotate: [0, 4, 0] }}
        transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden="true"
        data-hero-handoff-ball
      >
        <span
          aria-hidden="true"
          className="absolute inset-[-6px] rounded-full border border-astra-gold/60"
          style={{ boxShadow: "0 0 24px 6px rgba(242,201,76,0.35)" }}
        />
        <SoccerBall className="h-full w-full" label="Football at motion handoff point" />
        <BallShade />
      </motion.div>
```

- [ ] **Step 3: Verify**

Run: `npm run typecheck` → PASS. Run: `npm test` → PASS.

- [ ] **Step 4: Visual check on Mazdak's dev server (Playwright)**

Navigate to `http://localhost:3000`, screenshot the hero (handoff ball: white ball + gold glow) and scroll partway to see the rail ball rolling — light stays up-left while pentagons rotate; no hollow ring. If the dev server isn't running, ask Mazdak to start it; don't start one.

- [ ] **Step 5: Commit**

```bash
git add src/components/HeroIntro.tsx
git commit -m "feat: hero handoff ball goes white with gold glow ring"
```

### Task 4: `frameSrc()` base-path parameter (TDD)

**Files:**
- Modify: `src/lib/hero-frames.ts:40-42`
- Test: `src/lib/hero-frames.test.ts` ("frame sources" describe block)

- [ ] **Step 1: Write the failing test** — add to the `frame sources` block:

```ts
  it("accepts a custom base path for other frame sets", () => {
    expect(frameSrc(0, 1280, "/images/women-frames")).toBe(
      "/images/women-frames/frame-001-1280.webp"
    );
    expect(frameSrc(2, 960, "/images/women-frames")).toBe(
      "/images/women-frames/frame-003-960.webp"
    );
  });
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm test`
Expected: FAIL — `frameSrc` takes 2 args (TS error / wrong path).

- [ ] **Step 3: Implement**

```ts
export function frameSrc(
  index: number,
  width: FrameWidth,
  basePath = "/images/hero-frames"
): string {
  return `${basePath}/frame-${String(index + 1).padStart(3, "0")}-${width}.webp`;
}
```

- [ ] **Step 4: Run tests — all pass (existing default-path assertions prove the hero is unaffected)**

Run: `npm test` → PASS, `npm run typecheck` → PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/hero-frames.ts src/lib/hero-frames.test.ts
git commit -m "feat: frameSrc takes a base path so multiple frame sets can coexist"
```

### Task 5: `HeroFramesCanvas` — base path + near-viewport preload gate

**Files:**
- Modify: `src/components/HeroFramesCanvas.tsx`

The hero preloads immediately (first paint). The women's card sits below the fold, so its frames must not load until the card approaches the viewport. Default props keep hero behaviour identical.

- [ ] **Step 1: Replace the component with the gated version**

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

type Props = {
  frameCount: number;
  fps?: number;
  basePath?: string;
  /**
   * "eager": start loading frames on mount (hero — it IS the first paint).
   * "near-viewport": wait until the canvas is within ~600px of the viewport
   * (below-the-fold cards must not compete with first-paint bandwidth).
   */
  preload?: "eager" | "near-viewport";
};

/**
 * Stop-motion canvas player. Invisible until every frame is loaded, then
 * fades in over the poster and ping-pong loops. On any frame load error,
 * reduced motion, or missing canvas support the poster simply stays.
 */
export function HeroFramesCanvas({
  frameCount,
  fps = 7,
  basePath = "/images/hero-frames",
  preload = "eager"
}: Props) {
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
    let loadStarted = false;
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

    const beginLoading = () => {
      if (cancelled || loadStarted) return;
      loadStarted = true;
      for (let i = 0; i < frameCount; i++) {
        const img = new Image();
        img.decoding = "async";
        img.src = frameSrc(i, size, basePath);
        img.onload = () => {
          loadedCount += 1;
          if (loadedCount === frameCount) start();
        };
        img.onerror = () => {
          cancelled = true; // poster stays; never show a broken loop
        };
        images.push(img);
      }
    };

    let preloadObserver: IntersectionObserver | null = null;
    if (preload === "eager") {
      beginLoading();
    } else {
      preloadObserver = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            beginLoading();
            preloadObserver?.disconnect();
          }
        },
        { rootMargin: "600px 0px" }
      );
      preloadObserver.observe(canvas);
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
      preloadObserver?.disconnect();
      window.removeEventListener("resize", resize);
    };
  }, [frameCount, fps, basePath, preload]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`absolute inset-0 h-full w-full transition-opacity duration-700 ${ready ? "opacity-100" : "opacity-0"}`}
    />
  );
}
```

- [ ] **Step 2: Verify**

Run: `npm run typecheck` → PASS. Run: `npm test` → PASS. `HeroMedia.tsx:104` passes no new props, so the hero keeps `eager` + `/images/hero-frames` — behaviour identical.

- [ ] **Step 3: Visual sanity check (Playwright)** — homepage hero still fades in and loops.

- [ ] **Step 4: Commit**

```bash
git add src/components/HeroFramesCanvas.tsx
git commit -m "feat: HeroFramesCanvas supports custom frame sets and near-viewport preloading"
```

### Task 6: Frame pipeline — config-file argument + per-set stage settings

**Files:**
- Modify: `scripts/build-hero-frames.mjs`

Make the script reusable, not forked. Hero frames are **NOT regenerated** — defaults reproduce current behaviour, and we never run it against the hero config in this round.

- [ ] **Step 1: Replace the config-load + constants block (lines 16–26)**

```js
const configPath = process.argv[2] ?? "scripts/hero-frames.config.json";
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
const { sourceDir, outDir, frames } = config;

// Where the subject strip's centre sits on the landscape stage (0..1).
// Hero default 0.62 keeps the subject right-of-centre so the headline owns
// the left; other sets override via config.
const SUBJECT_X = config.subjectX ?? 0.62;

const STAGE = { width: 1280, height: 720, quality: 50, ...config.stage }; // desktop
const PORTRAIT = { width: 960, quality: 48, ...config.portrait }; // mobile
// "stage": composite the portrait strip onto a dark brand stage (hero look).
// "cover": plain cover-crop of the source to the stage box (for sets whose
// subject framing survives a straight crop).
const MODE = config.mode ?? "stage";
```

- [ ] **Step 2: Add a cover-mode builder and route on MODE**

After `buildStage(...)`, add:

```js
/** Plain cover crop — used when the source framing survives a straight crop. */
async function buildCover(buffer, outWidth, outHeight, quality, outPath) {
  await sharp(buffer)
    .resize(outWidth, outHeight, { fit: "cover", position: "attention" })
    .webp({ quality })
    .toFile(outPath);
}
```

Then change `processFrame` and `buildPosters` to route:

```js
async function processFrame(file, index) {
  const { buffer, meta } = await rotatedInput(file);
  const n = String(index + 1).padStart(3, "0");
  const outPath = path.join(outDir, `frame-${n}-${STAGE.width}.webp`);
  if (MODE === "cover") {
    await buildCover(buffer, STAGE.width, STAGE.height, STAGE.quality, outPath);
  } else {
    await buildStage(buffer, meta, STAGE.width, STAGE.height, STAGE.quality, outPath);
  }
  await sharp(buffer)
    .resize({ width: PORTRAIT.width })
    .webp({ quality: PORTRAIT.quality })
    .toFile(path.join(outDir, `frame-${n}-${PORTRAIT.width}.webp`));
}

async function buildPosters(file) {
  const { buffer, meta } = await rotatedInput(file);
  const desktopPath = path.join(outDir, "poster-1920.webp");
  if (MODE === "cover") {
    const scale = 1920 / STAGE.width;
    await buildCover(buffer, 1920, Math.round(STAGE.height * scale), 55, desktopPath);
  } else {
    await buildStage(buffer, meta, 1920, 1080, 55, desktopPath);
  }
  const mobilePath = path.join(outDir, `poster-${PORTRAIT.width}.webp`);
  await sharp(buffer).resize({ width: PORTRAIT.width }).webp({ quality: 55 }).toFile(mobilePath);
  return {
    blurDataURL: await blurFor(desktopPath),
    blurDataURLMobile: await blurFor(mobilePath)
  };
}
```

NOTE: the hero config has no `stage`/`portrait`/`subjectX`/`mode` keys, so STAGE stays `1280×720 q50`, PORTRAIT `960 q48`, SUBJECT_X `0.62`, MODE `"stage"`, and filenames stay `frame-NNN-1280/-960.webp` — identical to today.

- [ ] **Step 3: Update the usage header comment** (line 2): `// Usage: node scripts/build-hero-frames.mjs [path/to/config.json]`

- [ ] **Step 4: Syntax check (do NOT run against the hero config — that would regenerate hero frames)**

Run: `node --check scripts/build-hero-frames.mjs`
Expected: no output (clean parse).

- [ ] **Step 5: Commit**

```bash
git add scripts/build-hero-frames.mjs
git commit -m "feat: frame pipeline takes a config argument with per-set stage settings"
```

### Task 7: Women's burst — contact sheet, Mazdak picks ⛔ CHECKPOINT

**Files:**
- Create: `.superpowers/round4.5/make-women-contact-sheet.mjs` (gitignored scratch)
- Output: `.superpowers/round4.5/contact-sheet.html`

- [ ] **Step 1: Write the contact-sheet generator**

```js
// Contact sheet of all four women's bursts so Mazdak can pick character+burst.
// Usage: node .superpowers/round4.5/make-women-contact-sheet.mjs
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT =
  "S:/sash work/Astra united/Content Copies-20260602T085649Z-3-001/preparing the motion graphic/women";
const BURSTS = [
  { key: "c1o1", label: "Character 1 — option 1 (12 frames, 0J6A6502–6513)", dir: "character 1/option 1" },
  { key: "c1o2", label: "Character 1 — option 2 (21 frames, 0J6A6423–6443)", dir: "character 1/option 2" },
  { key: "c2o1", label: "Character 2 — option 1 (17 frames, 0J6A6352–6368)", dir: "character 2/option 1" },
  { key: "c2o2", label: "Character 2 — option 2 (40 frames, 0J6A6380–6419)", dir: "character 2/option 2" }
];

let html = `<style>
  body { background:#06111a; color:#e8eef2; font-family:system-ui; padding:24px; }
  h2 { margin:28px 0 10px; font-size:16px; }
  .row { display:flex; flex-wrap:wrap; gap:6px; }
  .row img { height:150px; border-radius:4px; display:block; }
  .row figure { margin:0; text-align:center; font-size:10px; color:#8d9aa6; }
</style><h1>Women's section — pick a character + burst</h1>`;

for (const burst of BURSTS) {
  const dir = path.join(ROOT, burst.dir);
  const files = fs.readdirSync(dir).filter((f) => f.toUpperCase().endsWith(".JPG")).sort();
  html += `<h2>${burst.label}</h2><div class="row">`;
  for (const file of files) {
    // .rotate() honours EXIF — DSLR portrait shots come out upright.
    const buf = await sharp(path.join(dir, file)).rotate().resize({ height: 150 }).webp({ quality: 45 }).toBuffer();
    html += `<figure><img src="data:image/webp;base64,${buf.toString("base64")}"><figcaption>${file.replace(".JPG", "")}</figcaption></figure>`;
  }
  html += `</div>`;
}

fs.writeFileSync("S:/sash work/Astra united/.superpowers/round4.5/contact-sheet.html", html);
console.log("contact sheet written");
```

- [ ] **Step 2: Run it**

Run: `node .superpowers/round4.5/make-women-contact-sheet.mjs`
Expected: `contact sheet written`; HTML is a few MB (90 inline thumbs).

- [ ] **Step 3: ⛔ STOP — Mazdak picks.** Tell him to open `.superpowers/round4.5/contact-sheet.html` in his browser, then ask (AskUserQuestion is fine — options c1o1/c1o2/c2o1/c2o2) which character + burst to use. Also inspect the thumbs yourself and report which frames (if any) break burst continuity (camera jump, subject exits frame) and should be dropped from the curated list.

- [ ] **Step 4: Record the choice** — note the chosen burst dir + curated frame list; they feed Task 8's config.

### Task 8: Generate the women's frame set

**Files:**
- Create: `scripts/women-frames.config.json`
- Output: `public/images/women-frames/` (webp frames + posters)

- [ ] **Step 1: Check source orientation first**

```bash
node -e "import('sharp').then(async ({default:sharp})=>{const b=await sharp('Content Copies-20260602T085649Z-3-001/preparing the motion graphic/women/<CHOSEN DIR>/<FIRST FRAME>.JPG').rotate().toBuffer();console.log(await sharp(b).metadata().then(m=>[m.width,m.height]))})"
```

Sources are expected PORTRAIT (~3648×5472, like the hero bursts).

- [ ] **Step 2: Write the config** — fill `frames` with the curated list from Task 7 (relative to `sourceDir`, sorted ascending). Card target: ~648×460 desktop (ratio ≈1.41) at 45vw, ~390×460 mobile at 100vw. Desktop set is built at 1280×908 (same ratio, 2× headroom); mobile reuses native portrait 960.

```json
{
  "sourceDir": "Content Copies-20260602T085649Z-3-001/preparing the motion graphic/women/<CHOSEN DIR>",
  "outDir": "public/images/women-frames",
  "mode": "cover",
  "subjectX": 0.5,
  "stage": { "width": 1280, "height": 908, "quality": 50 },
  "portrait": { "width": 960, "quality": 48 },
  "frames": ["0J6A____.JPG", "..."]
}
```

Start with `"mode": "cover"` (the card is a photo card, not a hero with a headline). After Step 3, eyeball 3–4 output frames; if the cover crop beheads the player or the subject drifts out of frame across the burst, switch to `"mode": "stage"`, set `"subjectX": 0.5`, and rerun.

- [ ] **Step 3: Run the pipeline**

Run: `node scripts/build-hero-frames.mjs scripts/women-frames.config.json`
Expected: JSON with `{ frameCount, blurDataURL, blurDataURLMobile }` + total MB. Copy these for Task 9. Payload should land meaningfully under the hero set (~the card renders smaller); if total MB is much above the hero's, lower quality a notch or trim frames.

- [ ] **Step 4: Inspect output frames** (Read 3–4 of `public/images/women-frames/frame-*-1280.webp` as images): subject whole and well-framed in every sampled frame, first/last frames similar enough to ping-pong cleanly.

- [ ] **Step 5: Commit (config + generated assets)**

```bash
git add scripts/women-frames.config.json public/images/women-frames
git commit -m "feat: women's first-team stop-motion frame set"
```

### Task 9: `WomensMotionCard` + wire into homepage section 5

**Files:**
- Create: `src/components/WomensMotionCard.tsx`
- Modify: `app/page.tsx` (imports ~line 14, `photos.womens` at lines 38–43, card at lines 241–256)

- [ ] **Step 1: Create the component** — replace `frameCount`/blur placeholders with Task 8's pipeline output values:

```tsx
"use client";

import Image from "next/image";
import { HeroFramesCanvas } from "@/src/components/HeroFramesCanvas";

// Values from `node scripts/build-hero-frames.mjs scripts/women-frames.config.json`.
const FRAME_COUNT = 0; // ← pipeline output
const POSTER = "/images/women-frames/poster-1920.webp";
const BLUR = "data:image/webp;base64,..."; // ← pipeline output blurDataURL

/**
 * Women's First Team card (homepage section 5): hero-style ping-pong
 * stop-motion loop. Below the fold, so frames only preload when the card
 * nears the viewport; the poster paints first and simply stays for
 * reduced-motion users or on any load failure.
 */
export function WomensMotionCard() {
  return (
    <div className="relative h-[460px] w-full">
      <Image
        src={POSTER}
        alt="Astra United women's player working with the ball on the DISC Darebin pitch"
        fill
        placeholder="blur"
        blurDataURL={BLUR}
        sizes="(min-width: 1024px) 45vw, 100vw"
        className="object-cover"
      />
      <HeroFramesCanvas
        frameCount={FRAME_COUNT}
        fps={7}
        basePath="/images/women-frames"
        preload="near-viewport"
      />
    </div>
  );
}
```

(Write honest alt text for the actual chosen burst — describe what the player is doing.)

- [ ] **Step 2: Wire into `app/page.tsx`**

Add import: `import { WomensMotionCard } from "@/src/components/WomensMotionCard";`
Delete the `womens` entry from `photos` (lines 38–43). Replace the card's `<Image …photos.womens… />` (lines 242–251) with:

```tsx
            <PopCard className="card-dark overflow-hidden">
              <WomensMotionCard />
              <div className="border-t border-white/10 p-5 text-white">
                <p className="text-xs font-black uppercase tracking-normal text-astra-gold">Women's First Team</p>
                <p className="mt-2 text-sm leading-6 text-white/72">A growing women's program at Darebin International Sports Centre.</p>
              </div>
            </PopCard>
```

The caption block is unchanged (frozen text styles).

- [ ] **Step 3: Verify**

Run: `npm run typecheck` → PASS. Run: `npm test` → PASS.

- [ ] **Step 4: Visual + behaviour check (Playwright on Mazdak's dev server)**

1. Load homepage; confirm via network requests that NO `/images/women-frames/frame-*` loads while at the top.
2. Scroll to section 5: poster visible, then loop fades in and ping-pongs.
3. Mobile width (390): card fills width, subject framed.
4. Console: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/WomensMotionCard.tsx app/page.tsx
git commit -m "feat: women's first-team card becomes a lazy stop-motion loop"
```

### Task 10: Inner-page hero audit + fixes

**Files:**
- Possibly modify: `src/lib/site-data.ts` (hero entries — see table at top), `app/shop/page.tsx:31-36`
- Method: Playwright on Mazdak's dev server; judge in context, verdict BEFORE changing anything

- [ ] **Step 1: Screenshot all 7 pages at desktop ~1440 and mobile ~390** (`/the-club`, `/teams`, `/join-us`, `/news-media`, `/sponsors`, `/contact`, `/shop`). The PageHero band is `min-h-[60svh]` with `object-cover` — judge whether the subject is over-cropped/"too zoomed" at each width.

- [ ] **Step 2: Record a verdict table** (page × {desktop, mobile} → OK / over-zoomed + why) in the session before touching code.

- [ ] **Step 3: Fix each bad hero, in order of preference:**
  1. **Swap to an existing landscape (~1.5 ratio) photo** from `public/images` that suits the page subject. Check candidates with `Get-ChildItem` per folder (Glob times out on S:) and confirm ratio via `node -e "import('sharp').then(async({default:s})=>console.log(await s('public/images/<f>').metadata().then(m=>m.width/m.height)))"`.
  2. **Else build a fresh sharp 1920-wide landscape crop** from the original DSLR sources (`Content Copies-…/Camera-*`): `.rotate().toBuffer()`, re-measure, `.extract()` a ~16:9 region framing the subject, `.resize({width:1920})`, `.webp({quality:~62})` into the matching `public/images/<category>/` folder with the established naming (`astra-<category>-<subject>-1920.webp`).

  Every change gets a fresh 16px blurDataURL:

  ```bash
  node -e "import('sharp').then(async({default:s})=>{const b=await s('public/images/<file>').resize(16).webp({quality:30}).toBuffer();console.log('data:image/webp;base64,'+b.toString('base64'))})"
  ```

  …and honest alt text describing the actual photo. Update `site-data.ts` hero entry (or the inline hero in `app/shop/page.tsx`).

- [ ] **Step 4: Re-screenshot changed pages both widths** — confirm framing fixed, no new crop problems.

- [ ] **Step 5: Verify + commit per logical group**

Run: `npm run typecheck` && `npm test` → PASS.

```bash
git add src/lib/site-data.ts app/shop/page.tsx public/images
git commit -m "fix: reframe over-zoomed inner-page heroes (audit round 4.5)"
```

(If new webps were generated, include them; split commits if fixes are unrelated.)

### Task 11: Full consistency review

**Method:** Playwright pass over every page on the dev server (`/`, the 6 marketing pages, `/shop`), desktop + mobile. Findings fixed in place with small per-group commits — EXCEPT frozen text styling deviations, which are reported to Mazdak instead.

- [ ] **Step 1: CTA sweep** — every button-like element uses `CtaLink` / `.btn*`. Grep `className="[^"]*\b(rounded-(md|lg|full))[^"]*"` over `app/**/*.tsx` + `src/components/**/*.tsx` and eyeball anything button-shaped that isn't CtaLink/.btn. Known suspect to check in context: `app/shop/page.tsx:51-57` red arrow text-link (compare with the identical pattern inside homepage card-links — if it matches the established text-link pattern, it's fine).

- [ ] **Step 2: Hover separation** — clickable = `.btn*`/`.card-link`/`.nav-underline` strong hover; non-clickable cards = `.card-ambient` whisper only, no lift, no pointer cursor. Hover-test one of each per page via Playwright.

- [ ] **Step 3: Reveals** — SectionHeader/PageHero/blocks animate once on scroll on every page; no double-fires, nothing stuck hidden.

- [ ] **Step 4: Band alternation** — `band-fog`/`band-deep` alternate with no doubled bands on each page (inspect DOM order).

- [ ] **Step 5: Image sources** — content images rendered large use the sharp 1920 sources (`-1920.webp`); no stretched `-800`/`-1280` at large sizes.

- [ ] **Step 6: Console + mobile** — zero console errors on every page; 390px layout clean (no horizontal scroll, no overlapping text).

- [ ] **Step 7: Fix findings in place** (small diffs), one commit per logical group, e.g.:

```bash
git commit -m "fix: consistency pass — <specific finding group>"
```

Frozen-text deviations: collect into the final report for Mazdak, do NOT restyle.

### Task 12: Final verification + preview push

- [ ] **Step 1: Full local gate**

Run: `npm test` → all tests pass (was 21, now 22+ with the frameSrc test). Run: `npm run typecheck` → clean.

- [ ] **Step 2: Push the branch (preview only — NOT main)**

```bash
git push personal round4-dynamic-motion
```

- [ ] **Step 3: Verify the Vercel preview build goes green** (this is the `next build` check — it cannot run on S:). Then spot-check the preview URL: hero loop, rolling ball, women's card, two inner pages.

- [ ] **Step 4: Report to Mazdak** — what changed, hero audit verdict table, consistency findings (incl. any frozen-style deviations found-not-fixed), preview URL. **Shipping to production (existing plan Task 12: merge → `main`, push `personal main`) stays gated on his explicit go-ahead.**

---

## Self-review notes

- Spec §1 ball → Tasks 1–3 (component contract, anti-wheel layering, gold-glow handoff, 48px unchanged via existing `BALL_SIZE`).
- Spec §2 hero audit → Task 10 (verdict-first method, landscape-swap preference, fresh blur + alt, homepage hero untouched).
- Spec §3 women's loop → Tasks 4–9 (frameSrc param TDD, canvas reuse + preload gate, pipeline extended not forked, contact-sheet checkpoint, below-fold loading, caption untouched).
- Spec §4 consistency → Task 11 (checklist mirrors spec; frozen styles report-only).
- Spec Testing → every task runs `npm test`/`npm run typecheck`; build verified via Vercel preview (Task 12); visuals via Playwright on Mazdak's server only.
