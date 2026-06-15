// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import PullIndicator from "./PullIndicator";

describe("PullIndicator", () => {
  it("renders nothing at pullDistance 0", () => {
    const { container } = render(
      <PullIndicator pullDistance={0} isRefreshing={false} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing at pullDistance 0 when not refreshing", () => {
    const { container } = render(
      <PullIndicator pullDistance={0} isRefreshing={false} />
    );
    // Should have no elements in the tree
    expect(container.innerHTML).toBe("");
  });

  it("renders chevron at pullDistance 40 with partial rotation", () => {
    render(<PullIndicator pullDistance={40} isRefreshing={false} />);
    const chevron = screen.getByTestId("pull-chevron");
    expect(chevron).toBeInTheDocument();
    // 40/80 * 180 = 90 degrees
    expect(chevron.style.transform).toBe("rotate(90deg)");
  });

  it("renders chevron at pullDistance 80 with full rotation", () => {
    render(<PullIndicator pullDistance={80} isRefreshing={false} />);
    const chevron = screen.getByTestId("pull-chevron");
    expect(chevron).toBeInTheDocument();
    expect(chevron.style.transform).toBe("rotate(180deg)");
  });

  it("renders chevron at pullDistance 120 (past threshold, capped rotation)", () => {
    render(<PullIndicator pullDistance={120} isRefreshing={false} />);
    const chevron = screen.getByTestId("pull-chevron");
    expect(chevron).toBeInTheDocument();
    // Progress capped at 1, so rotation = 180deg
    expect(chevron.style.transform).toBe("rotate(180deg)");
  });

  it("shows spinner instead of chevron when refreshing", () => {
    render(<PullIndicator pullDistance={80} isRefreshing={true} />);
    expect(screen.getByTestId("pull-spinner")).toBeInTheDocument();
    expect(screen.queryByTestId("pull-chevron")).not.toBeInTheDocument();
  });

  it("shows spinner even at pullDistance 0 when refreshing", () => {
    render(<PullIndicator pullDistance={0} isRefreshing={true} />);
    expect(screen.getByTestId("pull-spinner")).toBeInTheDocument();
  });
});
