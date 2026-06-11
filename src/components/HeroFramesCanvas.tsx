"use client";

import { useEffect, useRef, useState } from "react";
import {
  advanceStepper,
  frameSetForWidth,
  frameSrc,
  pingPongIndex,
  type StepperState
} from "@/src/lib/hero-frames";

type Props = { frameCount: number; fps?: number };

/**
 * Stop-motion canvas player for the hero. Invisible until every frame is
 * loaded, then fades in over the poster and ping-pong loops. On any frame
 * load error, reduced motion, or missing canvas support the poster simply
 * stays — the hero is never blank.
 */
export function HeroFramesCanvas({ frameCount, fps = 7 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let cancelled = false;
    let started = false;
    let inView = true;
    let raf = 0;
    let last: number | null = null;
    let stepper: StepperState = { step: 0, carryMs: 0 };
    const frameDurationMs = 1000 / fps;
    const size = frameSetForWidth(window.innerWidth);
    const images: HTMLImageElement[] = [];
    let loadedCount = 0;

    const drawFrame = (index: number) => {
      const img = images[index];
      if (!img) return;
      const cw = canvas.width;
      const ch = canvas.height;
      const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
      const dw = img.naturalWidth * scale;
      const dh = img.naturalHeight * scale;
      ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(canvas.clientWidth * dpr);
      canvas.height = Math.round(canvas.clientHeight * dpr);
      if (started) drawFrame(pingPongIndex(stepper.step, frameCount));
    };

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (document.hidden || !inView) {
        last = null; // resume without a catch-up jump
        return;
      }
      if (last === null) {
        last = now;
        return;
      }
      const next = advanceStepper(stepper, now - last, frameDurationMs);
      last = now;
      if (next.step !== stepper.step) {
        drawFrame(pingPongIndex(next.step, frameCount));
      }
      stepper = next;
    };

    const start = () => {
      if (cancelled || started) return;
      started = true;
      resize();
      drawFrame(0);
      setReady(true);
      raf = requestAnimationFrame(tick);
    };

    for (let i = 0; i < frameCount; i++) {
      const img = new Image();
      img.decoding = "async";
      img.src = frameSrc(i, size);
      img.onload = () => {
        loadedCount += 1;
        if (loadedCount === frameCount) start();
      };
      img.onerror = () => {
        cancelled = true; // poster stays; never show a broken loop
      };
      images.push(img);
    }

    const observer = new IntersectionObserver((entries) => {
      inView = entries[0]?.isIntersecting ?? true;
    });
    observer.observe(canvas);
    window.addEventListener("resize", resize);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener("resize", resize);
    };
  }, [frameCount, fps]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`absolute inset-0 h-full w-full transition-opacity duration-700 ${ready ? "opacity-100" : "opacity-0"}`}
    />
  );
}
