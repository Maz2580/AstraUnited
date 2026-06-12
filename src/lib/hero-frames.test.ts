import { describe, expect, it } from "vitest";
import {
  advanceStepper,
  frameSetForWidth,
  frameSrc,
  pingPongIndex
} from "./hero-frames";

describe("pingPongIndex", () => {
  it("walks forward then backward without repeating endpoints", () => {
    const seq = Array.from({ length: 8 }, (_, s) => pingPongIndex(s, 4));
    expect(seq).toEqual([0, 1, 2, 3, 2, 1, 0, 1]);
  });

  it("returns 0 for single-frame sets", () => {
    expect(pingPongIndex(5, 1)).toBe(0);
  });
});

describe("advanceStepper", () => {
  it("steps once per frame duration and carries the remainder", () => {
    const next = advanceStepper({ step: 0, carryMs: 0 }, 250, 100);
    expect(next).toEqual({ step: 2, carryMs: 50 });
  });

  it("accumulates sub-frame deltas across calls", () => {
    let s = { step: 0, carryMs: 0 };
    s = advanceStepper(s, 60, 100);
    expect(s.step).toBe(0);
    s = advanceStepper(s, 60, 100);
    expect(s.step).toBe(1);
  });

  it("clamps huge deltas so a paused tab cannot cause a catch-up burst", () => {
    const next = advanceStepper({ step: 0, carryMs: 0 }, 10000, 100);
    expect(next.step).toBeLessThanOrEqual(4);
  });
});

describe("frame sources", () => {
  it("picks 960 for phones and 1280 for desktop", () => {
    expect(frameSetForWidth(390)).toBe(960);
    expect(frameSetForWidth(1440)).toBe(1280);
  });

  it("builds 1-based zero-padded paths", () => {
    expect(frameSrc(0, 1280)).toBe("/images/hero-frames/frame-001-1280.webp");
    expect(frameSrc(11, 960)).toBe("/images/hero-frames/frame-012-960.webp");
  });

  it("accepts a custom base path for other frame sets", () => {
    expect(frameSrc(0, 1280, "/images/women-frames")).toBe(
      "/images/women-frames/frame-001-1280.webp"
    );
    expect(frameSrc(2, 960, "/images/women-frames")).toBe(
      "/images/women-frames/frame-003-960.webp"
    );
  });
});
