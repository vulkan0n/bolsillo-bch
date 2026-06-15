export const PULL_THRESHOLD = 80; // px — trigger refresh
export const PULL_MAX = 120; // px — hard cap on pull distance
export const RESISTANCE = 0.4; // multiplier
export const MIN_DISPLAY_MS = 400; // ms — minimum spinner display
export const SPINNER_REST = 60; // px — resting position during refresh

export function computePullDistance(deltaY: number): number {
  return Math.min(Math.max(0, deltaY * RESISTANCE), PULL_MAX);
}
