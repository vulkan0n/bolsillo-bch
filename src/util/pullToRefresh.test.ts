import { describe, it, expect } from "vitest";

import { computePullDistance, PULL_MAX, PULL_THRESHOLD } from "./pullToRefresh";

describe("computePullDistance", () => {
  it("returns 0 for deltaY of 0", () => {
    expect(computePullDistance(0)).toBe(0);
  });

  it("caps at PULL_MAX for large deltaY", () => {
    expect(computePullDistance(400)).toBe(PULL_MAX);
    expect(computePullDistance(1000)).toBe(PULL_MAX);
  });

  it("returns PULL_THRESHOLD at deltaY 200 (200 * 0.4 = 80)", () => {
    expect(computePullDistance(200)).toBe(PULL_THRESHOLD);
  });

  it("returns 0 for negative deltaY (upward scroll)", () => {
    expect(computePullDistance(-50)).toBe(0);
    expect(computePullDistance(-100)).toBe(0);
  });

  it("returns correct proportional value for mid-range deltaY", () => {
    // 100 * 0.4 = 40
    expect(computePullDistance(100)).toBe(40);
    // 50 * 0.4 = 20
    expect(computePullDistance(50)).toBe(20);
    // 250 * 0.4 = 100
    expect(computePullDistance(250)).toBe(100);
  });

  it("is never negative", () => {
    expect(computePullDistance(-1)).toBe(0);
    expect(computePullDistance(-999)).toBe(0);
  });

  it("never exceeds PULL_MAX", () => {
    expect(computePullDistance(PULL_MAX / 0.4)).toBe(PULL_MAX);
    expect(computePullDistance(PULL_MAX / 0.4 + 1)).toBe(PULL_MAX);
  });
});
