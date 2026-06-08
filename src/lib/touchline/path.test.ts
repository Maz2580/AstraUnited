import { describe, expect, it } from "vitest";
import {
  buildPolyline,
  polylineLength,
  pointAtProgress,
  railNodes,
  type Node
} from "./path";

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

describe("railNodes", () => {
  it("returns the requested number of nodes", () => {
    expect(railNodes(5, 1000, 56, 16)).toHaveLength(5);
  });

  it("keeps every node x within the rail band [railX-wave, railX+wave]", () => {
    const nodes = railNodes(6, 1200, 56, 16);
    for (const n of nodes) {
      expect(n.x).toBeGreaterThanOrEqual(56 - 16);
      expect(n.x).toBeLessThanOrEqual(56 + 16);
    }
  });

  it("spans from 0 to cHeight on the y axis, ascending", () => {
    const nodes = railNodes(4, 900, 56, 16);
    expect(nodes[0].y).toBe(0);
    expect(nodes[nodes.length - 1].y).toBe(900);
    for (let i = 1; i < nodes.length; i += 1) {
      expect(nodes[i].y).toBeGreaterThan(nodes[i - 1].y);
    }
  });

  it("falls back to 2 nodes when count < 2", () => {
    expect(railNodes(1, 800, 56, 16)).toHaveLength(2);
    expect(railNodes(0, 800, 56, 16)).toHaveLength(2);
  });
});
