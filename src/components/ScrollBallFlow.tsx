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

const HEADER_SAFE_TOP = 112;
const VIEWPORT_INSET = 44;

type ScrollBallFlowProps = {
  children: ReactNode;
};

type FlowTarget = {
  rect: DOMRect;
  score: number;
  target: HTMLElement;
  index: number;
};

type RailBox = {
  bottom: number;
  height: number;
  left: number;
  right: number;
  top: number;
  width: number;
};

function clamp(value: number, min = 0, max = 1) {
  return Math.max(min, Math.min(max, value));
}

function getRoundedRectPath(box: RailBox, radius: number) {
  return [
    `M ${box.right} ${box.top + radius}`,
    `Q ${box.right} ${box.top} ${box.right - radius} ${box.top}`,
    `L ${box.left + radius} ${box.top}`,
    `Q ${box.left} ${box.top} ${box.left} ${box.top + radius}`,
    `L ${box.left} ${box.bottom - radius}`,
    `Q ${box.left} ${box.bottom} ${box.left + radius} ${box.bottom}`,
    `L ${box.right - radius} ${box.bottom}`,
    `Q ${box.right} ${box.bottom} ${box.right} ${box.bottom - radius}`,
    "Z"
  ].join(" ");
}

function getPerimeterPoint(box: RailBox, progress: number, clockwise: boolean) {
  const perimeter = box.width * 2 + box.height * 2;
  let distance = clamp(clockwise ? progress : 1 - progress) * perimeter;
  let x = box.right;
  let y = box.top;

  if (distance <= box.height) {
    x = box.right;
    y = box.top + distance;
  } else if (distance <= box.height + box.width) {
    distance -= box.height;
    x = box.right - distance;
    y = box.bottom;
  } else if (distance <= box.height * 2 + box.width) {
    distance -= box.height + box.width;
    x = box.left;
    y = box.bottom - distance;
  } else {
    distance -= box.height * 2 + box.width;
    x = box.left + distance;
    y = box.top;
  }

  return { x, y };
}

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
  const activeGroupRef = useRef<HTMLElement | null>(null);
  const activeWakeItemsRef = useRef<HTMLElement[]>([]);
  const lastBoundaryPathRef = useRef("");
  const pathShadowRef = useRef<SVGPathElement>(null);
  const pathBaseRef = useRef<SVGPathElement>(null);
  const pathRedRef = useRef<SVGPathElement>(null);
  const pathGoldRef = useRef<SVGPathElement>(null);
  const hudMinuteRef = useRef<HTMLSpanElement>(null);
  const hudDistanceRef = useRef<HTMLSpanElement>(null);
  const hudPossessionRef = useRef<HTMLSpanElement>(null);
  const hudPhaseRef = useRef<HTMLSpanElement>(null);
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
  const trailOneX = useSpring(ballX, { stiffness: 86, damping: 27, mass: 0.72 });
  const trailOneY = useSpring(ballY, { stiffness: 86, damping: 27, mass: 0.72 });
  const trailTwoX = useSpring(ballX, { stiffness: 62, damping: 30, mass: 0.86 });
  const trailTwoY = useSpring(ballY, { stiffness: 62, damping: 30, mass: 0.86 });
  const trailThreeX = useSpring(ballX, { stiffness: 44, damping: 34, mass: 1 });
  const trailThreeY = useSpring(ballY, { stiffness: 44, damping: 34, mass: 1 });

  const clearActiveGroup = useCallback(() => {
    if (activeGroupRef.current) {
      activeGroupRef.current.removeAttribute("data-flow-active");
      activeGroupRef.current.style.removeProperty("--group-focus");
      activeGroupRef.current.style.removeProperty("--group-progress");
      activeGroupRef.current = null;
    }

    for (const item of activeWakeItemsRef.current) {
      item.removeAttribute("data-flow-wake");
      item.style.removeProperty("--tunnel-focus");
    }
    activeWakeItemsRef.current = [];
  }, []);

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

    const flowGroups = Array.from(container.querySelectorAll<HTMLElement>("[data-flow-group]"));
    const targets = flowGroups.length
      ? flowGroups
      : Array.from(container.querySelectorAll<HTMLElement>("[data-flow-item]"));
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    setViewportBox((current) =>
      current.width === viewportWidth && current.height === viewportHeight
        ? current
        : { width: viewportWidth, height: viewportHeight }
    );
    const focusY = viewportHeight * 0.56;
    let active: FlowTarget | null = null;
    const minute = Math.round(pageProgress * 90);
    const possession = Math.round(48 + pageProgress * 24);
    const phaseNames = ["Kick-off", "Sweep", "Switch", "Through ball", "Finish"];
    const phase = phaseNames[Math.min(phaseNames.length - 1, Math.floor(pageProgress * phaseNames.length))];

    if (hudMinuteRef.current) {
      hudMinuteRef.current.textContent = String(minute).padStart(2, "0");
    }
    if (hudDistanceRef.current) {
      hudDistanceRef.current.textContent = `${(pageProgress * 8.4).toFixed(1)} km`;
    }
    if (hudPossessionRef.current) {
      hudPossessionRef.current.textContent = String(possession);
    }
    if (hudPhaseRef.current) {
      hudPhaseRef.current.textContent = phase;
    }

    for (let index = 0; index < targets.length; index += 1) {
      const target = targets[index];
      const rect = target.getBoundingClientRect();
      const visibleHeight = Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, HEADER_SAFE_TOP);

      if (rect.width < 90 || rect.height < 70 || visibleHeight <= 0) {
        continue;
      }

      const centerY = rect.top + rect.height / 2;
      const visibleRatio = clamp(visibleHeight / Math.min(rect.height, viewportHeight));
      const focusScore = 1 - clamp(Math.abs(centerY - focusY) / focusY);
      let score = visibleRatio * 0.54 + focusScore * 0.46;

      if (target === activeGroupRef.current) {
        score += 0.14;
      }

      if (!active || score > active.score) {
        active = { rect, score, target, index };
      }
    }

    if (!active) {
      railOpacity.set(0);
      clearActiveGroup();
      return;
    }

    if (activeGroupRef.current !== active.target) {
      clearActiveGroup();
      activeGroupRef.current = active.target;
      active.target.setAttribute("data-flow-active", "true");
    }
    active.target.style.setProperty("--group-focus", active.score.toFixed(3));

    const isDesktop = viewportWidth >= 1180;
    const gap = viewportWidth < 720 ? 12 : isDesktop ? 34 : 18;
    const desktopInset = isDesktop ? Math.max(58, (viewportWidth - 1180) / 2 - 96) : VIEWPORT_INSET;
    const safeInset = viewportWidth < 720 ? 20 : desktopInset;
    const left = Math.max(safeInset, active.rect.left - gap);
    const right = Math.min(viewportWidth - safeInset, active.rect.right + gap);
    const top = Math.max(HEADER_SAFE_TOP, active.rect.top - gap);
    const bottom = Math.min(viewportHeight - VIEWPORT_INSET, active.rect.bottom + gap);
    const width = Math.max(1, right - left);
    const height = Math.max(1, bottom - top);
    const box = { bottom, height, left, right, top, width };
    const radius = Math.min(viewportWidth < 720 ? 18 : 30, width / 6, height / 5);
    const nextPath = getRoundedRectPath(box, radius);

    if (lastBoundaryPathRef.current !== nextPath) {
      lastBoundaryPathRef.current = nextPath;
      pathShadowRef.current?.setAttribute("d", nextPath);
      pathBaseRef.current?.setAttribute("d", nextPath);
      pathRedRef.current?.setAttribute("d", nextPath);
      pathGoldRef.current?.setAttribute("d", nextPath);
    }

    const groupProgress = clamp((viewportHeight - active.rect.top) / (viewportHeight + active.rect.height));
    const routeOffset = active.index % 2 === 0 ? 0.06 : 0.54;
    const routeProgress = (groupProgress + routeOffset) % 1;
    const { x, y } = getPerimeterPoint(box, routeProgress, active.index % 2 === 0);
    active.target.style.setProperty("--group-progress", groupProgress.toFixed(3));

    const items = Array.from(active.target.querySelectorAll<HTMLElement>("[data-flow-item]"));
    const staleWakeItems = new Set(activeWakeItemsRef.current);
    const nextWakeItems: HTMLElement[] = [];
    const wakeRadius = viewportWidth < 720 ? 220 : 330;

    for (const item of items) {
      const rect = item.getBoundingClientRect();
      const dx = Math.max(rect.left - x, 0, x - rect.right);
      const dy = Math.max(rect.top - y, 0, y - rect.bottom);
      const distance = Math.hypot(dx, dy);
      const wake = clamp(1 - distance / wakeRadius);
      const focus = clamp(active.score * 0.28 + wake * 0.72);

      item.style.setProperty("--tunnel-focus", focus.toFixed(3));

      if (wake > 0.16 || (items.length === 1 && active.score > 0.52)) {
        item.setAttribute("data-flow-wake", "true");
        nextWakeItems.push(item);
        staleWakeItems.delete(item);
      } else {
        item.removeAttribute("data-flow-wake");
      }
    }

    staleWakeItems.forEach((item) => {
      item.removeAttribute("data-flow-wake");
      item.style.removeProperty("--tunnel-focus");
    });
    activeWakeItemsRef.current = nextWakeItems;

    ballX.set(x);
    ballY.set(y);
    borderProgress.set(clamp(groupProgress * 0.92 + 0.08));
    ballRotate.set(pageProgress * 2520);
    const velocityBoost = Math.min(Math.abs(scrollVelocity.get()) / 3600, 0.08);
    ballScale.set(0.8 + active.score * 0.13 + velocityBoost);
    railOpacity.set(0.18 + active.score * 0.42);
  }, [ballScale, ballRotate, ballX, ballY, borderProgress, clearActiveGroup, railOpacity, reducedMotion, scrollVelocity]);

  useMotionValueEvent(scrollYProgress, "change", updateBoundaryFlow);

  useEffect(() => {
    updateBoundaryFlow(scrollYProgress.get());
    const onResize = () => updateBoundaryFlow(scrollYProgress.get());
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      clearActiveGroup();
    };
  }, [clearActiveGroup, scrollYProgress, updateBoundaryFlow]);

  return (
    <div
      ref={containerRef}
      id="club-flow"
      className="relative isolate overflow-visible bg-astra-white"
      data-scroll-ball-flow
    >
      <div className="flow-field-layer" aria-hidden="true">
        <span className="flow-side-rail flow-side-rail-left" />
        <span className="flow-side-rail flow-side-rail-right" />
        <div className="flow-hud flow-hud-left">
          <span className="flow-hud-label">Minute</span>
          <span className="flow-hud-value"><span ref={hudMinuteRef}>00</span><span className="flow-hud-unit">'</span></span>
          <span className="flow-hud-sub" ref={hudPhaseRef}>Kick-off</span>
        </div>
        <div className="flow-hud flow-hud-right">
          <span className="flow-hud-label">Touchline</span>
          <span className="flow-hud-value" ref={hudDistanceRef}>0.0 km</span>
          <span className="flow-hud-sub"><span ref={hudPossessionRef}>48</span>% tempo</span>
        </div>
        <span className="flow-side-note flow-side-note-left">Academy pathway</span>
        <span className="flow-side-note flow-side-note-right">Darebin home ground</span>
        <span className="flow-side-mark flow-side-mark-one" />
        <span className="flow-side-mark flow-side-mark-two" />
        <span className="flow-side-mark flow-side-mark-three" />
      </div>
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
          <motion.span
            className="flow-ball-trail flow-ball-trail-one"
            style={{
              x: reducedMotion ? "88vw" : trailOneX,
              y: reducedMotion ? "72vh" : trailOneY,
              opacity: reducedMotion ? 0 : smoothOpacity,
              translateX: "-50%",
              translateY: "-50%"
            }}
            aria-hidden="true"
          />
          <motion.span
            className="flow-ball-trail flow-ball-trail-two"
            style={{
              x: reducedMotion ? "88vw" : trailTwoX,
              y: reducedMotion ? "72vh" : trailTwoY,
              opacity: reducedMotion ? 0 : smoothOpacity,
              translateX: "-50%",
              translateY: "-50%"
            }}
            aria-hidden="true"
          />
          <motion.span
            className="flow-ball-trail flow-ball-trail-three"
            style={{
              x: reducedMotion ? "88vw" : trailThreeX,
              y: reducedMotion ? "72vh" : trailThreeY,
              opacity: reducedMotion ? 0 : smoothOpacity,
              translateX: "-50%",
              translateY: "-50%"
            }}
            aria-hidden="true"
          />
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
