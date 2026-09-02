"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { useReducedMotion } from "framer-motion";
import { ClipboardCheck, HeartHandshake, Lock, ShieldCheck } from "lucide-react";

export type StandardItem = { label: string; detail: string };

// One icon per guardrail, in the deck's order. The deck prints these as emoji
// (lock, shield, clipboard, handshake); the design system is lucide, so these are
// the lucide equivalents.
const ICONS = [Lock, ShieldCheck, ClipboardCheck, HeartHandshake] as const;

/**
 * The guardrails rail — the travelling-light board built in Round 6, carried over
 * to §6 Trust, Safety & Professional Standards. A luminous vertical rail runs top
 * to bottom, a soft glow travels down it, and each guardrail blooms open as the
 * glow reaches it, then eases shut as it moves on. Hover or focus opens one
 * manually at any time.
 *
 * Two changes from the version that rendered the five "Why families" reasons:
 *
 * 1. Positions are DERIVED from the item count rather than a fixed five-slot
 *    array, so four guardrails spread evenly instead of leaving a gap where the
 *    fifth used to be.
 * 2. The "Future Stars" / "First Team" captions that used to top and tail the
 *    rail are gone. They marked the two ends of a player's journey, which is what
 *    the old content was; safeguarding and insurance are not a journey, and
 *    labelling them as one would have been simply untrue. The rail now reads as a
 *    spine connecting the standards rather than a path between two points.
 */
export function StandardsBoard({ items }: { items: StandardItem[] }) {
  const reduced = useReducedMotion();
  const tags = items.slice(0, ICONS.length);

  // Evenly spaced down the rail, inset half a step at each end so the first and
  // last cards sit inside the rail rather than flush against its tips.
  const positions = tags.map((_, i) => (i + 0.5) / tags.length);

  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const travelerRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    // Reduced motion → a static, evenly-lit board. No travelling glow.
    if (reduced) {
      nodeRefs.current.forEach((el) => {
        el?.style.setProperty("--glow", "0.5");
        // every guardrail stays open: with no light to reveal them, hiding the
        // detail behind motion would hide it permanently.
        el?.style.setProperty("--open", "1");
      });
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
        // proximity bump: bright when the travelling glow is near this guardrail.
        // Scaled to the spacing so the reveal window tracks the item count.
        const proximity = Math.max(0, 1 - Math.abs(phase - positions[i]) * tags.length * 1.25);
        // independent breath at an incommensurate rate → the whole never loops
        const breath = 0.5 + 0.5 * Math.sin(t * (0.22 + i * 0.017) + i * 1.3);
        const glow = Math.min(1, proximity * 0.85 + breath * 0.3);
        el.style.setProperty("--glow", glow.toFixed(3));
        // auto-reveal: as the glow reaches this guardrail it blooms fully open,
        // then eases shut as the light moves on. Smoothstep so the card stays
        // closed until the light is genuinely close.
        const open = proximity * proximity * (3 - 2 * proximity);
        el.style.setProperty("--open", open.toFixed(3));
      });

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduced, tags.length, positions]);

  return (
    <div className="mx-auto w-full max-w-md lg:mx-0">
      <div className="relative min-h-[520px] sm:min-h-[560px]">
        {/* the rail the light runs along */}
        <span
          aria-hidden="true"
          className="absolute bottom-0 top-0 w-px bg-gradient-to-b from-astra-gold/10 via-astra-gold/45 to-astra-gold/10"
          style={{ left: "1.5rem" }}
        />
        {/* the travelling glow */}
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

        {tags.map((item, i) => {
          const Icon = ICONS[i];
          return (
            <div
              key={item.label}
              ref={(el) => {
                nodeRefs.current[i] = el;
              }}
              className="absolute inset-x-0"
              style={
                { top: `${positions[i] * 100}%`, "--glow": "0.3", "--open": "0" } as CSSProperties
              }
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
                {/* guardrail card */}
                <div
                  tabIndex={0}
                  aria-label={`${item.label}. ${item.detail}`}
                  className="w-full rounded-2xl bg-gradient-to-br from-[#0d2c4d] to-[#06141f] px-4 py-3 transition [--hover:0] hover:[--hover:1] focus:outline-none focus-within:[--hover:1]"
                  style={{
                    boxShadow:
                      "0 18px 38px -18px rgba(0,0,0,0.8), 0 0 0 1px rgba(242,201,76, calc(0.1 + var(--glow,0) * 0.5))"
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Icon aria-hidden="true" className="h-4 w-4 shrink-0 text-astra-gold" />
                    <h3 className="crest-type type-h5 leading-tight text-white">{item.label}</h3>
                  </div>
                  {/* Reveal = whichever is greater: the travelling light (--open) or
                      hover/focus (--hover). Lets the auto-bloom and manual reveal
                      coexist. maxHeight allows for the longer §6 copy. */}
                  <p
                    className="overflow-hidden text-xs leading-5 transition-all duration-300"
                    style={{
                      maxHeight: "calc(max(var(--open,0), var(--hover,0)) * 9rem)",
                      marginTop: "calc(max(var(--open,0), var(--hover,0)) * 0.5rem)",
                      color: "rgba(255,255,255, calc(max(var(--open,0), var(--hover,0)) * 0.72))"
                    }}
                  >
                    {item.detail}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
