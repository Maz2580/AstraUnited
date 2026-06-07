export type Point = { x: number; y: number };
export type Node = { x: number; y: number };

/** Catmull-Rom-ish smooth polyline through nodes, `seg` samples between each pair. */
export function buildPolyline(nodes: Node[], seg = 24): Point[] {
  if (nodes.length === 0) return [];
  if (nodes.length === 1) return [{ ...nodes[0] }];

  const pts: Point[] = [];
  const pt = (i: number) => nodes[Math.max(0, Math.min(nodes.length - 1, i))];

  for (let i = 0; i < nodes.length - 1; i += 1) {
    const p0 = pt(i - 1);
    const p1 = pt(i);
    const p2 = pt(i + 1);
    const p3 = pt(i + 2);
    const last = i === nodes.length - 2;
    const steps = last ? seg : seg - 1;
    for (let s = 0; s <= steps; s += 1) {
      const t = s / seg;
      const t2 = t * t;
      const t3 = t2 * t;
      const x =
        0.5 *
        (2 * p1.x +
          (-p0.x + p2.x) * t +
          (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
          (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3);
      const y =
        0.5 *
        (2 * p1.y +
          (-p0.y + p2.y) * t +
          (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
          (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3);
      pts.push({ x, y });
    }
  }
  // guarantee exact endpoints
  pts[0] = { ...nodes[0] };
  pts[pts.length - 1] = { ...nodes[nodes.length - 1] };
  return pts;
}

export function polylineLength(pts: Point[]): number {
  let len = 0;
  for (let i = 1; i < pts.length; i += 1) {
    len += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
  }
  return len;
}

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}

/** Point at normalized arc-length progress [0,1]. */
export function pointAtProgress(pts: Point[], progress: number): Point {
  if (pts.length === 0) return { x: 0, y: 0 };
  if (pts.length === 1) return { ...pts[0] };
  const total = polylineLength(pts);
  const target = clamp01(progress) * total;
  let acc = 0;
  for (let i = 1; i < pts.length; i += 1) {
    const seg = Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
    if (acc + seg >= target) {
      const t = seg === 0 ? 0 : (target - acc) / seg;
      return {
        x: pts[i - 1].x + (pts[i].x - pts[i - 1].x) * t,
        y: pts[i - 1].y + (pts[i].y - pts[i - 1].y) * t
      };
    }
    acc += seg;
  }
  return { ...pts[pts.length - 1] };
}

/** Build an SVG path `d` from a polyline. */
export function toSvgPath(pts: Point[]): string {
  if (pts.length === 0) return "M 0 0";
  return pts
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
    .join(" ");
}
