"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowDown, Play } from "lucide-react";
import { SoccerBall } from "@/src/components/SoccerBall";

export type HeroIntroAsset =
  | { kind: "video"; src: string; poster?: string }
  | { kind: "lottie"; src: string }
  | { kind: "rive"; src: string }
  | { kind: "frames"; framePattern: string; frameCount: number };

type HeroIntroProps = {
  asset?: HeroIntroAsset;
};

export function HeroIntro({ asset }: HeroIntroProps) {
  return (
    <section
      className="hero-cutline field-grid relative isolate flex min-h-[100svh] overflow-hidden px-5 pb-24 pt-28 text-white"
      aria-label="Astra United FC introduction"
    >
      {asset ? (
        <div className="absolute inset-0 -z-20" data-hero-intro-asset={asset.kind}>
          {asset.kind === "video" ? (
            <video
              src={asset.src}
              poster={asset.poster}
              autoPlay
              muted
              playsInline
              className="h-full w-full object-cover"
            />
          ) : null}
        </div>
      ) : (
        <Image
          src="/images/academy-2.jpg"
          alt=""
          fill
          priority
          aria-hidden="true"
          className="-z-20 object-cover opacity-32"
          sizes="100vw"
        />
      )}
      <div className="absolute inset-0 -z-10 bg-astra-ink/78" />
      <div className="absolute inset-y-0 left-0 -z-10 w-2/5 skew-x-[-18deg] bg-astra-red/20" />
      <div className="absolute inset-y-0 right-[-10%] -z-10 w-1/3 skew-x-[-18deg] bg-white/8" />
      <div className="absolute inset-x-0 bottom-[18%] -z-10 h-px bg-white/25" />
      <div className="absolute left-1/2 top-[16%] -z-10 h-[68svh] w-[70svh] -translate-x-1/2 rounded-full border border-white/12" />
      <div className="absolute bottom-0 left-0 right-0 -z-10 h-24 bg-gradient-to-t from-astra-ink/50 to-transparent" />
      <div
        className="pointer-events-none absolute bottom-[7%] left-1/2 -z-10 hidden -translate-x-1/2 select-none font-display text-[17vw] font-black uppercase leading-none tracking-normal text-white/[0.055] lg:block"
        aria-hidden="true"
      >
        Astra United
      </div>

      <div className="container-wide relative z-10 grid min-h-[calc(100svh-9rem)] items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="mb-7 inline-flex items-center gap-3 rounded border border-white/16 bg-white/8 px-3 py-2 text-xs font-bold uppercase tracking-normal text-white/80 backdrop-blur"
          >
            <span className="h-2 w-2 rounded-full bg-astra-red" />
            Football academy and senior pathways
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.08, ease: "easeOut" }}
            className="crest-type max-w-4xl text-4xl leading-[0.9] sm:text-6xl lg:text-7xl xl:text-8xl"
          >
            The home of player development in Melbourne's north.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.18, ease: "easeOut" }}
            className="mt-7 max-w-lg text-lg leading-8 text-white/78 lg:max-w-2xl"
          >
            Professional coaching, community values, and a clear pathway from grassroots football to senior squads at Darebin International Sports Centre.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.28, ease: "easeOut" }}
            className="mt-9 flex flex-col gap-3 sm:flex-row"
          >
            <a
              href="/join-us"
              className="inline-flex items-center justify-center gap-2 rounded bg-astra-red px-5 py-3 text-sm font-black uppercase tracking-normal text-white transition hover:bg-red-700"
            >
              Register for 2026
            </a>
            <a
              href="/teams"
              className="inline-flex items-center justify-center gap-2 rounded border border-white/24 px-5 py-3 text-sm font-black uppercase tracking-normal text-white transition hover:bg-white/10"
            >
              <Play aria-hidden="true" className="h-4 w-4" />
              View pathways
            </a>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.18, ease: "easeOut" }}
          className="relative mx-auto hidden aspect-square w-full max-w-[420px] items-center justify-center lg:flex"
        >
          <div className="absolute inset-0 rounded-full border border-white/16" />
          <div className="absolute inset-8 rounded-full border border-astra-red/50" />
          <Image
            src="/images/astra-logo.png"
            alt="Astra United Football Club crest"
            width={520}
            height={520}
            priority
            className="h-full w-full object-contain drop-shadow-2xl"
          />
        </motion.div>
      </div>

      <motion.div
        className="absolute z-[5] h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24"
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
        <SoccerBall className="h-full w-full" label="Football at motion handoff point" />
      </motion.div>

      <a
        href="#club-flow"
        className="absolute left-1/2 top-[calc(100svh-3.75rem)] z-20 flex -translate-x-1/2 flex-col items-center gap-2 text-xs font-black uppercase tracking-normal text-white/70 transition hover:text-white"
      >
        Scroll to explore
        <ArrowDown aria-hidden="true" className="h-5 w-5 animate-bounce" />
      </a>
    </section>
  );
}
