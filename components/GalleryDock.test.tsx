import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { GalleryDock } from "./GalleryDock";

function setup(current: number | null = null) {
  const onChoose = vi.fn();
  const onClose = vi.fn();
  const view = render(<GalleryDock current={current} dialogRef={null} onChoose={onChoose} onClose={onClose} />);
  return { ...view, onChoose, onClose };
}

function centred(number: number) {
  expect(screen.getByRole("button", { name: `View artwork ${number}` }).tabIndex).toBe(0);
}

describe("circular photograph gallery", () => {
  it("opens on the viewed photo and wraps both directions without selecting a work", () => {
    const { onChoose } = setup(13);
    centred(14);
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "ArrowRight" });
    centred(1);
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "ArrowLeft" });
    centred(14);
    expect(onChoose).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "View artwork 14" }));
    expect(onChoose).toHaveBeenCalledWith(13);
  });

  it("supports arrow keys within the modal and keeps rear cards out of keyboard navigation", () => {
    const { container } = setup();
    const dialog = screen.getByRole("dialog");
    fireEvent.keyDown(dialog, { key: "ArrowLeft" });
    centred(14);
    fireEvent.keyDown(dialog, { key: "ArrowRight" });
    centred(1);
    const rear = container.querySelectorAll('button[data-card][aria-hidden="true"]');
    expect(rear.length).toBe(7);
    for (const card of rear) {
      expect(card.getAttribute("tabindex")).toBe("-1");
      expect(card.hasAttribute("inert")).toBe(true);
    }
  });

  it("rotates after a horizontal swipe and suppresses its trailing click", () => {
    class TestPointerEvent extends MouseEvent {
      pointerId = 1;
      isPrimary = true;
    }
    vi.stubGlobal("PointerEvent", TestPointerEvent);
    try {
      const { onChoose } = setup();
      const orbit = screen.getByLabelText("环形照片画廊");
      Object.defineProperty(orbit, "clientWidth", { value: 400 });
      orbit.setPointerCapture = vi.fn();
      orbit.hasPointerCapture = () => true;
      orbit.releasePointerCapture = vi.fn();
      fireEvent.pointerDown(orbit, { clientX: 220, clientY: 100, button: 0 });
      fireEvent.pointerMove(orbit, { clientX: 140, clientY: 105 });
      fireEvent.pointerUp(orbit, { clientX: 140, clientY: 105 });
      centred(2);
      fireEvent.click(screen.getByRole("button", { name: "View artwork 2" }));
      expect(onChoose).not.toHaveBeenCalled();
      fireEvent.pointerDown(orbit, { clientX: 200, clientY: 100, button: 0 });
      fireEvent.pointerUp(orbit, { clientX: 200, clientY: 100 });
      fireEvent.click(screen.getByRole("button", { name: "View artwork 2" }));
      expect(onChoose).toHaveBeenCalledWith(1);
    } finally { vi.unstubAllGlobals(); }
  });

  it("does not rotate for a vertical gesture or a cancelled drag", () => {
    class TestPointerEvent extends MouseEvent {
      pointerId = 1;
      isPrimary = true;
    }
    vi.stubGlobal("PointerEvent", TestPointerEvent);
    try {
      setup();
      const orbit = screen.getByLabelText("环形照片画廊");
      orbit.setPointerCapture = vi.fn();
      orbit.hasPointerCapture = () => false;
      fireEvent.pointerDown(orbit, { clientX: 200, clientY: 100, button: 0 });
      fireEvent.pointerMove(orbit, { clientX: 203, clientY: 180 });
      fireEvent.pointerUp(orbit, { clientX: 203, clientY: 180 });
      centred(1);
      fireEvent.pointerDown(orbit, { clientX: 200, clientY: 100, button: 0 });
      fireEvent.pointerMove(orbit, { clientX: 100, clientY: 100 });
      fireEvent.pointerCancel(orbit, { clientX: 100, clientY: 100 });
      centred(1);
    } finally { vi.unstubAllGlobals(); }
  });
});
