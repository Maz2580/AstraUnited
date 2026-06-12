"use client";

import { motion } from "framer-motion";
import { ArrowDown, ArrowRight, Play } from "lucide-react";
import { CtaLink } from "@/src/components/CtaLink";
import { HeroMedia, type HeroSource } from "@/src/components/HeroMedia";
import { BallShade, SoccerBall } from "@/src/components/SoccerBall";
import { heroContent } from "@/src/lib/content/home";

// Temporary stop-motion loop from curated burst photos (Dr Emamifar ball
// skills on the Darebin pitch) until the team delivers production motion
// frames. Values come from `node scripts/build-hero-frames.mjs`.
const heroMedia: HeroSource = {
  kind: "frames",
  frameCount: 15,
  fps: 7,
  poster: "/images/hero-frames/poster-1920.webp",
  posterMobile: "/images/hero-frames/poster-960.webp",
  blurDataURL:
    "data:image/webp;base64,UklGRk4AAABXRUJQVlA4IEIAAACwAQCdASoQAAkABABoJQBOgBjcRS4sAP7ys1Ele1Zc799b9j+PlJHHapFDdjiXCtW/rCAYpmVf6Zs0WdNXndBAAAA=",
  blurDataURLMobile:
    "data:image/webp;base64,UklGRm4AAABXRUJQVlA4IGIAAAAQBACdASoQABgAPxFysVCsJqSisAgBgCIJQBajUABp1f3o8yqdk8u4AAD+wycrv+1B6fsvGjB/MfxwHqAfx3W3Qb0ZrgOxtfV8iFHdbsi7E/FFHEyaU99K4uXjshYnrvAAAA=="
};

// Compact stat rail (B) — static, energetic.
const stats = [
  { value: "U6–Snr", label: "One clear pathway" },
  { value: "2×", label: "Week structured training" },
  { value: "DISC", label: "Thornbury home ground" }
];

// Staggered entrance for the stat rail; each row slides in, then a gold
// accent line sweeps under its value.
const railVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.12 } }
};

const statVariants = {
  hidden: { opacity: 0, x: 24 },
  show: { opacity: 1, x: 0, transition: { duration: 0.45, ease: "easeOut" } }
};

const sweepVariants = {
  hidden: { scaleX: 0 },
  show: { scaleX: 1, transition: { duration: 0.4, delay: 0.15, ease: "easeOut" } }
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

export function HeroIntro() {
  return (
    <section
      className="hero-cutline relative isolate flex min-h-[100svh] overflow-hidden px-5 pb-24 pt-28 text-white"
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
          {/* Pitch-status pill */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="mb-7 inline-flex items-center gap-2.5 rounded-full border border-astra-turf/50 bg-astra-turf/20 px-3.5 py-1.5 text-[0.7rem] font-bold uppercase tracking-wide text-emerald-100 backdrop-blur"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            Pitch update · All pitches open
          </motion.div>

          {/* Kicker */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05, ease: "easeOut" }}
            className="flex items-center gap-3"
          >
            <span className="h-px w-8 bg-astra-red" aria-hidden="true" />
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-astra-gold">
              {heroContent.kicker}
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.12, ease: "easeOut" }}
            className="crest-type mt-5 max-w-3xl text-4xl leading-[0.92] text-white sm:text-6xl lg:text-7xl xl:text-8xl"
          >
            {renderHeadline(heroContent.headline)}
          </motion.h1>

          {/* Lead */}
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="mt-7 max-w-prose text-lg leading-8 text-white/75"
          >
            {heroContent.lead}
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.28, ease: "easeOut" }}
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

        {/* Stat rail (B) — right side on lg, stacked on mobile */}
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
      </div>

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

      {/* Scroll affordance */}
      <a
        href="#club-flow"
        className="absolute left-1/2 top-[calc(100svh-3.75rem)] z-20 flex -translate-x-1/2 flex-col items-center gap-2 text-xs font-black uppercase tracking-wide text-white/70 transition hover:text-white"
      >
        Scroll to explore
        <ArrowDown aria-hidden="true" className="h-5 w-5 animate-bounce" />
      </a>
    </section>
  );
}
