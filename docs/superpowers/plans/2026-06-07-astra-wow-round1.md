# Astra United "Wow" Redesign — Round 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the Astra United homepage into a cinematic, real-content "wow" experience — new athletic type, real team copy, a Founder feature, real photography, and a rebuilt smooth "Touchline" scroll-ball — while architecting the hero so the team's future motion frames drop in with no rebuild.

**Architecture:** Next.js 14 App Router. A single `HeroMedia` boundary abstracts hero content (image/crossfade/video/frames). A rebuilt `Touchline` component drives one continuous master path via the Lenis rAF loop using pure, unit-tested geometry helpers. Real content lives in typed data modules. Photos are pre-processed (auto-oriented, compressed) into `public/images/`.

**Tech Stack:** Next.js 14, React 18, TypeScript, Tailwind, framer-motion, lenis, next/font, sharp (build-time image processing), vitest (pure-helper tests).

**Reference spec:** `docs/superpowers/specs/2026-06-07-astra-united-wow-redesign-design.md`

**Build/verify note:** `next build` fails on the `S:` drive. Verify production builds from the mirror:
```powershell
# from repo root, after copying changed files into the mirror
cd C:\tmp\astra-united-vercel-check-fresh
npm run typecheck
npm run build
node .\node_modules\next\dist\bin\next start --hostname 127.0.0.1 --port 3002
```
Unit tests (`vitest`) run fine from the `S:` repo root (no `next build` involved).

---

## File Structure

**Create:**
- `vitest.config.ts` — test runner config (pure helpers only)
- `src/lib/touchline/path.ts` — pure geometry: build master path, length, point-at-length
- `src/lib/touchline/path.test.ts` — unit tests for path math
- `src/lib/touchline/progress.ts` — pure: map scroll → clamped progress, roll delta
- `src/lib/touchline/progress.test.ts` — unit tests
- `src/components/Touchline.tsx` — rebuilt scroll-ball (replaces `ScrollBallFlow.tsx` usage)
- `src/components/HeroMedia.tsx` — hero media boundary (image/crossfade/video/frames)
- `src/components/FounderFeature.tsx` — Dr Emamifar homepage feature
- `src/lib/content/home.ts` — real homepage content
- `src/lib/content/founder.ts` — founder data
- `src/lib/fonts.ts` — next/font display + body
- `scripts/process-images.mjs` — auto-orient + resize + compress curated photos
- `scripts/curated-images.json` — list of chosen source photos + target names/categories

**Modify:**
- `package.json` — add `sharp`, `vitest`; add `test` + `images` scripts
- `app/layout.tsx` — wire next/font variables
- `app/globals.css` — font vars, calmer motion chrome, founder/section styles
- `app/page.tsx` — rebuilt homepage using real content + `HeroMedia` + `Touchline` + `FounderFeature`
- `src/lib/site-data.ts` — remove meta/"Phase 2" copy; keep nav + types
- `src/components/HeroIntro.tsx` — consume `HeroMedia`, real copy, pitch-status pill, stat rail

**Delete (after migration):**
- `src/components/ScrollBallFlow.tsx` — replaced by `Touchline.tsx` (remove in final task once unused)

---

## Task 1: Add test runner + image deps

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`

- [ ] **Step 1: Add dependencies**

Run (from `S:` repo root):
```powershell
npm install -D vitest@^2 ; npm install sharp@^0.33
```
Expected: both install; `package.json` gains `vitest` (devDeps) and `sharp` (deps).

- [ ] **Step 2: Add scripts to `package.json`**

In the `"scripts"` block add:
```json
"test": "vitest run",
"test:watch": "vitest",
"images": "node scripts/process-images.mjs"
```

- [ ] **Step 3: Create `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
    environment: "node"
  }
});
```

- [ ] **Step 4: Verify runner works (no tests yet = success)**

Run: `npm test`
Expected: vitest runs, reports "No test files found" OR exits 0. (If it errors on zero tests, proceed — Task 2 adds the first test.)

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json vitest.config.ts
git commit -m "chore: add vitest and sharp for motion tests and image pipeline"
```

---

## Task 2: Touchline path geometry (pure, tested)

A single master path is a smooth vertical spine with horizontal "dips" toward section anchor x-offsets. We model it as a polyline of points sampled densely, with cumulative arc-length so we can find a point at any normalized distance.

**Files:**
- Create: `src/lib/touchline/path.ts`
- Test: `src/lib/touchline/path.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { buildPolyline, polylineLength, pointAtProgress, type Node } from "./path";

const nodes: Node[] = [
  { x: 100, y: 0 },
  { x: 200, y: 1000 },
  { x: 100, y: 2000 }
];

describe("touchline path", () => {
  it("builds a polyline that starts and ends at the first/last node", () => {
    const pts = buildPolyline(nodes, 8);
    expect(pts[0]).toEqual({ x: 100, y: 0 });
    expect(pts[pts.length - 1]).toEqual({ x: 100, y: 2000 });
  });

  it("length is monotonic and positive", () => {
    const pts = buildPolyline(nodes, 8);
    expect(polylineLength(pts)).toBeGreaterThan(2000);
  });

  it("progress 0 -> first point, 1 -> last point", () => {
    const pts = buildPolyline(nodes, 8);
    expect(pointAtProgress(pts, 0)).toEqual({ x: 100, y: 0 });
    expect(pointAtProgress(pts, 1)).toEqual({ x: 100, y: 2000 });
  });

  it("progress 0.5 lands roughly mid-arc and is clamped", () => {
    const pts = buildPolyline(nodes, 8);
    const mid = pointAtProgress(pts, 0.5);
    expect(mid.y).toBeGreaterThan(800);
    expect(mid.y).toBeLessThan(1200);
    const over = pointAtProgress(pts, 5);
    expect(over).toEqual({ x: 100, y: 2000 });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/touchline/path.test.ts`
Expected: FAIL — module `./path` not found.

- [ ] **Step 3: Implement `src/lib/touchline/path.ts`**

```ts
export type Point = { x: number; y: number };
export type Node = { x: number; y: number };

/** Catmull-Rom-ish smooth polyline through nodes, `seg` samples between each pair. */
export function buildPolyline(nodes: Node[], seg = 24): Point[] {
  if (nodes.length === 0) return [];
  if (nodes.length === 1) return [{ ...nodes[0] }];

  const pts: Point[] = [];
  const pt = (i: number) => nodes[Math.max(0, Math.min(nodes.length - 1, i))];

  for (let i = 0; i < nodes.length - 1; i += 1) {
    const p0 = pt(i - 1);
    const p1 = pt(i);
    const p2 = pt(i + 1);
    const p3 = pt(i + 2);
    const last = i === nodes.length - 2;
    const steps = last ? seg : seg - 1;
    for (let s = 0; s <= steps; s += 1) {
      const t = s / seg;
      const t2 = t * t;
      const t3 = t2 * t;
      const x =
        0.5 *
        (2 * p1.x +
          (-p0.x + p2.x) * t +
          (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
          (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3);
      const y =
        0.5 *
        (2 * p1.y +
          (-p0.y + p2.y) * t +
          (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
          (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3);
      pts.push({ x, y });
    }
  }
  // guarantee exact endpoints
  pts[0] = { ...nodes[0] };
  pts[pts.length - 1] = { ...nodes[nodes.length - 1] };
  return pts;
}

export function polylineLength(pts: Point[]): number {
  let len = 0;
  for (let i = 1; i < pts.length; i += 1) {
    len += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
  }
  return len;
}

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}

/** Point at normalized arc-length progress [0,1]. */
export function pointAtProgress(pts: Point[], progress: number): Point {
  if (pts.length === 0) return { x: 0, y: 0 };
  if (pts.length === 1) return { ...pts[0] };
  const total = polylineLength(pts);
  const target = clamp01(progress) * total;
  let acc = 0;
  for (let i = 1; i < pts.length; i += 1) {
    const seg = Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
    if (acc + seg >= target) {
      const t = seg === 0 ? 0 : (target - acc) / seg;
      return {
        x: pts[i - 1].x + (pts[i].x - pts[i - 1].x) * t,
        y: pts[i - 1].y + (pts[i].y - pts[i - 1].y) * t
      };
    }
    acc += seg;
  }
  return { ...pts[pts.length - 1] };
}

/** Build an SVG path `d` from a polyline. */
export function toSvgPath(pts: Point[]): string {
  if (pts.length === 0) return "M 0 0";
  return pts
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
    .join(" ");
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/touchline/path.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/touchline/path.ts src/lib/touchline/path.test.ts
git commit -m "feat: add tested touchline master-path geometry"
```

---

## Task 3: Progress + roll helpers (pure, tested)

**Files:**
- Create: `src/lib/touchline/progress.ts`
- Test: `src/lib/touchline/progress.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { scrollToProgress, rollDelta } from "./progress";

describe("touchline progress", () => {
  it("maps scroll within bounds to [0,1] and clamps", () => {
    expect(scrollToProgress(0, 0, 1000)).toBe(0);
    expect(scrollToProgress(500, 0, 1000)).toBe(0.5);
    expect(scrollToProgress(1000, 0, 1000)).toBe(1);
    expect(scrollToProgress(-50, 0, 1000)).toBe(0);
    expect(scrollToProgress(5000, 0, 1000)).toBe(1);
  });

  it("returns 0 when range is zero (avoids divide-by-zero)", () => {
    expect(scrollToProgress(10, 100, 100)).toBe(0);
  });

  it("roll delta is distance/circumference in degrees", () => {
    const deg = rollDelta(31.4159, 10); // ~ one circumference for r=10 -> ~360
    expect(deg).toBeGreaterThan(350);
    expect(deg).toBeLessThan(370);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/touchline/progress.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `src/lib/touchline/progress.ts`**

```ts
/** Normalize a scroll position within [start,end] to [0,1], clamped. */
export function scrollToProgress(scroll: number, start: number, end: number): number {
  const range = end - start;
  if (range <= 0) return 0;
  const p = (scroll - start) / range;
  return Math.max(0, Math.min(1, p));
}

/** Degrees a ball of radius r rolls over a given linear distance. */
export function rollDelta(distance: number, radius: number): number {
  const circumference = 2 * Math.PI * radius;
  if (circumference === 0) return 0;
  return (distance / circumference) * 360;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/touchline/progress.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/touchline/progress.ts src/lib/touchline/progress.test.ts
git commit -m "feat: add tested touchline progress and roll helpers"
```

---

## Task 4: Athletic typography via next/font

**Files:**
- Create: `src/lib/fonts.ts`
- Modify: `app/layout.tsx`, `app/globals.css`, `tailwind.config.ts`

- [ ] **Step 1: Create `src/lib/fonts.ts`**

```ts
import { Anton, Inter } from "next/font/google";

export const display = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap"
});

export const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap"
});
```

- [ ] **Step 2: Wire fonts in `app/layout.tsx`**

Import and apply both variables to `<html>` (or `<body>`). Example:
```tsx
import { display, sans } from "@/src/lib/fonts";
// ...
<html lang="en" className={`${display.variable} ${sans.variable}`}>
```
Keep existing metadata/structure; only add the className.

- [ ] **Step 3: Point CSS vars at the loaded fonts in `app/globals.css`**

Replace the `:root` font lines:
```css
  --font-display: var(--font-display, "Arial Black");
  --font-sans: var(--font-sans, "Inter");
```
with usage that trusts next/font (the `.variable` classes now define `--font-display`/`--font-sans`). Remove the hard-coded `"Arial Black"` / `"Inter"` literals from `:root` (next/font provides them). Ensure `.crest-type` and `body` still reference `var(--font-display)` / `var(--font-sans)`.

- [ ] **Step 4: Confirm Tailwind font families resolve** (no change usually needed)

`tailwind.config.ts` already maps `display`/`sans` to the CSS vars. Leave as-is.

- [ ] **Step 5: Typecheck + mirror build**

Run: `npm run typecheck` (from `S:` root) → Expected: passes.
Then copy changed files to mirror and `npm run build` there → Expected: build succeeds, fonts self-hosted.

- [ ] **Step 6: Commit**

```bash
git add src/lib/fonts.ts app/layout.tsx app/globals.css
git commit -m "feat: replace Arial Black with self-hosted Anton display font"
```

---

## Task 5: Image processing pipeline

**Files:**
- Create: `scripts/curated-images.json`, `scripts/process-images.mjs`
- Output: `public/images/<category>/*.webp` (+ generated manifest)

- [ ] **Step 1: Choose curated photos**

Create `scripts/curated-images.json` mapping ~24 source files (absolute paths in the media folder) to `{ out, category, alt }`. Categories: `academy`, `match`, `womens`, `community`, `camps`, `ground`, `kit`. Example shape:
```json
[
  {
    "src": "S:/sash work/Astra united/Content Copies-20260602T085649Z-3-001/images and videos/Camera-20260602T085714Z-3-001/Camera/0J6A6623.JPG",
    "out": "kit/astra-kit-ball.webp",
    "category": "kit",
    "alt": "Astra United Academy training jersey and match ball on the pitch at Darebin"
  }
]
```
(Populate with real choices during execution — open the folder, pick strong, well-lit shots across categories.)

- [ ] **Step 2: Implement `scripts/process-images.mjs`**

```js
import sharp from "sharp";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const list = JSON.parse(await readFile(join(root, "scripts/curated-images.json"), "utf8"));
const outRoot = join(root, "public/images");
const widths = [1920, 1280, 800];
const manifest = [];

for (const item of list) {
  const base = await sharp(item.src).rotate(); // auto-orient via EXIF
  const meta = await base.metadata();
  const outBase = item.out.replace(/\.webp$/, "");
  for (const w of widths) {
    if (meta.width && meta.width < w && w !== widths[widths.length - 1]) continue;
    const outPath = join(outRoot, `${outBase}-${w}.webp`);
    await mkdir(dirname(outPath), { recursive: true });
    await sharp(item.src).rotate().resize({ width: w }).webp({ quality: 78 }).toFile(outPath);
  }
  // tiny blur placeholder
  const blur = await sharp(item.src).rotate().resize({ width: 16 }).webp({ quality: 40 }).toBuffer();
  manifest.push({
    category: item.category,
    alt: item.alt,
    base: `/images/${outBase}`,
    widths,
    blurDataURL: `data:image/webp;base64,${blur.toString("base64")}`
  });
  console.log("processed", item.out);
}

await writeFile(join(outRoot, "manifest.json"), JSON.stringify(manifest, null, 2));
console.log(`done: ${manifest.length} images`);
```

- [ ] **Step 3: Run the pipeline**

Run: `npm run images`
Expected: webp files written under `public/images/<category>/`, plus `public/images/manifest.json`. Verify a couple open and are correctly oriented (not sideways).

- [ ] **Step 4: Commit (processed assets + scripts, NOT raw originals)**

```bash
git add scripts/process-images.mjs scripts/curated-images.json public/images
git commit -m "feat: add image pipeline and curated web-optimized club photos"
```

---

## Task 6: Real homepage + founder content modules

**Files:**
- Create: `src/lib/content/home.ts`, `src/lib/content/founder.ts`
- Modify: `src/lib/site-data.ts` (strip meta copy)

- [ ] **Step 1: Create `src/lib/content/founder.ts`**

Port from `Dr Emamifar - Bio for Astra United FC.docx`. Define and export:
```ts
export const founder = {
  name: "Dr Alireza Emamifar",
  role: "Founder & Technical Director",
  titles: [
    "Ph.D. in Sport Management",
    "AFC-certified Football Federation Instructor",
    "Former Iranian National Team player"
  ],
  pullQuote: "We don't just coach players. We mentor the next generation of community leaders.",
  summary:
    "A former Iranian National Team midfielder and four-time league champion with Persepolis FC, Dr Emamifar brings three decades of elite playing, coaching, and academic experience to Melbourne's north. He founded Astra United so every young player has access to professional-standard coaching, a safe environment, and a clear pathway to their potential.",
  story: [
    "Dr Emamifar's journey began at the highest tier of Asian and European football — a midfielder and left winger for the Iranian National Team (20 caps), a cornerstone of Persepolis FC with four league titles and a Hazfi Cup, and a spell in the Belgian First Division with R. Charleroi S.C.",
    "Transitioning from pitch to dugout, he served as Assistant Coach for the Iran National U23 team and in technical roles at Persepolis FC, Naft Tehran, and Sepidrood. Today he is Assistant Coach at Manningham United Blues FC while leading Astra United.",
    "He holds a Ph.D. in Sport Management and advanced AFC credentials (ACSP, ACFAM), and leads research on elite women's football at WomenSportPress — bridging modern sports governance with grassroots development."
  ],
  honours: [
    "20 caps — Iranian National Team",
    "4× Iranian league titles — Persepolis FC",
    "Hazfi Cup winner",
    "2026 Persian Awards Night — community achievement"
  ]
} as const;
```

- [ ] **Step 2: Create `src/lib/content/home.ts`**

Port real copy from `Home.docx`. Export structured objects (no meta/"Phase 2" language):
```ts
export const heroContent = {
  status: "All Astra pitches are currently OPEN for training and match days.",
  kicker: "Est. Melbourne's North · Academy & Senior",
  headline: "The home of community & player development.",
  lead:
    "Professional coaching, a safe environment, and a clear pathway from grassroots football to senior squads at Darebin International Sports Centre.",
  primaryCta: { label: "Register for 2026", href: "/join-us" },
  secondaryCta: { label: "View match-day fixtures", href: "/teams" }
};

export const welcome = {
  eyebrow: "Welcome",
  title: "Excellence in local football and player development.",
  copy:
    "Astra United FC is a growing, community-focused club where talent is nurtured from the grassroots up. Whether you are looking for a Youth Academy with qualified coaching or competitive senior football, Astra offers a pathway for every player — proudly embracing Melbourne's multicultural football culture."
};

export const whyAstra = [
  "Qualified and experienced coaches",
  "Safe and inclusive environment",
  "Structured development pathway",
  "Clear pathway from Youth Academy to senior football",
  "Professional training environment at Darebin International Sports Centre",
  "Multicultural community focus"
];
```

- [ ] **Step 3: Strip meta copy from `src/lib/site-data.ts`**

Remove the `newsPreview`, `upcomingMoments` "consultancy/Phase 2" strings and any "scaffold/Wix/ready for" phrasing. Keep `navItems`, `homeHighlights` (reword to real differentiators), `academyPathway`, `quickFacts`, `contactMethods`, types, and `getPageBySlug`. Rewrite each `MarketingPage` intro/section to real club voice (no "prepared for"/"ready for future" language). For values not yet supplied (fees, names), use honest copy like "Membership fees for the 2026 season will be confirmed here — contact us for current pricing."

- [ ] **Step 4: Typecheck**

Run: `npm run typecheck`
Expected: passes (fix any import/type drift).

- [ ] **Step 5: Commit**

```bash
git add src/lib/content/home.ts src/lib/content/founder.ts src/lib/site-data.ts
git commit -m "feat: add real homepage and founder content, remove placeholder copy"
```

---

## Task 7: HeroMedia boundary component

**Files:**
- Create: `src/components/HeroMedia.tsx`

- [ ] **Step 1: Implement `src/components/HeroMedia.tsx`**

```tsx
"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export type HeroSource =
  | { kind: "image"; src: string; alt: string; blurDataURL?: string }
  | { kind: "crossfade"; images: { src: string; alt: string; blurDataURL?: string }[]; intervalMs: number }
  | { kind: "video"; src: string; poster: string }
  | { kind: "frames"; framePattern: string; frameCount: number; poster: string };

/**
 * Single boundary for hero background media. Swap `source` to upgrade to the
 * team's motion frames later with no other changes.
 */
export function HeroMedia({ source }: { source: HeroSource }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (source.kind !== "crossfade") return;
    const id = setInterval(
      () => setIndex((i) => (i + 1) % source.images.length),
      source.intervalMs
    );
    return () => clearInterval(id);
  }, [source]);

  if (source.kind === "video") {
    return (
      <video
        className="absolute inset-0 -z-20 h-full w-full object-cover"
        src={source.src}
        poster={source.poster}
        autoPlay
        muted
        loop
        playsInline
        aria-hidden="true"
      />
    );
  }

  if (source.kind === "crossfade") {
    return (
      <div className="absolute inset-0 -z-20" aria-hidden="true">
        {source.images.map((img, i) => (
          <Image
            key={img.src}
            src={img.src}
            alt=""
            fill
            priority={i === 0}
            placeholder={img.blurDataURL ? "blur" : "empty"}
            blurDataURL={img.blurDataURL}
            sizes="100vw"
            className={`object-cover transition-opacity duration-1000 ${i === index ? "opacity-100" : "opacity-0"}`}
          />
        ))}
      </div>
    );
  }

  if (source.kind === "frames") {
    // Round 1: render the poster. Round 3 swaps in the canvas scrubber.
    return (
      <Image
        src={source.poster}
        alt=""
        fill
        priority
        aria-hidden="true"
        sizes="100vw"
        className="-z-20 object-cover"
      />
    );
  }

  return (
    <Image
      src={source.src}
      alt={source.alt}
      fill
      priority
      placeholder={source.blurDataURL ? "blur" : "empty"}
      blurDataURL={source.blurDataURL}
      sizes="100vw"
      className="-z-20 object-cover"
    />
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: passes.

- [ ] **Step 3: Commit**

```bash
git add src/components/HeroMedia.tsx
git commit -m "feat: add HeroMedia boundary (image/crossfade/video/frames)"
```

---

## Task 8: Rebuild the hero (HeroIntro)

**Files:**
- Modify: `src/components/HeroIntro.tsx`

- [ ] **Step 1: Rewrite `HeroIntro` to use real content + HeroMedia + pitch-status pill + stat rail**

Use `heroContent` from `src/lib/content/home.ts`, render `<HeroMedia source={...}/>` (default to a `crossfade` of 2–3 processed photos from `public/images`, or `image` if only one chosen), keep the framer-motion entrance, add:
- the green **pitch-status pill** (`heroContent.status`),
- the **kicker** + **headline** (`crest-type`, athletic) + **lead**,
- the two **CTAs** (`primaryCta`/`secondaryCta`),
- a compact **stat rail** (U6–Snr / 2× wk / DISC),
- keep the existing crest treatment OR replace with the stat rail (choose crest on `lg` for balance).

Keep `data-hero-handoff-ball` so the Touchline can start at the hero handoff. Maintain `min-h-[100svh]`, overlay gradients, and reduced-motion friendliness. Remove the "Real club imagery… Phase 2" caption entirely.

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: passes.

- [ ] **Step 3: Visual verify on mirror**

Copy changed files to mirror, `npm run build`, start preview on `:3002`, open `http://127.0.0.1:3002/`. Confirm: athletic headline, pill visible, real photo background (correct orientation), CTAs work, no layout shift.

- [ ] **Step 4: Commit**

```bash
git add src/components/HeroIntro.tsx
git commit -m "feat: rebuild hero with real content, media boundary, and pitch status"
```

---

## Task 9: Rebuild the Touchline scroll-ball

**Files:**
- Create: `src/components/Touchline.tsx`
- Modify: `app/globals.css` (calmer chrome), `app/page.tsx` (swap component + tag nodes)

- [ ] **Step 1: Implement `src/components/Touchline.tsx`**

Build a client component that:
- Wraps `children` in a relative container (`id="club-flow"`).
- On mount (and resize), reads all `[data-touchline-node]` elements, computes their viewport-relative center x and document y → `Node[]`, builds the master polyline via `buildPolyline` (Task 2). Recompute only on resize/layout, never per scroll event.
- Initializes Lenis (reuse current options) and runs a single rAF loop: each tick reads `lenis.scroll` (or `window.scrollY`), computes `progress = scrollToProgress(scroll, start, end)` over the container's scroll span, gets `pointAtProgress(polyline, progress)`, converts document-y to viewport-y, and sets framer-motion values `ballX/ballY` (lightly spring-smoothed) + rotation via accumulated `rollDelta` over distance moved.
- Renders the SVG master path (faint white base + thin gold progress via `pathLength`) and the ball + a soft 2-sample trail. All `aria-hidden`.
- For each `[data-touchline-react]`, compute distance from the ball point and set `--touchline-react` (0–1) for the CSS lift/rim-light. No perimeter tracing.
- Reduced motion: render nothing dynamic; pin ball hidden; children render normally.

Keep the file focused; import helpers from `src/lib/touchline/*`. Do **not** reintroduce the minute/km/possession HUD.

- [ ] **Step 2: Add `data-touchline-node` / `data-touchline-react` + swap component in `app/page.tsx`**

Replace `<ScrollBallFlow>` with `<Touchline>`. Tag each major section wrapper with `data-touchline-node` (anchor points down the page) and each reacting card with `data-touchline-react` (replacing the old `data-flow-item`/`data-flow-group` where appropriate).

- [ ] **Step 3: Calm the chrome in `app/globals.css`**

Remove or hide `.flow-hud*`, `.flow-side-note*`, `.flow-side-mark*` (the busy HUD). Keep a single faint side spine if desired. Add `.touchline-react` styles: subtle `translateY(-4px)` + gold rim-light scaled by `--touchline-react`.

- [ ] **Step 4: Typecheck + unit tests still green**

Run: `npm run typecheck` then `npm test`
Expected: typecheck passes; all path/progress tests pass.

- [ ] **Step 5: Visual verify smoothness on mirror**

Build on mirror, preview on `:3002`, scroll slowly and fast. Confirm: the ball flows along ONE continuous path, no snapping/teleporting, roll matches motion, cards lift as it passes, reduced-motion (OS setting) shows a static page.

- [ ] **Step 6: Commit**

```bash
git add src/components/Touchline.tsx app/page.tsx app/globals.css
git commit -m "feat: rebuild touchline as one smooth continuous master path"
```

---

## Task 10: Founder feature + homepage assembly

**Files:**
- Create: `src/components/FounderFeature.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Implement `src/components/FounderFeature.tsx`**

Render `founder` (Task 6): a dark cinematic band — portrait (a processed `community`/`ground` photo as placeholder until a real portrait is supplied), name + role, titles row, the large pull-quote, condensed summary, honours as a stat row, and a link to the full bio (`/the-club/founder` — full page lands in Round 2; for now link to `/the-club`). `data-touchline-react` on the card.

- [ ] **Step 2: Wire real content into `app/page.tsx`**

Replace placeholder sections with: `welcome` copy, `whyAstra` differentiators, `academyPathway` (real), `<FounderFeature/>`, real Teams/News/Sponsors/Contact teasers. Remove every remaining meta string ("Wix replacement", "admin scaffold", "Phase 2", "consultancy calendar"). Use processed photos from `public/images` via `next/image`.

- [ ] **Step 3: Typecheck + grep for leftover meta copy**

Run: `npm run typecheck`
Then: search the repo for banned phrases and expect **no matches** in `app/` or `src/`:
```
Wix replacement | Phase 2 | admin scaffold | consultancy | ready for future | prepared for
```

- [ ] **Step 4: Visual verify full homepage on mirror**

Build + preview. Confirm the whole page reads as a real club: cinematic hero, smooth ball, founder feature, real photos, no demo language.

- [ ] **Step 5: Commit**

```bash
git add src/components/FounderFeature.tsx app/page.tsx
git commit -m "feat: add founder feature and assemble real-content homepage"
```

---

## Task 11: Remove dead code + final verification + ship

**Files:**
- Delete: `src/components/ScrollBallFlow.tsx`
- Verify: full build on mirror

- [ ] **Step 1: Confirm `ScrollBallFlow` is unused**

Search imports of `ScrollBallFlow` → expect none. Delete `src/components/ScrollBallFlow.tsx`. Remove `FlowReveal`/`GroundPanel` only if now unused (check first; keep if still referenced).

- [ ] **Step 2: Full typecheck + tests + production build on mirror**

Run from `S:` root: `npm run typecheck` && `npm test` → both pass.
Copy full tree to mirror; `cd C:\tmp\astra-united-vercel-check-fresh; npm run build` → Expected: build succeeds, no errors/warnings about missing modules.

- [ ] **Step 3: Preview + final smoke test**

Start preview on `:3002`; click every nav link, test CTAs, scroll the full page (smooth ball), toggle OS reduced-motion. Confirm Lighthouse-ish basics (no console errors, images lazy/optimized).

- [ ] **Step 4: Commit deletion + push to deploy**

```bash
git add -A
git commit -m "chore: remove legacy ScrollBallFlow after touchline rebuild"
git push personal main
```
Then verify the Vercel git deploy goes Ready and `https://astra-united.vercel.app` shows the new homepage.

---

## Self-Review notes (coverage vs spec)

- Art direction (§4) → Tasks 4,8,9,10 (type, hero, motion, assembly).
- Design system (§5) → Task 4 (fonts), Task 9 (calmer chrome), Task 5 (image treatment via webp + film overlay in CSS).
- Touchline rebuild (§8) → Tasks 2,3,9 (tested math + one master path, no HUD).
- HeroMedia / frames (§9) → Task 7 (frames mode = poster in R1; canvas scrub deferred to R3 per spec phasing).
- Real content + founder (§10) → Tasks 6,8,10.
- Asset pipeline (§11) → Task 5 (auto-orient + resize + blur placeholder).
- A11y/perf (§12) → reduced-motion in Task 9, next/font Task 4, next/image throughout.
- Phasing (§13): this plan = Round 1. Inner-page content = Round 2 (separate plan). Video loops + frame scrubber + gallery = Round 3.

**Deferred to later rounds (intentional, per spec):** inner-page real content, full `/the-club/founder` page, gallery, video encoding, canvas frame-scrubber. Not gaps.
