import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Exhibition } from "./Exhibition";

async function advanceExhibitionTime(milliseconds: number) {
  await act(async () => {
    vi.advanceTimersByTime(milliseconds);
  });
}

async function revealRabbit(waitMilliseconds: number) {
  await advanceExhibitionTime(700);
  await advanceExhibitionTime(6000);
  await advanceExhibitionTime(waitMilliseconds);
}

describe("Exhibition visitor flow", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("keeps the White Rabbit as the only ordinary-motion forward cue", () => {
    render(<Exhibition />);

    expect(screen.queryByRole("button", { name: "Next artwork" })).toBeNull();

    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(screen.getByLabelText("Artwork 1 of 14")).toBeTruthy();

    fireEvent.keyDown(window, { key: "ArrowLeft" });
    expect(screen.getByLabelText("Artwork 1 of 14")).toBeTruthy();
  });

  it("announces the rabbit after the full viewing rhythm without stealing focus", async () => {
    vi.spyOn(Math, "random").mockReturnValue(0.9999);
    render(<Exhibition />);

    const homeButton = screen.getByRole("button", { name: "Home" });
    homeButton.focus();

    await advanceExhibitionTime(700);
    await advanceExhibitionTime(5999);
    expect(screen.queryByRole("button", { name: "Follow the White Rabbit" })).toBeNull();

    await advanceExhibitionTime(1);
    await advanceExhibitionTime(1999);
    expect(screen.queryByRole("button", { name: "Follow the White Rabbit" })).toBeNull();

    await advanceExhibitionTime(2001);

    expect(screen.getByRole("button", { name: "Follow the White Rabbit" })).toBeTruthy();
    expect(screen.getByRole("status").textContent).toBe("White Rabbit is ready to follow.");
    expect(document.activeElement).toBe(homeButton);
  });

  it.each([
    ["Enter", "{Enter}"],
    ["Space", " "],
  ])("lets a visitor reach the rabbit by Tab and follow it with %s", async (_name, key) => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    render(<Exhibition />);

    await revealRabbit(2000);

    vi.useRealTimers();
    const user = userEvent.setup();
    screen.getByRole("button", { name: "About" }).focus();
    await user.tab();
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Follow the White Rabbit" }),
    );

    await user.keyboard(key);
    expect(await screen.findByLabelText("Artwork 2 of 14")).toBeTruthy();
  });

  it("advances exactly one artwork after the visitor follows the rabbit", async () => {
    render(<Exhibition />);

    await revealRabbit(4000);

    fireEvent.click(screen.getByRole("button", { name: "Follow the White Rabbit" }));
    await advanceExhibitionTime(300);

    expect(screen.getByLabelText("Artwork 2 of 14")).toBeTruthy();
  });

  it("shows the final artwork until the visitor ends the exhibition, then restarts at the first artwork", async () => {
    render(<Exhibition />);

    expect(screen.getByAltText("一名乘客从地铁通道向前走去")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Browse artworks" }));
    fireEvent.click(screen.getByRole("button", { name: "View artwork 14" }));
    await advanceExhibitionTime(700);

    expect(screen.getByAltText("两名乘客在车厢里相对而立")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "结束展览" }));

    expect(screen.getByRole("heading", { name: /rabbit has gone deeper/i })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Restart" }));

    expect(screen.getByAltText("一名乘客从地铁通道向前走去")).toBeTruthy();
  });
});
