"use client";

import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import Lenis from "lenis";
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useVelocity
} from "framer-motion";
import { SoccerBall } from "@/src/components/SoccerBall";

const HEADER_SAFE_TOP = 96;
const VIEWPORT_INSET = 44;

type ScrollBallFlowProps = {
  children: ReactNode;
};

function useReducedMotionPreference() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(query.matches);
    const listener = (event: MediaQueryListEvent) => setReduced(event.matches);
    query.addEventListener("change", listener);
    return () => query.removeEventListener("change", listener);
  }, []);

  return reduced;
}

export function ScrollBallFlow({ children }: ScrollBallFlowProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeTargetRef = useRef<HTMLElement | null>(null);
  const lastBoundaryPathRef = useRef("");
  const pathShadowRef = useRef<SVGPathElement>(null);
  const pathBaseRef = useRef<SVGPathElement>(null);
  const pathRedRef = useRef<SVGPathElement>(null);
  const pathGoldRef = useRef<SVGPathElement>(null);
  const ballX = useMotionValue(0);
  const ballY = useMotionValue(0);
  const railOpacity = useMotionValue(0);
  const borderProgress = useMotionValue(0);
  const ballRotate = useMotionValue(0);
  const ballScale = useMotionValue(0.9);
  const [viewportBox, setViewportBox] = useState({ width: 1000, height: 1000 });
  const reducedMotion = useReducedMotionPreference();
  const { scrollY, scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });
  const scrollVelocity = useVelocity(scrollY);
  const smoothX = useSpring(ballX, { stiffness: 180, damping: 26, mass: 0.42 });
  const smoothY = useSpring(ballY, { stiffness: 180, damping: 26, mass: 0.42 });
  const smoothOpacity = useSpring(railOpacity, { stiffness: 170, damping: 24, mass: 0.4 });
  const smoothProgress = useSpring(borderProgress, { stiffness: 150, damping: 24, mass: 0.46 });
  const smoothRotate = useSpring(ballRotate, { stiffness: 110, damping: 22, mass: 0.5 });
  const smoothScale = useSpring(ballScale, { stiffness: 190, damping: 18, mass: 0.42 });

  useEffect(() => {
    if (reducedMotion) {
      return;
    }

    const previousScrollRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";

    if (!window.location.hash && window.scrollY > 0) {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }

    const lenis = new Lenis({
      duration: 1.08,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true
    });

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };

    frame = requestAnimationFrame(raf);
    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
      window.history.scrollRestoration = previousScrollRestoration;
    };
  }, [reducedMotion]);

  const updateBoundaryFlow = useCallback((pageProgress: number) => {
    const container = containerRef.current;

    if (!container || reducedMotion) {
      railOpacity.set(0);
      return;
    }

    const targets = Array.from(container.querySelectorAll<HTMLElement>("[data-tunnel-card]"));
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    setViewportBox((current) =>
      current.width === viewportWidth && current.height === viewportHeight
        ? current
        : { width: viewportWidth, height: viewportHeight }
    );
    const focusY = viewportHeight * 0.56;
    let active: { rect: DOMRect; score: number; target: HTMLElement } | null = null;

    for (const target of targets) {
      const rect = target.getBoundingClientRect();
      const visibleHeight = Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, HEADER_SAFE_TOP);

      if (rect.width < 90 || rect.height < 70 || visibleHeight <= 0) {
        continue;
      }

      const centerY = rect.top + rect.height / 2;
      const visibleRatio = Math.min(1, visibleHeight / Math.min(rect.height, viewportHeight));
      const focusScore = 1 - Math.min(1, Math.abs(centerY - focusY) / focusY);
      let score = visibleRatio * 0.54 + focusScore * 0.46;

      if (target === activeTargetRef.current) {
        score += 0.12;
      }

      if (!active || score > active.score) {
        active = { rect, score, target };
      }
    }

    if (!active) {
      railOpacity.set(0);
      if (activeTargetRef.current) {
        activeTargetRef.current.removeAttribute("data-tunnel-active");
        activeTargetRef.current.style.removeProperty("--tunnel-focus");
        activeTargetRef.current = null;
      }
      return;
    }

    if (activeTargetRef.current !== active.target) {
      if (activeTargetRef.current) {
        activeTargetRef.current.removeAttribute("data-tunnel-active");
        activeTargetRef.current.style.removeProperty("--tunnel-focus");
      }
      active.target.setAttribute("data-tunnel-active", "true");
      activeTargetRef.current = active.target;
    }
    active.target.style.setProperty("--tunnel-focus", active.score.toFixed(3));

    const gap = viewportWidth < 720 ? 10 : 16;
    const left = Math.max(VIEWPORT_INSET, active.rect.left - gap);
    const right = Math.min(viewportWidth - VIEWPORT_INSET, active.rect.right + gap);
    const top = Math.max(HEADER_SAFE_TOP, active.rect.top - gap);
    const bottom = Math.min(viewportHeight - VIEWPORT_INSET, active.rect.bottom + gap);
    const width = Math.max(1, right - left);
    const height = Math.max(1, bottom - top);
    const radius = Math.min(22, width / 6, height / 5);
    const nextPath = [
      `M ${right} ${top + radius}`,
      `Q ${right} ${top} ${right - radius} ${top}`,
      `L ${left + radius} ${top}`,
      `Q ${left} ${top} ${left} ${top + radius}`,
      `L ${left} ${bottom - radius}`,
      `Q ${left} ${bottom} ${left + radius} ${bottom}`,
      `L ${right - radius} ${bottom}`,
      `Q ${right} ${bottom} ${right} ${bottom - radius}`,
      "Z"
    ].join(" ");

    if (lastBoundaryPathRef.current !== nextPath) {
      lastBoundaryPathRef.current = nextPath;
      pathShadowRef.current?.setAttribute("d", nextPath);
      pathBaseRef.current?.setAttribute("d", nextPath);
      pathRedRef.current?.setAttribute("d", nextPath);
      pathGoldRef.current?.setAttribute("d", nextPath);
    }

    const cardProgress = Math.max(
      0,
      Math.min(1, (viewportHeight - active.rect.top) / (viewportHeight + active.rect.height))
    );
    const perimeter = width * 2 + height * 2;
    let distance = ((cardProgress + 0.08) % 1) * perimeter;
    let x = right;
    let y = top;

    if (distance <= height) {
      x = right;
      y = top + distance;
    } else if (distance <= height + width) {
      distance -= height;
      x = right - distance;
      y = bottom;
    } else if (distance <= height * 2 + width) {
      distance -= height + width;
      x = left;
      y = bottom - distance;
    } else {
      distance -= height * 2 + width;
      x = left + distance;
      y = top;
    }

    ballX.set(x);
    ballY.set(y);
    borderProgress.set(cardProgress);
    ballRotate.set(pageProgress * 2520);
    const velocityBoost = Math.min(Math.abs(scrollVelocity.get()) / 3600, 0.08);
    ballScale.set(0.8 + active.score * 0.13 + velocityBoost);
    railOpacity.set(0.18 + active.score * 0.42);
  }, [ballScale, ballRotate, ballX, ballY, borderProgress, railOpacity, reducedMotion, scrollVelocity]);

  useMotionValueEvent(scrollYProgress, "change", updateBoundaryFlow);

  useEffect(() => {
    updateBoundaryFlow(scrollYProgress.get());
    const onResize = () => updateBoundaryFlow(scrollYProgress.get());
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      activeTargetRef.current?.removeAttribute("data-tunnel-active");
      activeTargetRef.current?.style.removeProperty("--tunnel-focus");
    };
  }, [scrollYProgress, updateBoundaryFlow]);

  return (
    <div
      ref={containerRef}
      id="club-flow"
      className="relative isolate overflow-visible bg-astra-white"
      data-scroll-ball-flow
    >
      <div className="scroll-track pointer-events-none fixed inset-0 z-10 overflow-hidden">
        <div className="relative h-svh overflow-hidden">
          <motion.svg
            viewBox={`0 0 ${viewportBox.width} ${viewportBox.height}`}
            preserveAspectRatio="none"
            aria-hidden="true"
            className="h-full w-full"
            style={{ opacity: reducedMotion ? 0 : smoothOpacity }}
          >
            <path
              ref={pathShadowRef}
              d="M 0 0"
              fill="none"
              stroke="#001c2a"
              strokeOpacity="0.08"
              strokeWidth="22"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              ref={pathBaseRef}
              d="M 0 0"
              fill="none"
              stroke="#f8fbfd"
              strokeOpacity="0.9"
              strokeWidth="14"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <motion.path
              ref={pathRedRef}
              d="M 0 0"
              fill="none"
              stroke="#c81916"
              strokeOpacity="0.84"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ pathLength: smoothProgress }}
            />
            <motion.path
              ref={pathGoldRef}
              d="M 0 0"
              fill="none"
              stroke="#f2c94c"
              strokeOpacity="0.72"
              strokeWidth="1.35"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ pathLength: smoothProgress }}
            />
          </motion.svg>
          <motion.div
            className="absolute left-0 top-0 z-30 h-10 w-10 drop-shadow-2xl sm:h-12 sm:w-12 lg:h-16 lg:w-16"
            data-flow-ball
            style={{
              x: reducedMotion ? "88vw" : smoothX,
              y: reducedMotion ? "72vh" : smoothY,
              opacity: reducedMotion ? 0 : smoothOpacity,
              rotate: reducedMotion ? 0 : smoothRotate,
              scale: reducedMotion ? 1 : smoothScale,
              translateX: "-50%",
              translateY: "-50%"
            }}
            aria-hidden="true"
          >
            <span className="absolute inset-[-10px] rounded-full border border-astra-red/40 bg-astra-red/10 blur-[1px]" />
            <span className="absolute inset-[-5px] rounded-full border border-white/70" />
            <SoccerBall className="h-full w-full" />
          </motion.div>
        </div>
      </div>
      <div className="relative">{children}</div>
    </div>
  );
}
