"use client";

import Image from "next/image";
import { useRef, type CSSProperties, type PointerEvent } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * The §8 hero: a football with light travelling around it on elliptical orbits
 * that pass BEHIND and in FRONT of the ball.
 *
 * The orbits are SVG ellipses drawn twice — once in a layer behind the ball and
 * once in a layer in front of it, the front copy clipped to its lower half. With
 * the ball sitting between the two layers in Z, the top of each orbit is hidden
 * by the ball and the bottom crosses over it. That occlusion is the whole reason
 * it reads as something going round a sphere rather than a ring drawn on top of
 * a picture; the previous version had no occlusion and looked flat.
 *
 * Each orbit carries a faint full ellipse for the path and a short bright dash
 * that travels it. Both ellipses set pathLength="100", so the dash is expressed
 * in percent of the path and one keyframe drives every orbit no matter its real
 * perimeter — and because the dash moves ALONG the path, it travels at constant
 * arc-length speed instead of the constant angular speed a spun conic gradient
 * gives, which is what made the old version look like a radar sweep.
 *
 * Pointer position leans the whole assembly and pushes the ball a little further
 * than the orbits, so the planes separate in depth as you move across it.
 * Tracking writes CSS variables straight to the node rather than going through
 * React state: pointermove fires constantly and re-rendering the tree at that
 * rate for a decorative tilt would be waste — the same approach the touchline and
 * the pillars rail already use.
 *
 * The ball artwork is a bare cut-out: no baked rings, no HUD circles. Anything
 * painted into the image cannot move, and an earlier render's frozen rings sat
 * dead while these turned around them.
 *
 * Reduced motion: the global rule stops the dash and the float, leaving the
 * orbits as static arcs, and the tilt is never wired up.
 */

// rx / ry / rotation / seconds-per-lap / direction. Deliberately unequal so the
// three never line up into a single pulsing shape.
const ORBITS = [
  { rx: 188, ry: 62, rot: -16, dur: 11, reverse: false, width: 1.6, dash: 16 },
  { rx: 150, ry: 96, rot: 28, dur: 8, reverse: true, width: 1.3, dash: 11 },
  { rx: 168, ry: 40, rot: 8, dur: 14, reverse: false, width: 1.1, dash: 8 }
];

function Orbits({ clipped = false }: { clipped?: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 400 400"
      className="absolute inset-0 h-full w-full overflow-visible"
      // the front copy shows only its lower half, so the top of every orbit is
      // left to the ball to cover
      style={clipped ? { clipPath: "inset(50% 0 0 0)" } : undefined}
    >
      {ORBITS.map((o) => (
        <g key={`${o.rx}-${o.ry}`} transform={`rotate(${o.rot} 200 200)`}>
          {/* the path itself, barely there */}
          <ellipse
            cx={200}
            cy={200}
            rx={o.rx}
            ry={o.ry}
            fill="none"
            stroke="rgba(242,201,76,0.16)"
            strokeWidth={o.width}
          />
          {/* the light travelling it */}
          <ellipse
            className="orbit-dash"
            cx={200}
            cy={200}
            rx={o.rx}
            ry={o.ry}
            fill="none"
            stroke="rgba(242,201,76,0.95)"
            strokeWidth={o.width + 0.4}
            strokeLinecap="round"
            pathLength={100}
            strokeDasharray={`${o.dash} ${100 - o.dash}`}
            style={{
              animationDuration: `${o.dur}s`,
              animationDirection: o.reverse ? "reverse" : "normal"
            }}
          />
        </g>
      ))}
    </svg>
  );
}

export function FutureOrbit() {
  const reduced = useReducedMotion() ?? false;
  const stageRef = useRef<HTMLDivElement | null>(null);

  const track = (event: PointerEvent<HTMLDivElement>) => {
    const el = stageRef.current;
    if (!el || reduced) return;
    const rect = el.getBoundingClientRect();
    // -0.5 … 0.5 from the centre of the stage
    el.style.setProperty("--px", ((event.clientX - rect.left) / rect.width - 0.5).toFixed(3));
    el.style.setProperty("--py", ((event.clientY - rect.top) / rect.height - 0.5).toFixed(3));
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
      className="relative mx-auto aspect-square w-full max-w-[27rem]"
      style={{ perspective: "1000px", "--px": 0, "--py": 0 } as CSSProperties}
    >
      <div
        className="absolute inset-0 transition-transform duration-500 ease-out [transform-style:preserve-3d]"
        style={{ transform: "rotateX(calc(var(--py) * -12deg)) rotateY(calc(var(--px) * 16deg))" }}
      >
        {/* soft gold bloom behind the ball */}
        <span
          aria-hidden="true"
          className="absolute inset-[14%] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(242,201,76,0.20) 0%, rgba(242,201,76,0.05) 48%, transparent 72%)"
          }}
        />

        {/* orbits behind the ball */}
        <div className="absolute inset-0" style={{ transform: "translateZ(0px)" }}>
          <Orbits />
        </div>

        {/* the ball, between the two orbit layers */}
        <div
          className="absolute inset-[17%]"
          style={{
            transform: "translate3d(calc(var(--px) * 12px), calc(var(--py) * 12px), 40px)",
            transition: "transform 500ms ease-out"
          }}
        >
          <div className="orbit-float relative h-full w-full">
            <Image
              src="/images/future/astra-future-ball-1280.webp"
              alt=""
              aria-hidden="true"
              fill
              sizes="(min-width: 1024px) 27rem, 0px"
              className="object-contain"
            />
          </div>
        </div>

        {/* orbits in front of the ball — lower half only */}
        <div className="absolute inset-0" style={{ transform: "translateZ(80px)" }}>
          <Orbits clipped />
        </div>
      </div>
    </div>
  );
}
