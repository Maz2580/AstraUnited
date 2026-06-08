# Astra Homepage "$10k" Polish & Ball Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Lift the live homepage to a "$10k" feel by going dark/cinematic end-to-end, replacing the ball with a refined Lucide line ball on a contained left side-rail with fixed motion, upgrading cards/sections, wiring real content, and fixing the favicon.

**Architecture:** Next.js 14 App Router. Pure path geometry lives in `src/lib/touchline/` (unit-tested with vitest). The scroll ball + chalk touchline are owned by the client component `Touchline.tsx`, which drives a Lenis rAF loop. Homepage composition is `app/page.tsx` using `FlowReveal`/`PopCard` wrappers and a shared `SectionHeader`. Theme is Tailwind tokens + a few global utility classes.

**Tech Stack:** TypeScript, React 18, Tailwind, framer-motion, Lenis, next/image, next/font, lucide-react, vitest.

**Spec:** `docs/superpowers/specs/2026-06-08-astra-homepage-wow-polish-design.md`

**Branch:** `homepage-wow-polish` (already created, spec committed). Author commits as personal `mazdak.gh1995@gmail.com`. **No `Co-Authored-By` trailer.**

**Build note:** `next build` fails on the `S:` drive. Unit tests + typecheck run fine on `S:`. Visual/build verification is via Vercel cloud preview (push branch to `personal`) or the C-mirror `C:\tmp\astra-united-vercel-check-fresh`.

---

## File Structure

- `src/lib/touchline/path.ts` — add pure `railNodes()` generator (the side-rail geometry decision, isolated + tested).
- `src/lib/touchline/path.test.ts` — tests for `railNodes()`.
- `src/components/SoccerBall.tsx` — replace star-emblem SVG with the Lucide line ball; add `stroke`/`strokeWidth` props.
- `src/components/Touchline.tsx` — use `railNodes`, track arc-length progress directly (kill corner-cutting), render chalk touchline, smaller ball.
- `src/components/HeroIntro.tsx` — colour the hero-handoff ball gold.
- `app/globals.css` — dark body background + `.band-fog`, `.card-dark`, `.marquee-track` utilities.
- `src/components/BrandMarquee.tsx` — NEW red "TRAIN / COMPETE / REPEAT" marquee.
- `app/page.tsx` — convert all bands to dark, image-forward academy cards, trial pillars, insert marquee.
- `src/components/SiteFooter.tsx` — real email + socials.
- `src/lib/site-data.ts` — `socialLinks` + `clubContact` data.
- `app/icon.png` — favicon (copied from the crest) — fixes the live 404.

---

## Task 1: Side-rail geometry helper (`railNodes`)

**Files:**
- Modify: `src/lib/touchline/path.ts`
- Test: `src/lib/touchline/path.test.ts`

- [ ] **Step 1: Write the failing test**

Add to `src/lib/touchline/path.test.ts` (keep existing imports/tests; add `railNodes` to the import from `./path`):

```ts
import { railNodes } from "./path";

describe("railNodes", () => {
  it("returns the requested number of nodes", () => {
    expect(railNodes(5, 1000, 56, 16)).toHaveLength(5);
  });

  it("keeps every node x within the rail band [railX-wave, railX+wave]", () => {
    const nodes = railNodes(6, 1200, 56, 16);
    for (const n of nodes) {
      expect(n.x).toBeGreaterThanOrEqual(56 - 16);
      expect(n.x).toBeLessThanOrEqual(56 + 16);
    }
  });

  it("spans from 0 to cHeight on the y axis, ascending", () => {
    const nodes = railNodes(4, 900, 56, 16);
    expect(nodes[0].y).toBe(0);
    expect(nodes[nodes.length - 1].y).toBe(900);
    for (let i = 1; i < nodes.length; i += 1) {
      expect(nodes[i].y).toBeGreaterThan(nodes[i - 1].y);
    }
  });

  it("falls back to 2 nodes when count < 2", () => {
    expect(railNodes(1, 800, 56, 16)).toHaveLength(2);
    expect(railNodes(0, 800, 56, 16)).toHaveLength(2);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/touchline/path.test.ts`
Expected: FAIL — `railNodes is not a function` / not exported.

- [ ] **Step 3: Write minimal implementation**

Append to `src/lib/touchline/path.ts`:

```ts
/**
 * Nodes for the side-rail touchline: evenly spaced down the page in y, with x
 * gently alternating inside a narrow band around `railX` so the ball weaves
 * softly but never leaves the left gutter.
 */
export function railNodes(
  count: number,
  cHeight: number,
  railX: number,
  wave: number
): Node[] {
  const n = Math.max(2, Math.floor(count));
  const nodes: Node[] = [];
  for (let i = 0; i < n; i += 1) {
    const y = (i / (n - 1)) * cHeight;
    const x = railX + (i % 2 === 0 ? -wave : wave);
    nodes.push({ x, y });
  }
  return nodes;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/lib/touchline/path.test.ts`
Expected: PASS (existing `buildPolyline`/`pointAtProgress`/`toSvgPath` tests stay green).

- [ ] **Step 5: Commit**

```bash
git add src/lib/touchline/path.ts src/lib/touchline/path.test.ts
git commit -m "feat: add railNodes side-rail geometry helper"
```

---

## Task 2: Refined Lucide line ball (`SoccerBall.tsx`)

**Files:**
- Modify: `src/components/SoccerBall.tsx` (full replace)
- Modify: `src/components/HeroIntro.tsx:188-202` (handoff ball wrapper colour)

- [ ] **Step 1: Replace the ball SVG**

Replace the entire contents of `src/components/SoccerBall.tsx` with:

```tsx
type SoccerBallProps = {
  className?: string;
  label?: string;
  /** Stroke colour for the line ball. Defaults to currentColor so the parent text colour drives it. */
  stroke?: string;
  strokeWidth?: number;
};

/**
 * Refined line football based on Lucide lab "soccer-ball" (ISC). Stroke-only so
 * it reads as a clean designer mark and recolours via `stroke`/text colour.
 */
export function SoccerBall({
  className = "",
  label = "Astra football",
  stroke = "currentColor",
  strokeWidth = 1.6
}: SoccerBallProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      role="img"
      aria-label={label}
      fill="none"
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M11.9 6.7s-3 1.3-5 3.6c0 0 0 3.6 1.9 5.9 0 0 3.1.7 6.2 0 0 0 1.9-2.3 1.9-5.9 0 .1-2-2.3-5-3.6" />
      <path d="M11.9 6.7V2" />
      <path d="M16.9 10.4s3-1.4 4.5-1.6" />
      <path d="M15 16.3s1.9 2.7 2.9 3.7" />
      <path d="M8.8 16.3S6.9 19 6 20" />
      <path d="M2.6 8.7C4 9 7 10.4 7 10.4" />
    </svg>
  );
}
```

- [ ] **Step 2: Colour the hero handoff ball gold**

In `src/components/HeroIntro.tsx`, the handoff `motion.div` (around line 188) currently has `className="pointer-events-none absolute z-[5] h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24"`. Add `text-astra-gold` so the line ball inherits gold:

```tsx
        className="pointer-events-none absolute z-[5] h-16 w-16 text-astra-gold sm:h-20 sm:w-20 lg:h-24 lg:w-24"
```

(The `<SoccerBall className="h-full w-full" ... />` inside it needs no change — it uses `currentColor`.)

- [ ] **Step 3: Typecheck**

Run: `npm run typecheck`
Expected: PASS (no type errors; `SoccerBall` call-sites still valid).

- [ ] **Step 4: Commit**

```bash
git add src/components/SoccerBall.tsx src/components/HeroIntro.tsx
git commit -m "feat: replace ball with refined Lucide line ball"
```

---

## Task 3: Rebuild the touchline motion (`Touchline.tsx`)

**Files:**
- Modify: `src/components/Touchline.tsx` (full replace)

- [ ] **Step 1: Replace the component**

Replace the entire contents of `src/components/Touchline.tsx` with the following. Changes vs current: imports `railNodes`; ball is smaller (48px); nodes come from `railNodes` in the left gutter; positional smoothing is light (`LERP 0.4`) so it tracks the path instead of cutting corners; base path renders as a dashed chalk-white touchline, the revealed portion gold; ball wrapper is white with a gold ring.

```tsx
"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import Lenis from "lenis";
import { SoccerBall } from "@/src/components/SoccerBall";
import {
  buildPolyline,
  pointAtProgress,
  polylineLength,
  railNodes,
  toSvgPath,
  type Point
} from "@/src/lib/touchline/path";
import { rollDelta, scrollToProgress } from "@/src/lib/touchline/progress";

type TouchlineProps = {
  children: ReactNode;
};

const BALL_SIZE = 48; // rendered ball size in px
const BALL_RADIUS = BALL_SIZE / 2;
const LERP = 0.4; // light smoothing — tracks the path, does not cut corners
const REACT_RADIUS = 320;

type ReactCard = {
  el: HTMLElement;
  cx: number;
  cy: number;
};

function useReducedMotionPreference() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(query.matches);
    const listener = (event: MediaQueryListEvent) => setReduced(event.matches);
    query.addEventListener("change", listener);
    return () => query.removeEventListener("change", listener);
  }, []);

  return reduced;
}

export function Touchline({ children }: TouchlineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const basePathRef = useRef<SVGPathElement>(null);
  const progressPathRef = useRef<SVGPathElement>(null);
  const ballRef = useRef<HTMLDivElement>(null);

  const polyRef = useRef<Point[]>([]);
  const pathLenRef = useRef(0);
  const cHeightRef = useRef(0);
  const cTopDocRef = useRef(0);
  const reactCardsRef = useRef<ReactCard[]>([]);

  const currentXRef = useRef(0);
  const currentYRef = useRef(0);
  const prevXRef = useRef(0);
  const prevYRef = useRef(0);
  const rotationRef = useRef(0);
  const hasInitialisedRef = useRef(false);

  const reducedMotion = useReducedMotionPreference();

  useEffect(() => {
    if (reducedMotion) {
      return;
    }

    const container = containerRef.current;
    if (!container) {
      return;
    }

    const previousScrollRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";

    if (!window.location.hash && window.scrollY > 0) {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }

    const measure = () => {
      const cRect = container.getBoundingClientRect();
      const cRectTopDoc = cRect.top + window.scrollY;
      const cWidth = container.clientWidth;
      const cHeight = container.scrollHeight;

      cTopDocRef.current = cRectTopDoc;
      cHeightRef.current = cHeight;

      // Side-rail geometry — ball lives in the left gutter, never over content.
      const railX = Math.min(Math.max(44, cWidth * 0.07), 84);
      const wave = Math.min(18, railX - 28);
      const nodeCount = Math.max(
        2,
        container.querySelectorAll("[data-touchline-node]").length
      );

      const nodes = railNodes(nodeCount, cHeight, railX, wave);
      const poly = buildPolyline(nodes, 24);
      polyRef.current = poly;
      pathLenRef.current = polylineLength(poly);

      const cardEls = Array.from(
        container.querySelectorAll<HTMLElement>("[data-touchline-react]")
      );
      reactCardsRef.current = cardEls.map((el) => {
        const r = el.getBoundingClientRect();
        return {
          el,
          cx: r.left + window.scrollX - (cRect.left + window.scrollX) + r.width / 2,
          cy: r.top + window.scrollY + r.height / 2 - cRectTopDoc
        };
      });

      const d = toSvgPath(poly);
      svgRef.current?.setAttribute("viewBox", `0 0 ${cWidth} ${cHeight}`);
      basePathRef.current?.setAttribute("d", d);
      progressPathRef.current?.setAttribute("d", d);
      if (progressPathRef.current) {
        const len = pathLenRef.current;
        progressPathRef.current.style.strokeDasharray = `${len}`;
        progressPathRef.current.style.strokeDashoffset = `${len}`;
      }
    };

    measure();

    const lenis = new Lenis({
      duration: 1.08,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true
    });

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);

      const poly = polyRef.current;
      if (poly.length > 0) {
        const cTopDoc = cTopDocRef.current;
        const cHeight = cHeightRef.current;
        const scroll = window.scrollY;
        const start = cTopDoc - window.innerHeight * 0.5;
        const end = cTopDoc + cHeight - window.innerHeight * 0.5;
        const progress = scrollToProgress(scroll, start, end);

        const target = pointAtProgress(poly, progress);

        if (!hasInitialisedRef.current) {
          currentXRef.current = target.x;
          currentYRef.current = target.y;
          prevXRef.current = target.x;
          prevYRef.current = target.y;
          hasInitialisedRef.current = true;
        } else {
          currentXRef.current += (target.x - currentXRef.current) * LERP;
          currentYRef.current += (target.y - currentYRef.current) * LERP;
        }

        const cx = currentXRef.current;
        const cy = currentYRef.current;

        const dist = Math.hypot(cx - prevXRef.current, cy - prevYRef.current);
        rotationRef.current += rollDelta(dist, BALL_RADIUS);
        prevXRef.current = cx;
        prevYRef.current = cy;

        if (ballRef.current) {
          ballRef.current.style.transform = `translate3d(${cx}px, ${cy}px, 0) translate(-50%, -50%) rotate(${rotationRef.current}deg)`;
        }

        if (progressPathRef.current) {
          progressPathRef.current.style.strokeDashoffset = `${
            pathLenRef.current * (1 - progress)
          }`;
        }

        const cards = reactCardsRef.current;
        for (let i = 0; i < cards.length; i += 1) {
          const card = cards[i];
          const d = Math.hypot(card.cx - cx, card.cy - cy);
          const react = Math.max(0, 1 - d / REACT_RADIUS);
          card.el.style.setProperty("--touchline-react", react.toFixed(3));
        }
      }

      frame = requestAnimationFrame(raf);
    };

    frame = requestAnimationFrame(raf);

    const resizeObserver = new ResizeObserver(() => measure());
    resizeObserver.observe(container);
    window.addEventListener("resize", measure);

    const settleTimer = window.setTimeout(measure, 400);
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => measure()).catch(() => {});
    }

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      window.removeEventListener("resize", measure);
      window.clearTimeout(settleTimer);
      lenis.destroy();
      window.history.scrollRestoration = previousScrollRestoration;
    };
  }, [reducedMotion]);

  return (
    <div ref={containerRef} id="club-flow" className="relative isolate bg-astra-ink">
      {!reducedMotion && (
        <>
          <svg
            ref={svgRef}
            viewBox="0 0 1000 1000"
            preserveAspectRatio="none"
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0 h-full w-full"
          >
            <path
              ref={basePathRef}
              d="M 0 0"
              fill="none"
              stroke="#f8fbfd"
              strokeOpacity="0.28"
              strokeWidth="2"
              strokeDasharray="2 9"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              ref={progressPathRef}
              d="M 0 0"
              fill="none"
              stroke="#f2c94c"
              strokeOpacity="0.9"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div
            ref={ballRef}
            aria-hidden="true"
            className="pointer-events-none absolute left-0 top-0 z-10 text-white drop-shadow-[0_6px_14px_rgba(0,0,0,0.55)]"
            style={{ width: BALL_SIZE, height: BALL_SIZE, willChange: "transform" }}
          >
            <span className="absolute inset-[-5px] rounded-full border border-astra-gold/50" />
            <SoccerBall className="h-full w-full" strokeWidth={1.4} />
          </div>
        </>
      )}
      <div className="relative z-[1]">{children}</div>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 3: Run touchline unit tests (no regressions)**

Run: `npx vitest run src/lib/touchline/`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/components/Touchline.tsx
git commit -m "feat: rebuild touchline as a contained left side-rail with chalk line"
```

---

## Task 4: Dark theme utilities (`globals.css`)

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: Make the page background dark**

In `app/globals.css`, change the `body` background from white to ink (so there are no white flashes between dark sections):

Find:
```css
body {
  margin: 0;
  min-height: 100vh;
  color: var(--astra-ink);
  background: var(--astra-white);
  font-family: var(--font-sans), Arial, sans-serif;
  text-rendering: optimizeLegibility;
}
```
Replace the two changed lines so it reads:
```css
body {
  margin: 0;
  min-height: 100vh;
  color: var(--astra-white);
  background: var(--astra-ink);
  font-family: var(--font-sans), Arial, sans-serif;
  text-rendering: optimizeLegibility;
}
```

- [ ] **Step 2: Add band, card, and marquee utilities**

Append to the end of `app/globals.css`:

```css
/* --- Dark "$10k" theme utilities --- */
.band-deep {
  background: var(--astra-ink);
}

.band-fog {
  background: linear-gradient(180deg, #0b1a28 0%, #0e2233 100%);
}

.card-dark {
  border: 1px solid rgba(248, 251, 253, 0.1);
  border-radius: 8px;
  background: rgba(248, 251, 253, 0.04);
  backdrop-filter: blur(6px);
  box-shadow: 0 18px 46px rgba(0, 0, 0, 0.28);
}

/* Red brand marquee — TRAIN / COMPETE / REPEAT */
.marquee {
  overflow: hidden;
  background: var(--astra-red);
}

.marquee-track {
  display: inline-flex;
  white-space: nowrap;
  will-change: transform;
  animation: marquee-scroll 22s linear infinite;
}

@keyframes marquee-scroll {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-50%);
  }
}
```

(The existing `@media (prefers-reduced-motion: reduce)` block at the bottom already freezes animations, so the marquee stops for reduced-motion users — no extra work.)

- [ ] **Step 3: Commit**

```bash
git add app/globals.css
git commit -m "feat: dark theme utilities (band-fog, card-dark, marquee)"
```

---

## Task 5: Brand marquee component (`BrandMarquee.tsx`)

**Files:**
- Create: `src/components/BrandMarquee.tsx`

- [ ] **Step 1: Create the component**

Create `src/components/BrandMarquee.tsx`:

```tsx
const PHRASE = ["Train", "Compete", "Repeat"];

/**
 * Full-bleed red marquee echoing the official brand ("TRAIN / COMPETE / REPEAT").
 * Decorative; the track is duplicated so the -50% scroll loops seamlessly.
 */
export function BrandMarquee() {
  const items = Array.from({ length: 6 }).flatMap(() => PHRASE);
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track py-3 text-sm font-black uppercase tracking-[0.2em] text-white sm:text-base">
        {[0, 1].map((dup) => (
          <span key={dup} className="flex shrink-0">
            {items.map((word, i) => (
              <span key={`${dup}-${i}`} className="flex items-center">
                {word}
                <span className="px-4 text-astra-gold">/</span>
              </span>
            ))}
          </span>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Insert it under the hero in `app/page.tsx`**

In `app/page.tsx`, add the import near the other component imports:

```tsx
import { BrandMarquee } from "@/src/components/BrandMarquee";
```

Then place it between `<HeroIntro />` and `<Touchline>`:

```tsx
      <HeroIntro />
      <BrandMarquee />
      <Touchline>
```

- [ ] **Step 3: Typecheck**

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/components/BrandMarquee.tsx app/page.tsx
git commit -m "feat: add brand marquee under the hero"
```

---

## Task 6: Dark homepage redesign (`app/page.tsx`)

Convert every body band to the dark theme, make the academy cards image-forward, add the four trial pillars, and use `inverse` section headers throughout. This task replaces the eight `FlowReveal` sections inside `<Touchline>`.

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Update the in-file data (academy images + trial pillars)**

In `app/page.tsx`, replace the `sponsorTiers` const block with the following (keeps `sponsorTiers`, adds `academyCards` and `trialPillars`). The academy image bases/blurs are copied verbatim from `public/images/manifest.json`:

```tsx
const sponsorTiers = [
  {
    title: "Principal Club Partner",
    copy: "Lead the club's identity with naming presence across kit, ground signage, and digital."
  },
  {
    title: "Match & training kit",
    copy: "Main kit, training wear, and match-ball partnerships seen every game day and session."
  },
  {
    title: "Community supporter",
    copy: "Pitch-side and player-pathway packages for local businesses backing youth football."
  }
];

// Image-forward academy cards (photos from public/images/manifest.json).
const academyCards = [
  {
    age: "U6-U8",
    title: "Mini-Kickers",
    copy: "Fun-based football foundations, confidence on the ball, and first friendships in the game.",
    src: "/images/camps/astra-camps-academy-session-1280.webp",
    alt: "Astra United Academy holiday camp session with youth players gathering their gear at the Darebin ground",
    blurDataURL:
      "data:image/webp;base64,UklGRrYAAABXRUJQVlA4IKoAAADwAwCdASoQABwAPu1iqU2ppaOiMAgBMB2JQBjegmeud9OrP/0R/LoAAN0DZnfFFhi/6X9EO9mJf2YxXYs4roqjpnWn7F9w4owXdrAOILJKdx2GpYLp4bl6nGqMStxSJvbpZ4PqWAtvljqXvED7ynXaniyrLGoEZGS1zVxQgYuA7fTCPkUYk0pdIXaNVvG1J5eGNA0tXNroyv/ua7ViyH5rbA8qGh8ivFfAAA="
  },
  {
    age: "U9-U12",
    title: "Junior Academy",
    copy: "Small-sided training, technical repetition, and age-appropriate tactical awareness.",
    src: "/images/academy/astra-academy-dribble-duel-1280.webp",
    alt: "Astra United youth player in navy kit dribbling past a defender during an academy training session at Darebin",
    blurDataURL:
      "data:image/webp;base64,UklGRkwAAABXRUJQVlA4IEAAAADQAQCdASoQAAsAA4BaJYgAAv+5vRNYAAD+voAKXwDNy2IhEEynnmVSeUn0lKdwz3awb6C8nEReoy/qU7ZZOAAA"
  },
  {
    age: "U13-U18",
    title: "Youth Development",
    copy: "A stronger bridge to 11-a-side football, game intelligence, and senior progression.",
    src: "/images/match/astra-match-aerial-control-1280.webp",
    alt: "Astra United player demonstrating aerial ball control on the touchline at the Darebin Sports and Ice Centre",
    blurDataURL:
      "data:image/webp;base64,UklGRnIAAABXRUJQVlA4IGYAAABwAwCdASoQABgAPu1iqU2ppaOiMAgBMB2JQAALy3lD0RzM42AA/sNBPUfSWcutepFcBy6yiESNMgjHMmx/olDKBxr2bDH2YhCb4AXi7l2BRzW9s9iQ/QnXwZdaLwxCaZ4RRD4YwAA="
  }
];

// The four assessment pillars (from Join Us / Trials content).
const trialPillars = [
  { label: "Technical", copy: "Ball control and passing range." },
  { label: "Tactical", copy: "Game understanding and positioning." },
  { label: "Physical", copy: "Speed, agility, and balance." },
  { label: "Character", copy: "Work rate, respect, team-first attitude." }
];
```

- [ ] **Step 2: Replace section 1 (pitch status) — dark**

Replace the section labelled `{/* 1 — Live pitch status + next moment */}` with:

```tsx
        {/* 1 — Live pitch status + next moment */}
        <FlowReveal className="section-band band-fog">
          <div data-touchline-node className="container-wide grid gap-5 md:grid-cols-[1.1fr_0.9fr] md:items-stretch">
            <PopCard className="red-rule card-dark p-6 pl-8 sm:p-8 sm:pl-10">
              <p className="mb-2 text-sm font-black uppercase tracking-normal text-astra-red">Live pitch status</p>
              <h2 className="crest-type text-3xl leading-none text-white">All Astra FC pitches are open.</h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-white/72">
                Training and match-day activity is currently available at Darebin International Sports Centre. Check back on match mornings for any pitch-status changes.
              </p>
            </PopCard>
            <PopCard className="card-dark p-6 sm:p-8" delay={0.06}>
              <div className="flex items-start gap-4">
                <CalendarDays aria-hidden="true" className="mt-1 h-6 w-6 shrink-0 text-astra-gold" />
                <div>
                  <p className="text-sm font-black uppercase tracking-normal text-astra-red">Next campaign moment</p>
                  <h3 className="mt-2 text-2xl font-black text-white">2026 registrations and trials</h3>
                  <p className="mt-3 text-sm leading-6 text-white/72">
                    Registrations are open now for the 2026 season. Trial windows, camps, and awards night details are confirmed below.
                  </p>
                </div>
              </div>
            </PopCard>
          </div>
        </FlowReveal>
```

- [ ] **Step 3: Replace section 2 (welcome / why) — dark**

Replace the section labelled `{/* 2 — Welcome / why Astra */}` with:

```tsx
        {/* 2 — Welcome / why Astra */}
        <FlowReveal className="section-band band-deep">
          <div data-touchline-node className="container-wide grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div>
              <SectionHeader eyebrow={welcome.eyebrow} title={welcome.title} copy={welcome.copy} inverse />
              <PopCard className="card-dark mt-8 overflow-hidden">
                <Image
                  src={photos.welcome.src}
                  alt={photos.welcome.alt}
                  width={1280}
                  height={853}
                  placeholder="blur"
                  blurDataURL={photos.welcome.blurDataURL}
                  className="h-[360px] w-full object-cover"
                  sizes="(min-width: 1024px) 45vw, 100vw"
                />
                <div className="border-t border-white/10 p-5 text-white">
                  <p className="text-xs font-black uppercase tracking-normal text-astra-gold">Academy training</p>
                  <p className="mt-2 text-sm leading-6 text-white/72">Academy training at Darebin International Sports Centre.</p>
                </div>
              </PopCard>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {whyAstra.map((reason, index) => (
                <PopCard key={reason} className="card-dark flex items-start gap-3 p-5" delay={index * 0.04}>
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-astra-red/15">
                    <Check aria-hidden="true" className="h-4 w-4 text-astra-red" />
                  </span>
                  <p className="text-sm font-semibold leading-6 text-white/90">{reason}</p>
                </PopCard>
              ))}
            </div>
          </div>
        </FlowReveal>
```

- [ ] **Step 4: Replace section 3 (academy) — dark + image-forward cards + pillars**

Replace the section labelled `{/* 3 — Academy pathway */}` with:

```tsx
        {/* 3 — Academy pathway */}
        <FlowReveal className="section-band band-fog">
          <div className="container-wide">
            <div data-touchline-node>
              <SectionHeader
                eyebrow="Youth Academy"
                title="Development over results."
                copy="The academy is the heartbeat of Astra United FC: confident players, technical excellence, tactical awareness, and social growth from U6 to U18."
                inverse
              />
            </div>
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {academyCards.map((stage, index) => (
                <PopCard key={stage.age} className="card-dark overflow-hidden" delay={index * 0.06}>
                  <Image
                    src={stage.src}
                    alt={stage.alt}
                    width={1280}
                    height={853}
                    placeholder="blur"
                    blurDataURL={stage.blurDataURL}
                    className="h-44 w-full object-cover"
                    sizes="(min-width: 768px) 33vw, 100vw"
                  />
                  <div className="p-6">
                    <p className="crest-type text-2xl text-astra-gold">{stage.age}</p>
                    <h3 className="mt-2 text-xl font-black text-white">{stage.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-white/72">{stage.copy}</p>
                  </div>
                </PopCard>
              ))}
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {trialPillars.map((pillar, index) => (
                <PopCard key={pillar.label} className="card-dark p-5" delay={index * 0.04}>
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-astra-red">{pillar.label}</p>
                  <p className="mt-2 text-sm leading-6 text-white/72">{pillar.copy}</p>
                </PopCard>
              ))}
            </div>
          </div>
        </FlowReveal>
```

- [ ] **Step 5: Update section 4 (founder) band class**

In the section labelled `{/* 4 — Founder feature */}`, change `className="section-band bg-astra-ink"` to `className="section-band band-deep"` (the `FounderFeature` component is already dark, no other change).

- [ ] **Step 6: Replace section 5 (senior / women's) — dark**

Replace the section labelled `{/* 5 — Senior & Women's teams */}` with:

```tsx
        {/* 5 — Senior & Women's teams */}
        <FlowReveal className="section-band band-fog">
          <div data-touchline-node className="container-wide grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <SectionHeader
                eyebrow="Senior pathway"
                title="Men's, women's, and U23 football."
                copy="The senior program gives emerging players a competitive destination and shows families that the academy has a real long-term pathway."
                inverse
              />
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {["Men's First Team", "Women's First Team", "Under-23s"].map((team, index) => (
                  <PopCard key={team} className="card-dark p-5" delay={index * 0.05}>
                    <Trophy aria-hidden="true" className="mb-4 h-6 w-6 text-astra-gold" />
                    <p className="font-black text-white">{team}</p>
                  </PopCard>
                ))}
              </div>
            </div>
            <PopCard className="card-dark overflow-hidden">
              <Image
                src={photos.womens.src}
                alt={photos.womens.alt}
                width={1280}
                height={1920}
                placeholder="blur"
                blurDataURL={photos.womens.blurDataURL}
                className="h-[460px] w-full object-cover object-[center_22%]"
                sizes="(min-width: 1024px) 45vw, 100vw"
              />
              <div className="border-t border-white/10 p-5 text-white">
                <p className="text-xs font-black uppercase tracking-normal text-astra-gold">Women's First Team</p>
                <p className="mt-2 text-sm leading-6 text-white/72">A growing women's program at Darebin International Sports Centre.</p>
              </div>
            </PopCard>
          </div>
        </FlowReveal>
```

- [ ] **Step 7: Replace section 6 (news & media) — dark**

Replace the section labelled `{/* 6 — News & media */}` with:

```tsx
        {/* 6 — News & media */}
        <FlowReveal className="section-band band-deep">
          <div className="container-wide">
            <div data-touchline-node className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div>
                <SectionHeader
                  eyebrow="News & media"
                  title="From the training ground to the touchline."
                  copy="Match reports, club announcements, events, and highlights from across the Astra community - a content hub for the whole season."
                  inverse
                />
                <div className="mt-8 grid gap-4">
                  {newsPreview.map((item, index) => (
                    <PopCard key={item.title} className="card-dark p-6" delay={index * 0.05}>
                      <p className="text-xs font-black uppercase tracking-normal text-astra-red">{item.kicker}</p>
                      <h3 className="mt-3 text-2xl font-black leading-tight text-white">{item.title}</h3>
                      <p className="mt-3 text-sm leading-6 text-white/72">{item.copy}</p>
                    </PopCard>
                  ))}
                </div>
              </div>
              <PopCard className="card-dark overflow-hidden">
                <Image
                  src={photos.news.src}
                  alt={photos.news.alt}
                  width={1280}
                  height={853}
                  placeholder="blur"
                  blurDataURL={photos.news.blurDataURL}
                  className="h-[300px] w-full object-cover"
                  sizes="(min-width: 1024px) 40vw, 100vw"
                />
                <div className="grid gap-px bg-white/10 sm:grid-cols-3">
                  {upcomingMoments.map((moment) => (
                    <div key={moment.title} className="bg-astra-ink p-4 text-white">
                      <Clock aria-hidden="true" className="mb-3 h-4 w-4 text-astra-gold" />
                      <p className="text-[0.65rem] font-black uppercase tracking-normal text-astra-gold">{moment.meta}</p>
                      <p className="mt-1 text-sm font-black leading-5">{moment.title}</p>
                    </div>
                  ))}
                </div>
              </PopCard>
            </div>
          </div>
        </FlowReveal>
```

- [ ] **Step 8: Update section 7 (sponsors) band class**

In the section labelled `{/* 7 — Sponsors */}`, change `className="section-band bg-astra-ink text-white"` to `className="section-band band-deep text-white"`. Leave the rest (already inverse/dark). Optionally change the tier card class from `rounded border border-white/12 bg-white/6 p-6 backdrop-blur` to `card-dark p-6` for consistency:

```tsx
                <PopCard key={tier.title} className="card-dark p-6" delay={index * 0.05}>
```

- [ ] **Step 9: Replace section 8 (join / contact CTA) — dark**

Replace the section labelled `{/* 8 — Join / contact CTA */}` with:

```tsx
        {/* 8 — Join / contact CTA */}
        <FlowReveal className="section-band band-fog">
          <div data-touchline-node className="container-wide grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <SectionHeader
              eyebrow="Join Astra"
              title="Ready to lace up your boots?"
              copy="Registration is open for the 2026 season. Join as a player, coach, volunteer, or community partner - we train and play at Darebin International Sports Centre."
              inverse
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <PopCard>
                <Link href="/join-us" className="card-dark group block h-full p-6 text-white transition hover:-translate-y-1">
                  <Users aria-hidden="true" className="mb-5 h-7 w-7 text-astra-gold" />
                  <h3 className="text-xl font-black">Register or trial</h3>
                  <p className="mt-3 text-sm leading-6 text-white/72">Player registration, open trials, and development pathway information for the 2026 season.</p>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-black text-astra-red">
                    Start here <ArrowRight aria-hidden="true" className="h-4 w-4 transition group-hover:translate-x-1" />
                  </span>
                </Link>
              </PopCard>
              <PopCard delay={0.08}>
                <Link href="/contact" className="card-dark group block h-full p-6 text-white transition hover:-translate-y-1">
                  <MapPin aria-hidden="true" className="mb-5 h-7 w-7 text-astra-gold" />
                  <h3 className="text-xl font-black">Darebin International Sports Centre</h3>
                  <p className="mt-3 text-sm leading-6 text-white/72">281 Darebin Road, Thornbury VIC 3071. Reach us for registration, sponsorship, volunteering, or media.</p>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-black text-astra-red">
                    Contact the club <ArrowRight aria-hidden="true" className="h-4 w-4 transition group-hover:translate-x-1" />
                  </span>
                </Link>
              </PopCard>
            </div>
          </div>
        </FlowReveal>
```

- [ ] **Step 10: Typecheck**

Run: `npm run typecheck`
Expected: PASS. (The `ShieldCheck`, `ExternalLink`, `Trophy`, `Check`, `CalendarDays`, `Clock`, `Users`, `MapPin`, `ArrowRight` imports are all still used.)

- [ ] **Step 11: Commit**

```bash
git add app/page.tsx
git commit -m "feat: dark cinematic homepage with image-forward cards and trial pillars"
```

---

## Task 7: Real contact + socials in the footer

**Files:**
- Modify: `src/lib/site-data.ts`
- Modify: `src/components/SiteFooter.tsx` (full replace)

- [ ] **Step 1: Add contact + social data**

Append to `src/lib/site-data.ts`:

```ts
export const clubContact = {
  email: "info@astraunitedfootballclub.com",
  ground: "Darebin International Sports Centre",
  address: "281 Darebin Road, Thornbury VIC 3071"
};

export const socialLinks = [
  { label: "Instagram", handle: "@AstraFC_Official", href: "https://instagram.com/AstraFC_Official" },
  { label: "Facebook", handle: "/AstraFootballClub", href: "https://facebook.com/AstraFootballClub" },
  { label: "X (Twitter)", handle: "@Astra_FC", href: "https://x.com/Astra_FC" }
];
```

- [ ] **Step 2: Rebuild the footer with a Connect column**

Replace the entire contents of `src/components/SiteFooter.tsx` with:

```tsx
import Image from "next/image";
import Link from "next/link";
import { Facebook, Instagram, Mail, MapPin } from "lucide-react";
import { clubContact, navItems, socialLinks } from "@/src/lib/site-data";

const socialIcons: Record<string, typeof Instagram> = {
  Instagram,
  Facebook
};

export function SiteFooter() {
  return (
    <footer className="bg-astra-ink px-5 py-14 text-white">
      <div className="mx-auto grid w-full max-w-7xl gap-10 md:grid-cols-[1.2fr_1fr_1fr_1fr]">
        <div>
          <Image
            src="/images/astra-logo.png"
            alt="Astra United Football Club crest"
            width={110}
            height={110}
            className="mb-5 h-24 w-24 object-contain"
          />
          <p className="max-w-md text-sm leading-6 text-white/72">
            A community football club and player development pathway based at Darebin International Sports Centre in Melbourne's north.
          </p>
        </div>
        <div>
          <h2 className="crest-type mb-4 text-lg">Explore</h2>
          <ul className="grid gap-2 text-sm text-white/72">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link className="transition hover:text-white" href={item.href}>
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link className="transition hover:text-white" href="/shop">
                Future Shop
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h2 className="crest-type mb-4 text-lg">Home Ground</h2>
          <p className="flex gap-3 text-sm leading-6 text-white/72">
            <MapPin aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-astra-red" />
            <span>{clubContact.ground}, {clubContact.address}</span>
          </p>
          <a
            href={`mailto:${clubContact.email}`}
            className="mt-4 flex items-center gap-3 text-sm text-white/72 transition hover:text-white"
          >
            <Mail aria-hidden="true" className="h-5 w-5 shrink-0 text-astra-red" />
            {clubContact.email}
          </a>
        </div>
        <div>
          <h2 className="crest-type mb-4 text-lg">Connect</h2>
          <ul className="grid gap-2 text-sm text-white/72">
            {socialLinks.map((social) => {
              const Icon = socialIcons[social.label];
              return (
                <li key={social.label}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="flex items-center gap-3 transition hover:text-white"
                  >
                    {Icon ? <Icon aria-hidden="true" className="h-5 w-5 shrink-0 text-astra-gold" /> : <span aria-hidden="true" className="inline-block h-5 w-5 shrink-0 text-center font-black text-astra-gold">X</span>}
                    {social.handle}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
      <div className="mx-auto mt-10 flex w-full max-w-7xl flex-col gap-3 border-t border-white/10 pt-6 text-xs text-white/48 sm:flex-row sm:items-center sm:justify-between">
        <p>Copyright {new Date().getFullYear()} Astra United FC.</p>
        <p>Football for all, played the Astra way.</p>
      </div>
    </footer>
  );
}
```

(The `/admin` link is dropped from the public footer — it stays reachable directly. The X/Twitter row uses a text "X" glyph since lucide has no X-brand icon.)

- [ ] **Step 3: Typecheck**

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/lib/site-data.ts src/components/SiteFooter.tsx
git commit -m "feat: real email + socials in footer"
```

---

## Task 8: Favicon (fix the live 404)

**Files:**
- Create: `app/icon.png` (copied from the existing crest)
- Create: `app/apple-icon.png` (copied from the existing crest)

- [ ] **Step 1: Copy the crest into the app icon slots**

Run (bash):
```bash
cp public/images/astra-logo.png app/icon.png
cp public/images/astra-logo.png app/apple-icon.png
```

Next.js App Router auto-serves `app/icon.png` as the favicon and `app/apple-icon.png` as the Apple touch icon — this removes the `/favicon.ico` 404 seen on the live site. (No `metadata.icons` entry needed; the file convention wins.)

- [ ] **Step 2: Commit**

```bash
git add app/icon.png app/apple-icon.png
git commit -m "feat: add favicon + apple-icon from crest"
```

---

## Task 9: Verification & preview deploy

**Files:** none (verification only)

- [ ] **Step 1: Full unit test run**

Run: `npx vitest run`
Expected: PASS (all touchline tests including the new `railNodes` suite).

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 3: Production build check (C-mirror, since `S:` build fails)**

Per `notes.md`: copy changed files into `C:\tmp\astra-united-vercel-check-fresh`, then:
```powershell
cd C:\tmp\astra-united-vercel-check-fresh
npm run build
```
Expected: build succeeds. (Alternatively skip and rely on the Vercel cloud preview in Step 4.)

- [ ] **Step 4: Push branch for a Vercel preview deploy**

```bash
git push personal homepage-wow-polish
```
Expected: a preview URL `astra-united-git-homepage-wow-polish-mazdaks-projects-dffe9641.vercel.app`. Open it and verify on desktop + mobile:
- Ball is the refined line ball, rolls smoothly down the left rail, never over text, no corner-cutting.
- Whole page is dark/cinematic; marquee scrolls; cards are image-forward; faces still visible.
- Favicon shows in the tab (no 404).
- `prefers-reduced-motion`: rail/ball/marquee are static, all content readable.

- [ ] **Step 5: Hand back to the client**

Share the preview URL for review **before** promoting to production. Production promotion (push `personal/main`) happens only after sign-off.

---

## Self-Review

**Spec coverage:**
- Art direction dark end-to-end → Tasks 4, 6 (+ body bg). ✓
- Lucide line ball → Task 2. ✓
- Side-rail motion + physics fix + chalk line → Tasks 1, 3. ✓
- Marquee → Tasks 4, 5. ✓
- Image-forward academy cards → Task 6. ✓
- Founder/senior/news/sponsors on dark → Task 6. ✓
- Real content (email, socials, trial pillars) → Tasks 6, 7. ✓
- Favicon + OG → Task 8 (favicon). OG image already present in `layout.tsx` (`/images/astra-logo.png`) and valid; spec's OG upgrade is optional and not required to fix anything, so no task — noted as already-satisfied. ✓
- Testing/verification → Task 9. ✓
- Non-goals (no new routes) respected — founder link stays `/the-club` (existing dynamic route). ✓

**Placeholder scan:** No TBD/TODO; all code blocks complete; image bases/blurs copied verbatim from manifest.

**Type consistency:** `railNodes(count, cHeight, railX, wave)` signature identical in Task 1 (def + tests) and Task 3 (call). `SoccerBall` props (`stroke`, `strokeWidth`) defined in Task 2 and used in Task 3. `clubContact`/`socialLinks` defined in Task 7 Step 1 and consumed in Task 7 Step 2. `academyCards`/`trialPillars` defined and consumed within Task 6.
