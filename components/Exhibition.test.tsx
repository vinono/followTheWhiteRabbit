import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Exhibition } from "./Exhibition";

describe("Exhibition final artwork flow", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows the final artwork until the visitor ends the exhibition, then restarts at the first artwork", async () => {
    render(<Exhibition />);

    expect(screen.getByAltText("一名乘客从地铁通道向前走去")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Browse artworks" }));
    fireEvent.click(screen.getByRole("button", { name: "View artwork 14" }));
    await act(async () => {
      vi.advanceTimersByTime(700);
    });

    expect(screen.getByAltText("两名乘客在车厢里相对而立")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "结束展览" }));

    expect(screen.getByRole("heading", { name: /rabbit has gone deeper/i })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Restart" }));

    expect(screen.getByAltText("一名乘客从地铁通道向前走去")).toBeTruthy();
  });
});
