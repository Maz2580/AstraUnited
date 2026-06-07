"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import Lenis from "lenis";
import { SoccerBall } from "@/src/components/SoccerBall";
import {
  buildPolyline,
  pointAtProgress,
  polylineLength,
  toSvgPath,
  type Point
} from "@/src/lib/touchline/path";
import { rollDelta, scrollToProgress } from "@/src/lib/touchline/progress";

type TouchlineProps = {
  children: ReactNode;
};

const BALL_SIZE = 60; // rendered ball size in px
const BALL_RADIUS = BALL_SIZE / 2;
const LERP = 0.18;
const REACT_RADIUS = 360;

type ReactCard = {
  el: HTMLElement;
  /** center in container coordinates */
  cx: number;
  cy: number;
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

export function Touchline({ children }: TouchlineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const basePathRef = useRef<SVGPathElement>(null);
  const progressPathRef = useRef<SVGPathElement>(null);
  const ballRef = useRef<HTMLDivElement>(null);

  // Geometry (container coordinates), rebuilt by measure()
  const polyRef = useRef<Point[]>([]);
  const pathLenRef = useRef(0);
  const cHeightRef = useRef(0);
  const cTopDocRef = useRef(0);
  const reactCardsRef = useRef<ReactCard[]>([]);

  // Ball motion state
  const currentXRef = useRef(0);
  const currentYRef = useRef(0);
  const prevXRef = useRef(0);
  const prevYRef = useRef(0);
  const rotationRef = useRef(0);
  const hasInitialisedRef = useRef(false);

  const reducedMotion = useReducedMotionPreference();

  useEffect(() => {
    if (reducedMotion) {
      return;
    }

    const container = containerRef.current;
    if (!container) {
      return;
    }

    const previousScrollRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";

    if (!window.location.hash && window.scrollY > 0) {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }

    // --- Build master path in container coordinates ---
    const measure = () => {
      const cRect = container.getBoundingClientRect();
      const cRectTopDoc = cRect.top + window.scrollY;
      const cWidth = container.clientWidth;
      const cHeight = container.scrollHeight;

      cTopDocRef.current = cRectTopDoc;
      cHeightRef.current = cHeight;

      const margin = Math.min(120, cWidth * 0.12);
      const nodeEls = Array.from(
        container.querySelectorAll<HTMLElement>("[data-touchline-node]")
      );

      const nodes = nodeEls.map((el, i) => {
        const r = el.getBoundingClientRect();
        const yDoc = r.top + window.scrollY + r.height / 2 - cRectTopDoc;
        const x = i % 2 === 0 ? margin : cWidth - margin;
        return { x, y: yDoc };
      });

      const usableNodes =
        nodes.length >= 2
          ? nodes
          : [
              { x: cWidth / 2, y: 0 },
              { x: cWidth / 2, y: cHeight }
            ];

      const poly = buildPolyline(usableNodes, 24);
      polyRef.current = poly;
      pathLenRef.current = polylineLength(poly);

      // Cache react-card centers in container coordinates.
      const cardEls = Array.from(
        container.querySelectorAll<HTMLElement>("[data-touchline-react]")
      );
      reactCardsRef.current = cardEls.map((el) => {
        const r = el.getBoundingClientRect();
        return {
          el,
          cx: r.left + window.scrollX - (cRect.left + window.scrollX) + r.width / 2,
          cy: r.top + window.scrollY + r.height / 2 - cRectTopDoc
        };
      });

      // Update SVG overlay geometry.
      const d = toSvgPath(poly);
      svgRef.current?.setAttribute("viewBox", `0 0 ${cWidth} ${cHeight}`);
      basePathRef.current?.setAttribute("d", d);
      progressPathRef.current?.setAttribute("d", d);
      if (progressPathRef.current) {
        const len = pathLenRef.current;
        progressPathRef.current.style.strokeDasharray = `${len}`;
        progressPathRef.current.style.strokeDashoffset = `${len}`;
      }
    };

    measure();

    const lenis = new Lenis({
      duration: 1.08,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true
    });

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);

      const poly = polyRef.current;
      if (poly.length > 0) {
        const cTopDoc = cTopDocRef.current;
        const cHeight = cHeightRef.current;
        const scroll = window.scrollY;
        const start = cTopDoc - window.innerHeight * 0.5;
        const end = cTopDoc + cHeight - window.innerHeight * 0.5;
        const progress = scrollToProgress(scroll, start, end);

        const target = pointAtProgress(poly, progress);

        if (!hasInitialisedRef.current) {
          currentXRef.current = target.x;
          currentYRef.current = target.y;
          prevXRef.current = target.x;
          prevYRef.current = target.y;
          hasInitialisedRef.current = true;
        } else {
          currentXRef.current += (target.x - currentXRef.current) * LERP;
          currentYRef.current += (target.y - currentYRef.current) * LERP;
        }

        const cx = currentXRef.current;
        const cy = currentYRef.current;

        // Roll proportional to distance travelled this frame.
        const dist = Math.hypot(cx - prevXRef.current, cy - prevYRef.current);
        rotationRef.current += rollDelta(dist, BALL_RADIUS);
        prevXRef.current = cx;
        prevYRef.current = cy;

        if (ballRef.current) {
          ballRef.current.style.transform = `translate3d(${cx}px, ${cy}px, 0) translate(-50%, -50%) rotate(${rotationRef.current}deg)`;
        }

        // Reveal path as the ball advances.
        if (progressPathRef.current) {
          progressPathRef.current.style.strokeDashoffset = `${
            pathLenRef.current * (1 - progress)
          }`;
        }

        // Passing wave: cards react as the ball sweeps past.
        const cards = reactCardsRef.current;
        for (let i = 0; i < cards.length; i += 1) {
          const card = cards[i];
          const d = Math.hypot(card.cx - cx, card.cy - cy);
          const react = Math.max(0, 1 - d / REACT_RADIUS);
          card.el.style.setProperty("--touchline-react", react.toFixed(3));
        }
      }

      frame = requestAnimationFrame(raf);
    };

    frame = requestAnimationFrame(raf);

    const resizeObserver = new ResizeObserver(() => measure());
    resizeObserver.observe(container);
    window.addEventListener("resize", measure);

    // Re-measure once fonts/layout settle.
    const settleTimer = window.setTimeout(measure, 400);
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => measure()).catch(() => {});
    }

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      window.removeEventListener("resize", measure);
      window.clearTimeout(settleTimer);
      lenis.destroy();
      window.history.scrollRestoration = previousScrollRestoration;
    };
  }, [reducedMotion]);

  return (
    <div ref={containerRef} id="club-flow" className="relative isolate bg-astra-white">
      {!reducedMotion && (
        <>
          <svg
            ref={svgRef}
            viewBox="0 0 1000 1000"
            preserveAspectRatio="none"
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0 h-full w-full"
          >
            <path
              ref={basePathRef}
              d="M 0 0"
              fill="none"
              stroke="#f8fbfd"
              strokeOpacity="0.55"
              strokeWidth="14"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              ref={progressPathRef}
              d="M 0 0"
              fill="none"
              stroke="#f2c94c"
              strokeOpacity="0.85"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div
            ref={ballRef}
            aria-hidden="true"
            className="pointer-events-none absolute left-0 top-0 z-10 drop-shadow-2xl"
            style={{ width: BALL_SIZE, height: BALL_SIZE, willChange: "transform" }}
          >
            <span className="absolute inset-[-9px] rounded-full bg-astra-red/10 blur-[2px]" />
            <span className="absolute inset-[-4px] rounded-full border border-white/60" />
            <SoccerBall className="h-full w-full" />
          </div>
        </>
      )}
      <div className="relative z-[1]">{children}</div>
    </div>
  );
}
