"use client";

import { useRef } from "react";
import {
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  useReducedMotion,
  type MotionValue
} from "framer-motion";
import { Award, MapPin, ShieldCheck, TrendingUp, Users } from "lucide-react";

export type WhyReason = { label: string; detail: string };

// Per-tag layout across the rail (mirrors the scattered hang in t7): horizontal
// position, thread length so the heights stagger, a small resting tilt, the icon,
// and an idle period that keeps each tag feeling individually alive.
const LAYOUT = [
  { left: "12%", thread: 96, tilt: -3, Icon: Award, period: 5.2 },
  { left: "32%", thread: 162, tilt: 2, Icon: ShieldCheck, period: 6.4 },
  { left: "51%", thread: 220, tilt: -2, Icon: TrendingUp, period: 5.8 },
  { left: "70%", thread: 80, tilt: 3, Icon: Users, period: 6.0 },
  { left: "88%", thread: 176, tilt: -2, Icon: MapPin, period: 5.5 }
] as const;

function HangingTag({
  reason,
  layout,
  sway,
  index,
  reduced
}: {
  reason: WhyReason;
  layout: (typeof LAYOUT)[number];
  sway: MotionValue<number>;
  index: number;
  reduced: boolean | null;
}) {
  const dragAngle = useMotionValue(0);
  // Low damping → a tugged tag overshoots centre and settles, like a real pendulum.
  const angle = useSpring(dragAngle, { stiffness: 70, damping: 5, mass: 0.7 });
  const rotate = useTransform(
    [angle, sway],
    (latest: number[]) => latest[0] + latest[1] + layout.tilt
  );

  const dragging = useRef(false);
  const startX = useRef(0);
  const startAngle = useRef(0);

  const onDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduced) return;
    dragging.current = true;
    startX.current = e.clientX;
    startAngle.current = dragAngle.get();
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    const next = startAngle.current + (e.clientX - startX.current) * 0.34;
    dragAngle.set(Math.max(-34, Math.min(34, next)));
  };
  const onUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    dragging.current = false;
    dragAngle.set(0); // release → the spring swings it back
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* pointer already released */
    }
  };

  const { Icon } = layout;

  return (
    <motion.div
      className="absolute top-0"
      // x: "-50%" centres the thread on the left%; framer composes it with the
      // idle rotate so the Tailwind translate is not clobbered by the animation.
      style={{ left: layout.left, x: "-50%", transformOrigin: "50% 0%" }}
      animate={reduced ? undefined : { rotate: [-1.6, 1.6, -1.6] }}
      transition={
        reduced
          ? undefined
          : { duration: layout.period, repeat: Infinity, ease: "easeInOut", delay: index * 0.3 }
      }
    >
      <motion.div
        style={{ rotate, transformOrigin: "50% 0%" }}
        className="flex flex-col items-center"
      >
        {/* thread from the rail */}
        <span
          aria-hidden="true"
          className="w-px bg-gradient-to-b from-astra-gold/80 via-astra-gold/40 to-astra-gold/10"
          style={{ height: layout.thread }}
        />
        {/* eyelet where the thread meets the tag */}
        <span
          aria-hidden="true"
          className="-mb-1 h-2.5 w-2.5 rounded-full bg-astra-gold ring-4 ring-astra-gold/15"
        />
        {/* the swinging tag */}
        <div
          tabIndex={0}
          aria-label={`${reason.label}. ${reason.detail}`}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          className="group/tag w-[clamp(158px,15vw,208px)] cursor-grab touch-none select-none rounded-2xl bg-gradient-to-br from-[#0d2c4d] to-[#06141f] px-4 py-3 shadow-[0_22px_45px_-15px_rgba(0,0,0,0.85)] ring-1 ring-white/12 backdrop-blur transition hover:ring-astra-gold/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-astra-gold active:cursor-grabbing"
        >
          <div className="flex items-center gap-2">
            <Icon aria-hidden="true" className="h-4 w-4 shrink-0 text-astra-gold" />
            <p className="crest-type text-sm leading-tight text-white">{reason.label}</p>
          </div>
          <p className="mt-0 max-h-0 overflow-hidden text-xs leading-5 text-white/0 transition-all duration-300 group-hover/tag:mt-2 group-hover/tag:max-h-28 group-hover/tag:text-white/70 group-focus-within/tag:mt-2 group-focus-within/tag:max-h-28 group-focus-within/tag:text-white/70">
            {reason.detail}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function WhyFamiliesBoard({ reasons }: { reasons: WhyReason[] }) {
  const reduced = useReducedMotion();

  // Scroll velocity → a shared sway angle. Scrolling the page nudges every tag,
  // so motion rewards the act of scrolling and pulls the eye further down.
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const smooth = useSpring(velocity, { damping: 40, stiffness: 300, mass: 0.6 });
  const sway = useTransform(smooth, [-1600, 0, 1600], [11, 0, -11], { clamp: true });

  // Pointer parallax → a gentle 3D tilt of the whole board for depth.
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [7, -7]), {
    stiffness: 90,
    damping: 16
  });
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [-5, 5]), {
    stiffness: 90,
    damping: 16
  });

  const onParallax = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - rect.left) / rect.width - 0.5);
    py.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  const resetParallax = () => {
    px.set(0);
    py.set(0);
  };

  const tags = reasons.slice(0, LAYOUT.length);

  return (
    <div className="w-full">
      {/* Interactive hanging board — pointer-capable large screens only */}
      {!reduced && (
        <div
          className="relative hidden h-[470px] [perspective:1100px] lg:block"
          onPointerMove={onParallax}
          onPointerLeave={resetParallax}
        >
          {/* the rail the tags hang from */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
          <motion.div className="absolute inset-0 [transform-style:preserve-3d]" style={{ rotateX, rotateY }}>
            {tags.map((reason, index) => (
              <HangingTag
                key={reason.label}
                reason={reason}
                layout={LAYOUT[index]}
                sway={sway}
                index={index}
                reduced={reduced}
              />
            ))}
          </motion.div>
          <p className="pointer-events-none absolute bottom-3 right-4 text-[0.7rem] font-black uppercase tracking-[0.18em] text-white/35">
            Drag a tag · scroll to swing
          </p>
        </div>
      )}

      {/* Accessible static fallback — mobile always; every size under reduced-motion */}
      <div className={`grid gap-3 sm:grid-cols-2 ${reduced ? "" : "lg:hidden"}`}>
        {tags.map((reason, index) => {
          const Icon = LAYOUT[index].Icon;
          return (
            <div
              key={reason.label}
              className="rounded-2xl bg-gradient-to-br from-[#0d2c4d] to-[#06141f] p-5 ring-1 ring-white/12"
            >
              <div className="flex items-center gap-2">
                <Icon aria-hidden="true" className="h-4 w-4 shrink-0 text-astra-gold" />
                <p className="crest-type text-base leading-tight text-white">{reason.label}</p>
              </div>
              <p className="mt-2 text-sm leading-6 text-white/70">{reason.detail}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
