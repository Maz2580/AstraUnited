"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useReducedMotion } from "framer-motion";
import { Compass, HeartHandshake, Target, Zap } from "lucide-react";

export type ProgramPillar = { label: string; copy: string };

// One icon per pillar, in data order (Technical · Tactical · Physical · Character).
const ICONS = [Target, Compass, Zap, HeartHandshake] as const;

// Each pillar's resting position along the horizontal rail (centre of its
// column), left → right. Evenly spread across four equal segments.
const POS = [0.125, 0.375, 0.625, 0.875];

/**
 * The development pillars (Technical · Tactical · Physical · Character) as a
 * HORIZONTAL companion to the vertical "Academy Pathway" rail: a luminous gold
 * rail runs left → right and a soft glow travels along it, SPOTLIGHTING each
 * pillar as it passes — the card lifts, its gold ring and icon warm up, and the
 * copy brightens from dim to full — then settles as the light moves on.
 *
 * Unlike the vertical board (which hides/reveals copy), every card stays whole
 * here — icon, label and copy always present at equal height — so a horizontal
 * row reads as a polished strip rather than a set of half-empty boxes. Below lg,
 * or with reduced motion, it falls back to a static, evenly-lit grid.
 */
export function ProgramPillarsRail({ pillars }: { pillars: ProgramPillar[] }) {
  const reduced = useReducedMotion() ?? false;
  // Four nodes on one rail need room — only run the rail on wide screens.
  const [isWide, setIsWide] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(min-width: 1024px)");
    setIsWide(query.matches);
    const listener = (event: MediaQueryListEvent) => setIsWide(event.matches);
    query.addEventListener("change", listener);
    return () => query.removeEventListener("change", listener);
  }, []);
  const active = isWide && !reduced;

  const tags = pillars.slice(0, POS.length);
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const travelerRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    if (!active) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = (now - start) / 1000;
      const phase = (t / 11) % 1; // glow position along the rail, 0 → 1, ~11s

      if (travelerRef.current) {
        travelerRef.current.style.left = `${(phase * 100).toFixed(2)}%`;
      }

      nodeRefs.current.forEach((el, i) => {
        if (!el) return;
        // bright when the travelling glow is near this pillar (0 by the next one)
        const proximity = Math.max(0, 1 - Math.abs(phase - POS[i]) * 4);
        // independent breath at an incommensurate rate → the whole never loops
        const breath = 0.5 + 0.5 * Math.sin(t * (0.22 + i * 0.017) + i * 1.3);
        const glow = Math.min(1, proximity * 0.7 + breath * 0.3);
        el.style.setProperty("--glow", glow.toFixed(3));
        // smoothstep so the spotlight ramps in cleanly as the light arrives
        const spot = proximity * proximity * (3 - 2 * proximity);
        el.style.setProperty("--spot", spot.toFixed(3));
      });

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active]);

  // Static fallback: small screens / reduced motion — an evenly-lit grid.
  if (!active) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tags.map((pillar, i) => {
          const Icon = ICONS[i];
          return (
            <div
              key={pillar.label}
              className="flex h-full flex-col rounded-2xl bg-gradient-to-br from-[#0d2c4d] to-[#06141f] p-5 shadow-[0_18px_38px_-18px_rgba(0,0,0,0.8)] ring-1 ring-astra-gold/15"
            >
              <div className="flex items-center gap-2.5">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-astra-gold/10 ring-1 ring-astra-gold/25">
                  <Icon aria-hidden="true" className="h-4 w-4 text-astra-gold" />
                </span>
                <p className="crest-type text-lg text-white">{pillar.label}</p>
              </div>
              <p className="mt-3 text-sm leading-6 text-white/70">{pillar.copy}</p>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="relative">
      {/* the rail the light runs along */}
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-[0.7rem] h-px bg-gradient-to-r from-astra-gold/10 via-astra-gold/45 to-astra-gold/10"
      />
      {/* the travelling glow — the spotlight progressing */}
      <span
        ref={travelerRef}
        aria-hidden="true"
        className="absolute top-[0.7rem] h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          left: "0%",
          background:
            "radial-gradient(circle, rgba(242,201,76,0.5) 0%, rgba(242,201,76,0.12) 45%, transparent 70%)"
        }}
      />

      <div className="grid grid-cols-4 gap-5">
        {tags.map((pillar, i) => {
          const Icon = ICONS[i];
          return (
            <div
              key={pillar.label}
              ref={(el) => {
                nodeRefs.current[i] = el;
              }}
              className="relative"
              style={{ "--glow": "0.25", "--spot": "0" } as CSSProperties}
            >
              {/* node on the rail */}
              <span
                aria-hidden="true"
                className="absolute left-1/2 top-[0.7rem] z-10 block h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-astra-gold"
                style={{
                  boxShadow:
                    "0 0 calc(5px + var(--glow,0) * 16px) calc(var(--glow,0) * 3px) rgba(242,201,76, calc(0.25 + var(--glow,0) * 0.65))"
                }}
              />
              {/* pillar card — whole at rest, spotlit as the light passes */}
              <div
                tabIndex={0}
                aria-label={`${pillar.label}. ${pillar.copy}`}
                className="mt-8 flex h-full flex-col rounded-2xl bg-gradient-to-br from-[#0d2c4d] to-[#06141f] p-5 transition-transform duration-300 [--hover:0] hover:[--hover:1] focus:outline-none focus-within:[--hover:1]"
                style={{
                  transform: "translateY(calc(max(var(--spot,0), var(--hover,0)) * -6px))",
                  boxShadow:
                    "0 18px 38px -18px rgba(0,0,0,0.8), 0 0 0 1px rgba(242,201,76, calc(0.12 + var(--glow,0) * 0.5))"
                }}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    aria-hidden="true"
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-astra-gold/10 ring-1 ring-astra-gold/25"
                    style={{
                      boxShadow:
                        "0 0 calc(max(var(--spot,0), var(--hover,0)) * 20px) rgba(242,201,76, calc(max(var(--spot,0), var(--hover,0)) * 0.55))"
                    }}
                  >
                    <Icon aria-hidden="true" className="h-4 w-4 text-astra-gold" />
                  </span>
                  <p className="crest-type text-lg text-white">{pillar.label}</p>
                </div>
                {/* copy is always present; it brightens from dim to full as the
                    spotlight (or hover) reaches the card. */}
                <p
                  className="mt-3 text-sm leading-6 transition-colors duration-300"
                  style={{
                    color: "rgba(255,255,255, calc(0.5 + max(var(--spot,0), var(--hover,0)) * 0.4))"
                  }}
                >
                  {pillar.copy}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
