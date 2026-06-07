import { describe, expect, it } from "vitest";
import { buildPolyline, polylineLength, pointAtProgress, type Node } from "./path";

const nodes: Node[] = [
  { x: 100, y: 0 },
  { x: 200, y: 1000 },
  { x: 100, y: 2000 }
];

describe("touchline path", () => {
  it("builds a polyline that starts and ends at the first/last node", () => {
    const pts = buildPolyline(nodes, 8);
    expect(pts[0]).toEqual({ x: 100, y: 0 });
    expect(pts[pts.length - 1]).toEqual({ x: 100, y: 2000 });
  });

  it("length is monotonic and positive", () => {
    const pts = buildPolyline(nodes, 8);
    expect(polylineLength(pts)).toBeGreaterThan(2000);
  });

  it("progress 0 -> first point, 1 -> last point", () => {
    const pts = buildPolyline(nodes, 8);
    expect(pointAtProgress(pts, 0)).toEqual({ x: 100, y: 0 });
    expect(pointAtProgress(pts, 1)).toEqual({ x: 100, y: 2000 });
  });

  it("progress 0.5 lands roughly mid-arc and is clamped", () => {
    const pts = buildPolyline(nodes, 8);
    const mid = pointAtProgress(pts, 0.5);
    expect(mid.y).toBeGreaterThan(800);
    expect(mid.y).toBeLessThan(1200);
    const over = pointAtProgress(pts, 5);
    expect(over).toEqual({ x: 100, y: 2000 });
  });
});
