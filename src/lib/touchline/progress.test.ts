import { describe, expect, it } from "vitest";
import { scrollToProgress, rollDelta } from "./progress";

describe("touchline progress", () => {
  it("maps scroll within bounds to [0,1] and clamps", () => {
    expect(scrollToProgress(0, 0, 1000)).toBe(0);
    expect(scrollToProgress(500, 0, 1000)).toBe(0.5);
    expect(scrollToProgress(1000, 0, 1000)).toBe(1);
    expect(scrollToProgress(-50, 0, 1000)).toBe(0);
    expect(scrollToProgress(5000, 0, 1000)).toBe(1);
  });

  it("returns 0 when range is zero (avoids divide-by-zero)", () => {
    expect(scrollToProgress(10, 100, 100)).toBe(0);
  });

  it("roll delta is distance/circumference in degrees", () => {
    // one full circumference of a radius-10 ball == 360 degrees
    expect(rollDelta(2 * Math.PI * 10, 10)).toBeCloseTo(360, 1);
    // half that distance == 180 degrees
    expect(rollDelta(Math.PI * 10, 10)).toBeCloseTo(180, 1);
    // zero radius is safe
    expect(rollDelta(50, 0)).toBe(0);
  });
});
