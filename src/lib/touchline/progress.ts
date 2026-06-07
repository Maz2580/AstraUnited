/** Normalize a scroll position within [start,end] to [0,1], clamped. */
export function scrollToProgress(scroll: number, start: number, end: number): number {
  const range = end - start;
  if (range <= 0) return 0;
  const p = (scroll - start) / range;
  return Math.max(0, Math.min(1, p));
}

/** Degrees a ball of radius r rolls over a given linear distance. */
export function rollDelta(distance: number, radius: number): number {
  const circumference = 2 * Math.PI * radius;
  if (circumference === 0) return 0;
  return (distance / circumference) * 360;
}
