"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform
} from "framer-motion";
import { ArrowDown, ArrowRight, Play } from "lucide-react";
import { CtaLink } from "@/src/components/CtaLink";
import { HeroMedia, type HeroSource } from "@/src/components/HeroMedia";
import { heroContent } from "@/src/lib/content/home";

// Approved hero footage (team-supplied), extracted to a webp frame set and
// SCRUBBED by scroll: as the user scrolls through the pinned hero the clip
// advances frame-by-frame (the ball plays with the scroll), exactly like the
// previous stop-motion hero. Regenerate frames with
// `node scripts/build-hero-video-frames.mjs` to swap the footage.
const heroMedia: HeroSource = {
  kind: "frames",
  frameCount: 60,
  basePath: "/images/hero-video-frames",
  scrub: true,
  poster: "/images/hero-video-frames/poster-desktop.webp",
  posterMobile: "/images/hero-video-frames/poster-mobile.webp"
};

// Two scroll-reveal steps over the pinned hero, matching the approved design.
// The windows are deliberately spaced with a "hold" between them so each step
// lands and is readable before the next begins — that's the step-by-step feel:
//   step 1 — the headline drops in over the footage (screenshot t1), holds
//   step 2 — the centred registration card rises in with the lead + CTAs (t2)
// Reduced motion / mobile collapse the pin and render everything assembled.
type Window = [number, number];
const PHASE: {
  headline: Window;
  card: Window;
  affordanceOut: Window;
} = {
  headline: [0.04, 0.22],
  card: [0.46, 0.7],
  affordanceOut: [0.72, 0.86]
};

/** Wrapper that makes its child lean toward the cursor — a tactile, magnetic
 *  feel on the CTAs. Pointer-driven only, so it's inert on touch devices. */
function MagneticButton({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 16, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 220, damping: 16, mass: 0.4 });
  return (
    <motion.div
      ref={ref}
      style={{ x: sx, y: sy }}
      onMouseMove={(e) => {
        const r = ref.current?.getBoundingClientRect();
        if (!r) return;
        x.set((e.clientX - (r.left + r.width / 2)) * 0.35);
        y.set((e.clientY - (r.top + r.height / 2)) * 0.4);
      }}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** The registration card: a gold cursor-spotlight follows the pointer, the card
 *  tilts slightly toward it and lifts on hover. Tilt lives on this inner element
 *  so it never clashes with the outer scroll-reveal transform. */
function InteractiveCard({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const gx = useMotionValue(50);
  const gy = useMotionValue(50);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 150, damping: 18 });
  const sry = useSpring(ry, { stiffness: 150, damping: 18 });
  const glow = useMotionTemplate`radial-gradient(420px circle at ${gx}% ${gy}%, rgba(242,201,76,0.18), transparent 60%)`;
  return (
    <motion.div
      ref={ref}
      onMouseMove={(e) => {
        const r = ref.current?.getBoundingClientRect();
        if (!r) return;
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        gx.set(px * 100);
        gy.set(py * 100);
        ry.set((px - 0.5) * 6);
        rx.set(-(py - 0.5) * 6);
      }}
      onMouseLeave={() => {
        rx.set(0);
        ry.set(0);
        gx.set(50);
        gy.set(50);
      }}
      whileHover={{ y: -5 }}
      style={{ rotateX: srx, rotateY: sry, transformPerspective: 900 }}
      className="group relative mx-auto w-full max-w-xl overflow-hidden rounded-2xl border border-astra-gold/30 bg-astra-ink/70 p-7 text-left backdrop-blur-md transition-colors duration-300 hover:border-astra-gold/70 sm:p-8"
    >
      {/* Cursor-tracked gold spotlight (fades in on hover) */}
      <motion.span
        aria-hidden="true"
        style={{ background: glow }}
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />
      <div className="relative">{children}</div>
    </motion.div>
  );
}

export function HeroIntro() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion() ?? false;
  // The pin-and-reveal choreography is a desktop gesture; phones get the
  // grown hero with everything assembled and the clip playing.
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(min-width: 1024px)");
    setIsDesktop(query.matches);
    const listener = (event: MediaQueryListEvent) => setIsDesktop(event.matches);
    query.addEventListener("change", listener);
    return () => query.removeEventListener("change", listener);
  }, []);
  const reduce = reducedMotion || !isDesktop;
  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start start", "end end"]
  });

  const headlineOpacity = useTransform(scrollYProgress, PHASE.headline, [0, 1]);
  const headlineY = useTransform(scrollYProgress, PHASE.headline, [-48, 0]);
  const cardOpacity = useTransform(scrollYProgress, PHASE.card, [0, 1]);
  const cardY = useTransform(scrollYProgress, PHASE.card, [72, 0]);
  const cardScale = useTransform(scrollYProgress, PHASE.card, [0.94, 1]);
  const affordanceOpacity = useTransform(scrollYProgress, PHASE.affordanceOut, [1, 0]);

  return (
    // Tall wrapper pins the hero while the user scrolls through it; that scroll
    // distance drives the two-phase reveal. Reduced motion collapses the pin
    // and renders everything assembled over the still poster.
    <div
      ref={wrapperRef}
      data-hero-scrub
      className="relative h-auto bg-astra-ink lg:h-[280svh] motion-reduce:lg:h-auto"
    >
      <section
        className="hero-cutline relative isolate flex min-h-[100svh] flex-col overflow-hidden px-5 pb-24 pt-28 text-white lg:sticky lg:top-0 lg:h-[100svh] motion-reduce:lg:static motion-reduce:lg:h-auto"
        aria-label="Astra United FC introduction"
      >
        {/* Background media (decorative ambient loop) */}
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
        {/* Centre-zone mute: the placeholder footage carries a faint stock
            watermark dead-centre. A light elliptical wash + tiny blur over that
            zone knocks the watermark's contrast/legibility down while the player
            and pitch stay clearly visible. Remove once the clean clip lands. */}
        <div
          className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_55%_38%_at_50%_45%,rgba(5,14,23,0.34),transparent_72%)] backdrop-blur-[1.5px]"
          aria-hidden="true"
        />

        {/* Centred stack: headline reveals first (step 1), then the
            registration card rises into the centre below it (step 2). Both
            slots are reserved up front so revealing causes no layout shift. */}
        <div className="container-wide relative z-10 flex min-h-[calc(100svh-13rem)] flex-col items-center justify-center gap-8 text-center sm:gap-10">
          {/* Step 1 — live chip + headline drop in over the footage */}
          <div className="flex flex-col items-center gap-5">
            <motion.div
              style={reduce ? undefined : { opacity: headlineOpacity, y: headlineY }}
              className="flex items-center gap-2.5 rounded-full border border-white/15 bg-astra-ink/50 px-4 py-1.5 text-[0.7rem] font-bold uppercase tracking-[0.18em] text-white/80 backdrop-blur-sm"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75 motion-reduce:animate-none" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              Pitches open · training &amp; match days
            </motion.div>

            <motion.h1
              style={reduce ? undefined : { opacity: headlineOpacity, y: headlineY }}
              className="crest-type mx-auto max-w-4xl text-4xl leading-[0.95] text-white sm:text-5xl lg:text-6xl xl:text-7xl"
            >
              {heroContent.headline}
            </motion.h1>
          </div>

          {/* Step 2 — the registration card rises into the centre, then becomes
              interactive (cursor spotlight + tilt + magnetic CTAs) */}
          <motion.div
            style={reduce ? undefined : { opacity: cardOpacity, y: cardY, scale: cardScale }}
            className="w-full"
          >
            <InteractiveCard>
              <p className="text-base leading-7 text-white/80 sm:text-lg sm:leading-8">
                {heroContent.lead}
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <MagneticButton className="w-full sm:w-auto">
                  <CtaLink
                    href={heroContent.primaryCta.href}
                    className="w-full justify-center px-6 py-3.5 text-sm font-black uppercase tracking-wide sm:w-auto"
                  >
                    {heroContent.primaryCta.label}
                    <ArrowRight aria-hidden="true" className="btn-icon h-4 w-4" />
                  </CtaLink>
                </MagneticButton>
                <MagneticButton className="w-full sm:w-auto">
                  <CtaLink
                    href={heroContent.secondaryCta.href}
                    variant="ghost"
                    className="w-full justify-center px-6 py-3.5 text-sm font-black uppercase tracking-wide sm:w-auto"
                  >
                    <Play aria-hidden="true" className="h-4 w-4" />
                    {heroContent.secondaryCta.label}
                  </CtaLink>
                </MagneticButton>
              </div>
            </InteractiveCard>
          </motion.div>
        </div>

        {/* Scroll affordance — fades out once both pieces are assembled */}
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
