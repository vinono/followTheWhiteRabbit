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

  it("advances exactly one artwork after the visitor follows the rabbit", async () => {
    render(<Exhibition />);

    await act(async () => {
      vi.advanceTimersByTime(700);
    });
    await act(async () => {
      vi.advanceTimersByTime(6000);
    });
    await act(async () => {
      vi.advanceTimersByTime(4000);
    });

    fireEvent.click(screen.getByRole("button", { name: "Follow the White Rabbit" }));
    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.getByLabelText("Artwork 2 of 14")).toBeTruthy();
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
