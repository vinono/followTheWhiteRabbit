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

    const currentArtwork = screen.getByAltText(
      "一名女子站在地铁车门旁，望向玻璃中的倒影",
    );
    expect(currentArtwork.getAttribute("width")).toBe("1080");
    expect(currentArtwork.getAttribute("height")).toBe("1080");
    expect(screen.queryByRole("button", { name: "Next artwork" })).toBeNull();

    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(screen.getByLabelText("Artwork 1 of 14")).toBeTruthy();

    fireEvent.keyDown(window, { key: "ArrowLeft" });
    expect(screen.getByLabelText("Artwork 1 of 14")).toBeTruthy();
  });

  it("defers Dock thumbnails and keeps them decorative", () => {
    render(<Exhibition />);

    fireEvent.click(screen.getByRole("button", { name: "Browse artworks" }));
    const firstThumbnail = screen.getByRole("button", { name: "View artwork 1" }).querySelector("img");

    expect(firstThumbnail?.getAttribute("loading")).toBe("lazy");
    expect(firstThumbnail?.getAttribute("alt")).toBe("");
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

    expect(screen.getByAltText("一名女子站在地铁车门旁，望向玻璃中的倒影")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Browse artworks" }));
    fireEvent.click(screen.getByRole("button", { name: "View artwork 14" }));
    await advanceExhibitionTime(700);

    expect(screen.getByAltText("拥挤的车厢里，两名女子隔着人群相向站立")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "结束展览" }));

    expect(screen.getByRole("heading", { name: /rabbit has gone deeper/i })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Restart" }));

    expect(screen.getByAltText("一名女子站在地铁车门旁，望向玻璃中的倒影")).toBeTruthy();
  });

  it("closes the Dock via Escape key and returns focus to the dock trigger", () => {
    render(<Exhibition />);

    const dockTrigger = screen.getByRole("button", { name: "Browse artworks" });
    fireEvent.click(dockTrigger);
    expect(screen.getByRole("region", { name: "Browse artworks" })).toBeTruthy();

    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByRole("region", { name: "Browse artworks" })).toBeNull();
    expect(document.activeElement).toBe(dockTrigger);
  });

  it("closes the Dock when clicking the backdrop", () => {
    const { container } = render(<Exhibition />);

    fireEvent.click(screen.getByRole("button", { name: "Browse artworks" }));
    expect(screen.getByRole("region", { name: "Browse artworks" })).toBeTruthy();

    const backdrop = container.querySelector(".dockBackdrop");
    expect(backdrop).toBeTruthy();
    fireEvent.click(backdrop!);

    expect(screen.queryByRole("region", { name: "Browse artworks" })).toBeNull();
  });

  it("freezes the dwell viewing rhythm while About is open and resumes remaining dwell on close", async () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    render(<Exhibition />);

    // Complete entrance (700ms)
    await advanceExhibitionTime(700);

    // Dwell 2000ms out of 6000ms
    await advanceExhibitionTime(2000);

    // Open About
    fireEvent.click(screen.getByRole("button", { name: "About" }));
    expect(screen.getByRole("dialog", { name: /Find the White Rabbit/i })).toBeTruthy();

    // Advance 15 seconds while reading About
    await advanceExhibitionTime(15000);
    expect(screen.queryByRole("button", { name: "Follow the White Rabbit" })).toBeNull();

    // Close About via Escape
    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByRole("dialog")).toBeNull();

    // Remaining dwell is 4000ms: advance 3999ms -> still viewing, no rabbit
    await advanceExhibitionTime(3999);
    expect(screen.queryByRole("button", { name: "Follow the White Rabbit" })).toBeNull();

    // Advance 1ms (completes dwell) + 1999ms of 2000ms random wait -> still no rabbit
    await advanceExhibitionTime(1);
    await advanceExhibitionTime(1999);
    expect(screen.queryByRole("button", { name: "Follow the White Rabbit" })).toBeNull();

    // Advance remaining 1ms -> rabbit appears!
    await advanceExhibitionTime(1);
    expect(screen.getByRole("button", { name: "Follow the White Rabbit" })).toBeTruthy();
  });

  it("hides a visible rabbit when Dock opens, and resumes from waiting phase after closing", async () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    render(<Exhibition />);

    // Wait until rabbit is visible
    await revealRabbit(2000);
    expect(screen.getByRole("button", { name: "Follow the White Rabbit" })).toBeTruthy();

    // Open Dock
    fireEvent.click(screen.getByRole("button", { name: "Browse artworks" }));
    expect(screen.getByRole("region", { name: "Browse artworks" })).toBeTruthy();

    // White Rabbit must be hidden
    expect(screen.queryByRole("button", { name: "Follow the White Rabbit" })).toBeNull();

    // Close Dock
    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByRole("region", { name: "Browse artworks" })).toBeNull();

    // Rabbit does not reappear immediately (it resumes from waiting phase)
    expect(screen.queryByRole("button", { name: "Follow the White Rabbit" })).toBeNull();

    // Advance 1999ms of 2000ms random wait
    await advanceExhibitionTime(1999);
    expect(screen.queryByRole("button", { name: "Follow the White Rabbit" })).toBeNull();

    // Advance 1ms -> rabbit reappears!
    await advanceExhibitionTime(1);
    expect(screen.getByRole("button", { name: "Follow the White Rabbit" })).toBeTruthy();
  });

  it("traps focus inside About modal and returns focus to About button upon closing", async () => {
    render(<Exhibition />);

    const aboutButton = screen.getByRole("button", { name: "About" });
    aboutButton.focus();
    fireEvent.click(aboutButton);

    const closeButton = screen.getByRole("button", { name: "Close about" });
    expect(document.activeElement).toBe(closeButton);

    // Tab key inside modal loops focus
    fireEvent.keyDown(window, { key: "Tab" });
    expect(document.activeElement).toBe(closeButton);

    fireEvent.keyDown(window, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(closeButton);

    // Close About via close button
    fireEvent.click(closeButton);
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.activeElement).toBe(aboutButton);
  });
});
