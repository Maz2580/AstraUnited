"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { useReducedMotion } from "framer-motion";
import { Award, MapPin, ShieldCheck, TrendingUp, Users } from "lucide-react";

export type WhyReason = { label: string; detail: string };

const ICONS = [Award, ShieldCheck, TrendingUp, Users, MapPin] as const;

// Each reason's resting position along the rail (0 = top / Future Stars,
// 1 = bottom / First Team). Evenly spread so the journey reads cleanly.
const POS = [0.1, 0.3, 0.5, 0.7, 0.9];

/**
 * "The Academy Pathway" — the five Why-Families reasons rendered as milestones
 * on a luminous vertical rail that traces a young player's journey from Future
 * Stars to the First Team. A soft glow travels down the rail; each milestone
 * warms as the glow passes and breathes on its own out-of-sync timer, so the
 * shimmer never visibly repeats. Calm and peripheral — atmosphere, not action.
 */
export function WhyFamiliesBoard({ reasons }: { reasons: WhyReason[] }) {
  const reduced = useReducedMotion();
  const tags = reasons.slice(0, ICONS.length);

  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const travelerRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    // Reduced motion → a static, evenly-lit pathway. No travelling glow.
    if (reduced) {
      nodeRefs.current.forEach((el) => el?.style.setProperty("--glow", "0.5"));
      return;
    }

    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = (now - start) / 1000;
      const phase = (t / 13) % 1; // glow position down the rail, 0 → 1, ~13s

      if (travelerRef.current) {
        travelerRef.current.style.top = `${(phase * 100).toFixed(2)}%`;
      }

      nodeRefs.current.forEach((el, i) => {
        if (!el) return;
        // proximity bump: bright when the travelling glow is near this milestone
        const proximity = Math.max(0, 1 - Math.abs(phase - POS[i]) * 5);
        // independent breath at an incommensurate rate → the whole never loops
        const breath = 0.5 + 0.5 * Math.sin(t * (0.22 + i * 0.017) + i * 1.3);
        const glow = Math.min(1, proximity * 0.85 + breath * 0.3);
        el.style.setProperty("--glow", glow.toFixed(3));
        // auto-reveal: as the glow reaches this milestone it blooms fully open,
        // then eases shut as the light moves on to the next. Smoothstep so the
        // card stays closed until the light is genuinely close.
        const open = proximity * proximity * (3 - 2 * proximity);
        el.style.setProperty("--open", open.toFixed(3));
      });

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduced]);

  return (
    <div className="mx-auto w-full max-w-md lg:mx-0">
      {/* journey start */}
      <p className="mb-3 pl-12 text-[0.7rem] font-black uppercase tracking-[0.22em] text-astra-gold/80">
        Future Stars
      </p>

      <div className="relative min-h-[480px] sm:min-h-[520px]">
        {/* the rail the journey runs along */}
        <span
          aria-hidden="true"
          className="absolute bottom-0 top-0 w-px bg-gradient-to-b from-astra-gold/10 via-astra-gold/45 to-astra-gold/10"
          style={{ left: "1.5rem" }}
        />
        {/* the travelling glow — the journey progressing */}
        {!reduced && (
          <span
            ref={travelerRef}
            aria-hidden="true"
            className="absolute h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              left: "1.5rem",
              top: "0%",
              background:
                "radial-gradient(circle, rgba(242,201,76,0.5) 0%, rgba(242,201,76,0.12) 45%, transparent 70%)"
            }}
          />
        )}

        {/* the five milestones */}
        {tags.map((reason, i) => {
          const Icon = ICONS[i];
          return (
            <div
              key={reason.label}
              ref={(el) => {
                nodeRefs.current[i] = el;
              }}
              className="absolute inset-x-0"
              style={{ top: `${POS[i] * 100}%`, "--glow": "0.3", "--open": "0" } as CSSProperties}
            >
              <div className="flex -translate-y-1/2 items-start gap-4">
                {/* node on the rail */}
                <span
                  aria-hidden="true"
                  className="relative z-10 mt-3 block h-3 w-3 shrink-0 rounded-full bg-astra-gold"
                  style={{
                    marginLeft: "1.5rem",
                    transform: "translateX(-50%)",
                    boxShadow:
                      "0 0 calc(5px + var(--glow,0) * 16px) calc(var(--glow,0) * 3px) rgba(242,201,76, calc(0.25 + var(--glow,0) * 0.65))"
                  }}
                />
                {/* milestone card */}
                <div
                  tabIndex={0}
                  aria-label={`${reason.label}. ${reason.detail}`}
                  className="w-full rounded-2xl bg-gradient-to-br from-[#0d2c4d] to-[#06141f] px-4 py-3 transition [--hover:0] hover:[--hover:1] focus:outline-none focus-within:[--hover:1]"
                  style={{
                    boxShadow:
                      "0 18px 38px -18px rgba(0,0,0,0.8), 0 0 0 1px rgba(242,201,76, calc(0.1 + var(--glow,0) * 0.5))"
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Icon aria-hidden="true" className="h-4 w-4 shrink-0 text-astra-gold" />
                    <p className="crest-type text-sm leading-tight text-white">{reason.label}</p>
                  </div>
                  {/* Reveal = whichever is greater: the travelling light (--open) or
                      hover/focus (--hover). Lets the auto-bloom and manual reveal coexist. */}
                  <p
                    className="overflow-hidden text-xs leading-5 transition-all duration-300"
                    style={{
                      maxHeight: "calc(max(var(--open,0), var(--hover,0)) * 7rem)",
                      marginTop: "calc(max(var(--open,0), var(--hover,0)) * 0.5rem)",
                      color: "rgba(255,255,255, calc(max(var(--open,0), var(--hover,0)) * 0.72))"
                    }}
                  >
                    {reason.detail}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* journey destination */}
      <p className="mt-3 pl-12 text-[0.7rem] font-black uppercase tracking-[0.22em] text-astra-red">
        First Team
      </p>
    </div>
  );
}
