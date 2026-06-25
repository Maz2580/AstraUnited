"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useReducedMotion } from "framer-motion";

export type ProgramPillar = { label: string; copy: string };

// Each pillar's resting position along the horizontal rail (centre of its
// column), left → right. Evenly spread across four equal segments.
const POS = [0.125, 0.375, 0.625, 0.875];

/**
 * The development pillars (Technical · Tactical · Physical · Character) as a
 * HORIZONTAL twin of the "Academy Pathway" rail: a luminous gold rail runs
 * left → right, a soft glow travels along it, and each pillar's copy reveals as
 * the light reaches its node, then eases away as the light moves to the next.
 * Same mechanic as WhyFamiliesBoard, rotated — so the two sections rhyme.
 *
 * The copy's space is permanently reserved (it fades/rises rather than expands)
 * so the grid row never changes height and the page below never reflows. Hover
 * or focus opens a card independently of the light. Below lg, or reduced-motion,
 * it falls back to a static grid with every pillar already open.
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
        const glow = Math.min(1, proximity * 0.85 + breath * 0.3);
        el.style.setProperty("--glow", glow.toFixed(3));
        // smoothstep so a card stays shut until the light is genuinely close
        const open = proximity * proximity * (3 - 2 * proximity);
        el.style.setProperty("--open", open.toFixed(3));
      });

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active]);

  // Static fallback: small screens / reduced motion — every pillar already open.
  if (!active) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tags.map((pillar) => (
          <div
            key={pillar.label}
            className="rounded-2xl bg-gradient-to-br from-[#0d2c4d] to-[#06141f] px-5 py-4 shadow-[0_18px_38px_-18px_rgba(0,0,0,0.8)] ring-1 ring-astra-gold/15"
          >
            <p className="text-xs font-black uppercase tracking-[0.14em] text-astra-red">{pillar.label}</p>
            <p className="mt-2 text-sm leading-6 text-white/72">{pillar.copy}</p>
          </div>
        ))}
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
      {/* the travelling glow — the journey progressing */}
      <span
        ref={travelerRef}
        aria-hidden="true"
        className="absolute top-[0.7rem] h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          left: "0%",
          background:
            "radial-gradient(circle, rgba(242,201,76,0.5) 0%, rgba(242,201,76,0.12) 45%, transparent 70%)"
        }}
      />

      <div className="grid grid-cols-4 items-start gap-4">
        {tags.map((pillar, i) => (
          <div
            key={pillar.label}
            ref={(el) => {
              nodeRefs.current[i] = el;
            }}
            className="relative"
            style={{ "--glow": "0.3", "--open": "0" } as CSSProperties}
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
            {/* pillar card */}
            <div
              tabIndex={0}
              aria-label={`${pillar.label}. ${pillar.copy}`}
              className="mt-7 rounded-2xl bg-gradient-to-br from-[#0d2c4d] to-[#06141f] px-5 py-4 transition [--hover:0] hover:[--hover:1] focus:outline-none focus-within:[--hover:1]"
              style={{
                boxShadow:
                  "0 18px 38px -18px rgba(0,0,0,0.8), 0 0 0 1px rgba(242,201,76, calc(0.1 + var(--glow,0) * 0.5))"
              }}
            >
              <p className="text-xs font-black uppercase tracking-[0.14em] text-astra-red">{pillar.label}</p>
              {/* Reveal = whichever is greater: the travelling light (--open) or
                  hover/focus (--hover). The copy keeps its space (fades + rises
                  rather than expanding) so the row height never shifts. */}
              <p
                className="mt-2 text-sm leading-6 text-white/75 transition-all duration-300"
                style={{
                  opacity: "calc(max(var(--open,0), var(--hover,0)))",
                  transform: "translateY(calc((1 - max(var(--open,0), var(--hover,0))) * 6px))"
                }}
              >
                {pillar.copy}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
