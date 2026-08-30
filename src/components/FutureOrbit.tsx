"use client";

import Image from "next/image";
import { useRef, type CSSProperties, type PointerEvent } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * The §8 hero: a football sitting inside two turning gold orbits that lean and
 * tilt toward the pointer.
 *
 * Three things make it read as an object in space rather than a picture of one:
 *
 * 1. The rings are CSS, not part of the artwork. A conic gradient masked down to
 *    a hairline ring, spun about its own centre, sends a bright arc travelling
 *    round the orbit; each ring sits on its own rotateX plane so it turns IN that
 *    plane. Baked-into-the-image rings could never move.
 * 2. The ball is blended with mix-blend-screen. The render is a bright subject on
 *    near-black, and screen drops near-black to nothing, so the image box that
 *    used to sit on the band simply disappears — no cutout, no matching the
 *    background colour, and the glow still blends outward.
 * 3. Pointer position drives a small parallax: the whole assembly tilts a few
 *    degrees, and the ball shifts slightly further than the rings, so the two
 *    separate in depth as you move across it.
 *
 * Pointer tracking writes CSS variables straight to the node rather than going
 * through React state — this fires on every pointermove, and re-rendering the
 * tree at that rate for a decorative tilt would be wasteful.
 *
 * With reduced motion the rings and float stop (the global reduced-motion rule
 * handles that) and the tilt is never wired up.
 */
export function FutureOrbit() {
  const reduced = useReducedMotion() ?? false;
  const stageRef = useRef<HTMLDivElement | null>(null);

  const track = (event: PointerEvent<HTMLDivElement>) => {
    const el = stageRef.current;
    if (!el || reduced) return;
    const rect = el.getBoundingClientRect();
    // -0.5 … 0.5 from the centre of the stage
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    el.style.setProperty("--px", x.toFixed(3));
    el.style.setProperty("--py", y.toFixed(3));
  };

  const release = () => {
    const el = stageRef.current;
    if (!el) return;
    el.style.setProperty("--px", "0");
    el.style.setProperty("--py", "0");
  };

  return (
    <div
      ref={stageRef}
      onPointerMove={track}
      onPointerLeave={release}
      className="relative mx-auto aspect-square w-full max-w-[26rem]"
      style={{ perspective: "900px", "--px": 0, "--py": 0 } as CSSProperties}
    >
      {/* everything leans together toward the pointer */}
      <div
        className="absolute inset-0 transition-transform duration-500 ease-out [transform-style:preserve-3d]"
        style={{
          transform:
            "rotateX(calc(var(--py) * -14deg)) rotateY(calc(var(--px) * 18deg))"
        }}
      >
        {/* soft gold bloom behind the ball */}
        <span
          aria-hidden="true"
          className="absolute inset-[12%] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(242,201,76,0.22) 0%, rgba(242,201,76,0.06) 45%, transparent 70%)"
          }}
        />

        {/* outer orbit — leans back, turns slowly */}
        <div
          aria-hidden="true"
          className="absolute inset-0 grid place-items-center"
          style={{ transform: "rotateX(72deg)" }}
        >
          <span className="orbit-ring block h-full w-full rounded-full" />
        </div>

        {/* inner orbit — tighter, tilted the other way, turning the other way */}
        <div
          aria-hidden="true"
          className="absolute inset-[16%] grid place-items-center"
          style={{ transform: "rotateX(66deg) rotateZ(24deg)" }}
        >
          <span
            className="orbit-ring block h-full w-full rounded-full"
            style={{ animationDirection: "reverse", animationDuration: "9s" }}
          />
        </div>

        {/* the ball: floats, and shifts a little further than the rings so the
            two planes separate as the pointer moves */}
        <div
          className="absolute inset-[14%] transition-transform duration-500 ease-out"
          style={{
            transform: "translate3d(calc(var(--px) * 14px), calc(var(--py) * 14px), 60px)"
          }}
        >
          <div className="orbit-float relative h-full w-full">
            <Image
              src="/images/future/astra-future-orbit-ball-1280.webp"
              alt=""
              aria-hidden="true"
              fill
              sizes="(min-width: 1024px) 26rem, 0px"
              className="object-contain mix-blend-screen"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
