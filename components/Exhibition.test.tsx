import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Exhibition } from "./Exhibition";
import { artworks } from "../content/artworks";
import { COMPLETION_KEY } from "../lib/exhibition-fsm";

async function advance(milliseconds: number) {
  await act(async () => { vi.advanceTimersByTime(milliseconds); });
}
function start() { fireEvent.click(screen.getByRole("button", { name: "开始观看" })); }
async function loadPhoto(index = 0) {
  await act(async () => { fireEvent.load(screen.getByAltText(artworks[index].alt)); });
}
async function reveal(index = 0) {
  await loadPhoto(index);
  await advance(500);
  await advance(2000);
  await advance(500);
}
function restoreCompletedVisit() {
  sessionStorage.setItem(COMPLETION_KEY, "true");
  return render(<Exhibition />);
}
function openDock() { fireEvent.click(screen.getByRole("button", { name: "Browse artworks" })); }
function selectFromGallery(number: number) {
  for (let step = 0; step < artworks.length; step++) {
    const card = screen.queryByRole("button", { name: `View artwork ${number}` });
    if (card?.tabIndex === 0) break;
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "ArrowRight" });
  }
  fireEvent.click(screen.getByRole("button", { name: `View artwork ${number}` }));
}

describe("Exhibition visitor flow", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    sessionStorage.clear();
    vi.spyOn(Math, "random").mockReturnValue(0);
    vi.stubGlobal("matchMedia", vi.fn((query: string) => ({
      matches: false, media: query, addEventListener: vi.fn(), removeEventListener: vi.fn(),
    })));
  });
  afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); vi.useRealTimers(); });

  it("shows the framed introduction without navigation or background progression", async () => {
    render(<Exhibition />);
    expect(screen.getByRole("heading", { name: "Follow the white rabbit" })).toBeTruthy();
    expect(screen.getByText("请停下来。等待那只白兔出现。")).toBeTruthy();
    expect(screen.queryByRole("navigation")).toBeNull();
    expect(screen.queryByRole("button", { name: "Browse artworks" })).toBeNull();
    await advance(60000);
    expect(screen.queryByRole("button", { name: "Follow the White Rabbit" })).toBeNull();
    expect(screen.queryByAltText(artworks[0].alt)).toBeNull();
  });

  it("waits for the image load, entrance, dwell, and random wait without stealing focus", async () => {
    render(<Exhibition />);
    start();
    const stage = screen.getByRole("region", { name: "Artwork 1 of 14" });
    expect(document.activeElement).toBe(stage);
    await advance(60000);
    expect(screen.queryByRole("button", { name: "Follow the White Rabbit" })).toBeNull();
    await loadPhoto();
    await advance(500);
    await advance(1999);
    expect(screen.queryByRole("button", { name: "Follow the White Rabbit" })).toBeNull();
    await advance(1);
    await advance(499);
    expect(screen.queryByRole("button", { name: "Follow the White Rabbit" })).toBeNull();
    await advance(1);
    expect(screen.getByRole("button", { name: "Follow the White Rabbit" })).toBeTruthy();
    expect(screen.getByRole("status").textContent).toContain("ready to follow");
    expect(document.activeElement).toBe(stage);
    expect(screen.queryByRole("button", { name: "Next artwork" })).toBeNull();
    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(screen.getByAltText(artworks[0].alt)).toBeTruthy();
  });

  it.each([["Enter", "{Enter}"], ["Space", " "]])("supports Tab and %s to follow the rabbit once", async (_name, key) => {
    render(<Exhibition />);
    start();
    await reveal();
    vi.useRealTimers();
    const user = userEvent.setup();
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Follow the White Rabbit" }));
    await user.keyboard(key);
    expect(await screen.findByAltText(artworks[1].alt)).toBeTruthy();
  });

  it("completes all 14 photographs before unlocking END, then restores the directory after refresh", async () => {
    const view = render(<Exhibition />);
    start();
    for (let index = 0; index < artworks.length; index++) {
      expect(screen.getByAltText(artworks[index].alt)).toBeTruthy();
      expect(screen.queryByRole("button", { name: "Browse artworks" })).toBeNull();
      await reveal(index);
      const rabbit = screen.getByRole("button", { name: "Follow the White Rabbit" });
      fireEvent.click(rabbit);
      fireEvent.click(rabbit);
      expect(screen.queryByRole("heading", { name: "END" })).toBeNull();
      await advance(200);
    }
    expect(screen.getByRole("heading", { name: "END" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Restart" })).toBeNull();
    expect(sessionStorage.getItem(COMPLETION_KEY)).toBe("true");
    openDock();
    const dialog = screen.getByRole("dialog", { name: "Browse artworks" });
    expect(dialog.querySelectorAll("[data-card]")).toHaveLength(14);
    expect(within(dialog).getAllByRole("button", { name: /View artwork/ })).toHaveLength(7);
    selectFromGallery(4);
    await loadPhoto(3);
    expect(screen.getByRole("button", { name: "Follow the White Rabbit" })).toBeTruthy();
    view.unmount();
    render(<Exhibition />);
    expect(screen.getByRole("button", { name: "开始观看" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Browse artworks" })).toBeTruthy();
  });

  it("keeps rabbit position stable across directory open/close and restores keyboard focus", async () => {
    const { container } = restoreCompletedVisit();
    start(); await loadPhoto();
    const rabbit = screen.getByRole("button", { name: "Follow the White Rabbit" });
    const placement = rabbit.getAttribute("style");
    openDock();
    expect(screen.queryByRole("button", { name: "Follow the White Rabbit" })).toBeNull();
    expect(container.querySelector(".stage")?.hasAttribute("inert")).toBe(true);
    const close = screen.getByRole("button", { name: "Close gallery dock" });
    expect(document.activeElement).toBe(close);
    fireEvent.keyDown(window, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Close gallery" }));
    fireEvent.keyDown(window, { key: "Tab" });
    expect(document.activeElement).toBe(close);
    fireEvent.keyDown(window, { key: "Escape" });
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Browse artworks" }));
    expect(screen.getByRole("button", { name: "Follow the White Rabbit" }).getAttribute("style")).toBe(placement);
    openDock();
    fireEvent.click(container.querySelector(".dockBackdrop")!);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("keeps consecutive desktop rabbits on different permitted edges", async () => {
    render(<Exhibition />);
    start();
    await reveal();
    const first = screen.getByRole("button", { name: "Follow the White Rabbit" }).querySelector("img")?.getAttribute("src");
    fireEvent.click(screen.getByRole("button", { name: "Follow the White Rabbit" }));
    await advance(200);
    await reveal(1);
    const second = screen.getByRole("button", { name: "Follow the White Rabbit" }).querySelector("img")?.getAttribute("src");
    expect(first).toContain("bottom");
    expect(second).toContain("left");
  });

  it("uses a vertical safe edge on narrow screens", async () => {
    vi.stubGlobal("matchMedia", vi.fn((query: string) => ({
      matches: query.includes("max-width"), media: query, addEventListener: vi.fn(), removeEventListener: vi.fn(),
    })));
    restoreCompletedVisit();
    openDock();
    // This photograph only permits side edges on desktop.
    selectFromGallery(6);
    await loadPhoto(5);
    const rabbit = screen.getByRole("button", { name: "Follow the White Rabbit" });
    expect(rabbit.querySelector("img")?.getAttribute("src")).toContain("top");
  });

  it("does not replace the rabbit when the system requests reduced motion", async () => {
    vi.stubGlobal("matchMedia", vi.fn((query: string) => ({
      matches: query.includes("prefers-reduced-motion"), media: query, addEventListener: vi.fn(), removeEventListener: vi.fn(),
    })));
    render(<Exhibition />);
    start(); await reveal();
    expect(screen.getByRole("button", { name: "Follow the White Rabbit" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Next artwork" })).toBeNull();
  });

  it("works with unavailable session storage and treats a new session as incomplete", async () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new Error("blocked"); });
    render(<Exhibition />);
    start(); await reveal();
    expect(screen.getByRole("button", { name: "Follow the White Rabbit" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Browse artworks" })).toBeNull();
  });

  it("loads decorative directory thumbnails lazily and reaches END again from a revisited final photo", async () => {
    restoreCompletedVisit();
    openDock();
    const thumbnail = screen.getByRole("button", { name: "View artwork 1" }).querySelector("img");
    expect(thumbnail?.getAttribute("loading")).toBe("lazy");
    expect(thumbnail?.getAttribute("alt")).toBe("");
    selectFromGallery(14);
    await loadPhoto(13);
    fireEvent.click(screen.getByRole("button", { name: "Follow the White Rabbit" }));
    await advance(200);
    expect(screen.getByRole("heading", { name: "END" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Browse artworks" })).toBeTruthy();
  });
});
