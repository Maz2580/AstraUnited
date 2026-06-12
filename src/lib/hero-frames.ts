// Pure logic for the hero stop-motion canvas player. Kept free of DOM so it
// can be unit-tested like src/lib/touchline.

export type StepperState = { step: number; carryMs: number };

/**
 * Advance a fixed-fps stepper by an arbitrary rAF delta, carrying the
 * sub-frame remainder. Deltas are clamped to 4 frames so a backgrounded tab
 * resumes smoothly instead of fast-forwarding.
 */
export function advanceStepper(
  state: StepperState,
  deltaMs: number,
  frameDurationMs: number
): StepperState {
  if (frameDurationMs <= 0) return state;
  const clamped = Math.max(0, Math.min(deltaMs, 4 * frameDurationMs));
  const total = state.carryMs + clamped;
  const steps = Math.floor(total / frameDurationMs);
  return { step: state.step + steps, carryMs: total - steps * frameDurationMs };
}

/** Map a monotonically increasing step onto a forward-then-backward index. */
export function pingPongIndex(step: number, frameCount: number): number {
  if (frameCount <= 1) return 0;
  const cycle = 2 * frameCount - 2;
  const m = ((step % cycle) + cycle) % cycle;
  return m < frameCount ? m : cycle - m;
}

/** Map a 0..1 scroll progress onto a frame index, clamped at both ends. */
export function scrubIndex(progress: number, frameCount: number): number {
  if (frameCount <= 1) return 0;
  const p = Math.min(1, Math.max(0, progress));
  return Math.round(p * (frameCount - 1));
}

// 1280 ("720p video" class) is the sweet spot for the desktop set: at 7fps
// under the hero's dark overlay it is indistinguishable from 1600 but the
// grass-heavy webp payload is ~36% smaller.
export type FrameWidth = 960 | 1280;

export function frameSetForWidth(viewportWidth: number): FrameWidth {
  return viewportWidth <= 768 ? 960 : 1280;
}

export function frameSrc(
  index: number,
  width: FrameWidth,
  basePath = "/images/hero-frames"
): string {
  return `${basePath}/frame-${String(index + 1).padStart(3, "0")}-${width}.webp`;
}
