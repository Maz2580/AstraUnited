"use client";

import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue
} from "framer-motion";
import { ArrowDown, ArrowRight, Play } from "lucide-react";
import { CtaLink } from "@/src/components/CtaLink";
import { HeroMedia, type HeroSource } from "@/src/components/HeroMedia";
import { heroContent } from "@/src/lib/content/home";

// Temporary stop-motion loop from curated burst photos (Dr Emamifar ball
// skills on the Darebin pitch) until the team delivers production motion
// frames. Values come from `node scripts/build-hero-frames.mjs`.
const heroMedia: HeroSource = {
  kind: "frames",
  frameCount: 15,
  fps: 7,
  scrub: true,
  poster: "/images/hero-frames/poster-1920.webp",
  posterMobile: "/images/hero-frames/poster-960.webp",
  blurDataURL:
    "data:image/webp;base64,UklGRk4AAABXRUJQVlA4IEIAAACwAQCdASoQAAkABABoJQBOgBjcRS4sAP7ys1Ele1Zc799b9j+PlJHHapFDdjiXCtW/rCAYpmVf6Zs0WdNXndBAAAA=",
  blurDataURLMobile:
    "data:image/webp;base64,UklGRm4AAABXRUJQVlA4IGIAAAAQBACdASoQABgAPxFysVCsJqSisAgBgCIJQBajUABp1f3o8yqdk8u4AAD+wycrv+1B6fsvGjB/MfxwHqAfx3W3Qb0ZrgOxtfV8iFHdbsi7E/FFHEyaU99K4uXjshYnrvAAAA=="
};

const stats = [
  { value: "U6–Snr", label: "One clear pathway" },
  { value: "2×", label: "Week structured training" },
  { value: "DISC", label: "Thornbury home ground" }
];

// Scroll-progress windows for the puzzle-piece assembly. The page lands on
// the photo alone; every piece of content — kicker, headline, lead, CTAs,
// stat rail — clicks into place as the user scrolls through the pinned hero
// (and disassembles when they scroll back). All pieces are settled by ~0.79
// so the last stretch of the pin is a clean, fully-assembled frame before
// the page releases.
type Window = [number, number];
const PIECE_WINDOWS: {
  kicker: Window;
  headline: Window;
  lead: Window;
  ctas: Window;
  rail: Window;
  stats: Window[];
  affordanceOut: Window;
} = {
  kicker: [0.02, 0.1],
  headline: [0.04, 0.18],
  lead: [0.16, 0.3],
  ctas: [0.26, 0.4],
  rail: [0.36, 0.46],
  stats: [
    [0.4, 0.54],
    [0.5, 0.64],
    [0.6, 0.74]
  ],
  affordanceOut: [0.78, 0.9]
};

// Emphasise one word of the headline in gold.
function renderHeadline(headline: string) {
  const accent = /community/i.test(headline) ? "community" : null;
  if (!accent) return headline;
  const parts = headline.split(new RegExp(`(${accent})`, "i"));
  return parts.map((part, i) =>
    part.toLowerCase() === accent ? (
      <span key={i} className="text-astra-gold">
        {part}
      </span>
    ) : (
      part
    )
  );
}

type StatPieceProps = {
  stat: (typeof stats)[number];
  progress: MotionValue<number>;
  window: Window;
  reduce: boolean;
};

/** One stat box sliding in from the right inside its scroll window. */
function StatPiece({ stat, progress, window, reduce }: StatPieceProps) {
  const [start, end] = window;
  const opacity = useTransform(progress, [start, end], [0, 1]);
  const x = useTransform(progress, [start, end], [56, 0]);
  const sweep = useTransform(progress, [start + 0.06, end + 0.06], [0, 1]);

  return (
    <motion.div
      style={reduce ? undefined : { opacity, x }}
      className="flex flex-col gap-1 bg-astra-ink/30 px-5 py-5"
    >
      <dt className="crest-type text-3xl leading-none text-white lg:text-4xl">
        <span className="text-astra-gold">{stat.value}</span>
      </dt>
      <motion.span
        style={reduce ? undefined : { scaleX: sweep }}
        aria-hidden="true"
        className="block h-px w-10 origin-left bg-astra-gold/70"
      />
      <dd className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-white/60">
        {stat.label}
      </dd>
    </motion.div>
  );
}

export function HeroIntro() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion() ?? false;
  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start start", "end end"]
  });

  const kickerOpacity = useTransform(scrollYProgress, PIECE_WINDOWS.kicker, [0, 1]);
  const kickerY = useTransform(scrollYProgress, PIECE_WINDOWS.kicker, [16, 0]);
  const headlineOpacity = useTransform(scrollYProgress, PIECE_WINDOWS.headline, [0, 1]);
  const headlineY = useTransform(scrollYProgress, PIECE_WINDOWS.headline, [40, 0]);
  const leadOpacity = useTransform(scrollYProgress, PIECE_WINDOWS.lead, [0, 1]);
  const leadY = useTransform(scrollYProgress, PIECE_WINDOWS.lead, [36, 0]);
  const ctaOpacity = useTransform(scrollYProgress, PIECE_WINDOWS.ctas, [0, 1]);
  const ctaY = useTransform(scrollYProgress, PIECE_WINDOWS.ctas, [36, 0]);
  const railOpacity = useTransform(scrollYProgress, PIECE_WINDOWS.rail, [0, 1]);
  const railX = useTransform(scrollYProgress, PIECE_WINDOWS.rail, [56, 0]);
  const affordanceOpacity = useTransform(scrollYProgress, PIECE_WINDOWS.affordanceOut, [1, 0]);

  return (
    // Tall wrapper pins the hero while the user scrolls through it; that
    // scroll distance drives BOTH the stop-motion frames (scrub mode) and the
    // puzzle-piece assembly of the content. Reduced motion collapses the pin
    // and renders everything assembled.
    <div
      ref={wrapperRef}
      data-hero-scrub
      className="relative h-[220svh] bg-astra-ink motion-reduce:h-auto"
    >
      <section
        className="hero-cutline sticky top-0 isolate flex h-[100svh] overflow-hidden px-5 pb-24 pt-28 text-white motion-reduce:static motion-reduce:h-auto motion-reduce:min-h-[100svh]"
        aria-label="Astra United FC introduction"
      >
      {/* Background media (decorative) */}
      <HeroMedia source={heroMedia} />

      {/* Overlays above the media, below the content — keep white text legible */}
      <div className="absolute inset-0 -z-10 bg-astra-ink/72" aria-hidden="true" />
      <div
        className="absolute inset-0 -z-10 bg-gradient-to-br from-astra-navy/80 via-astra-ink/70 to-astra-ink/95"
        aria-hidden="true"
      />
      <div
        className="absolute inset-y-0 left-0 -z-10 w-2/5 skew-x-[-18deg] bg-astra-red/15 blur-2xl"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 left-0 right-0 -z-10 h-32 bg-gradient-to-t from-astra-ink to-transparent"
        aria-hidden="true"
      />
      {/* Subtle film grain / vignette feel */}
      <div
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(6,17,26,0.55))] mix-blend-multiply"
        aria-hidden="true"
      />

      <div className="container-wide relative z-10 grid min-h-[calc(100svh-9rem)] items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="max-w-3xl">
          {/* Kicker — first puzzle piece, arrives on the slightest scroll */}
          <motion.div
            style={reduce ? undefined : { opacity: kickerOpacity, y: kickerY }}
            className="flex items-center gap-3"
          >
            <span className="h-px w-8 bg-astra-red" aria-hidden="true" />
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-astra-gold">
              {heroContent.kicker}
            </span>
          </motion.div>

          {/* Headline — second piece, right behind the kicker */}
          <motion.h1
            style={reduce ? undefined : { opacity: headlineOpacity, y: headlineY }}
            className="crest-type mt-5 max-w-3xl text-4xl leading-[0.92] text-white sm:text-6xl lg:text-7xl xl:text-8xl"
          >
            {renderHeadline(heroContent.headline)}
          </motion.h1>

          {/* Lead — first puzzle piece, rises in with scroll */}
          <motion.p
            style={reduce ? undefined : { opacity: leadOpacity, y: leadY }}
            className="mt-7 max-w-prose text-lg leading-8 text-white/75"
          >
            {heroContent.lead}
          </motion.p>

          {/* CTAs — second piece */}
          <motion.div
            style={reduce ? undefined : { opacity: ctaOpacity, y: ctaY }}
            className="mt-9 flex flex-col gap-3 sm:flex-row"
          >
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
          </motion.div>
        </div>

        {/* Stat rail — the container is a piece too (no empty frame at rest),
            then its boxes slide in from the right one by one */}
        <motion.dl
          style={reduce ? undefined : { opacity: railOpacity, x: railX }}
          className="mt-2 grid gap-px overflow-hidden rounded-xl border border-white/12 bg-white/5 backdrop-blur lg:ml-auto lg:max-w-xs"
        >
          {stats.map((stat, index) => (
            <StatPiece
              key={stat.value}
              stat={stat}
              progress={scrollYProgress}
              window={PIECE_WINDOWS.stats[index]}
              reduce={reduce}
            />
          ))}
        </motion.dl>
      </div>

      {/* Scroll affordance — fades out once the puzzle is assembled */}
        <motion.a
          href="#club-flow"
          style={reduce ? undefined : { opacity: affordanceOpacity }}
          className="absolute left-1/2 top-[calc(100svh-3.75rem)] z-20 flex -translate-x-1/2 flex-col items-center gap-2 text-xs font-black uppercase tracking-wide text-white/70 transition hover:text-white"
        >
          Scroll to explore
          <ArrowDown aria-hidden="true" className="h-5 w-5 animate-bounce" />
        </motion.a>
      </section>
    </div>
  );
}
