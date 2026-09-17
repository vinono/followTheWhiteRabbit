import { describe, expect, it } from "vitest";
import { transitionExhibition } from "./exhibition-fsm";

describe("exhibition progression invariants", () => {
  it("enters and presents the final artwork before accepting an ending action", () => {
    const penultimateArtwork = {
      current: 12,
      status: "RABBIT_EXITING" as const,
      activeEdge: "left" as const,
      generation: 3,
    };

    const enteringFinalArtwork = transitionExhibition(
      penultimateArtwork,
      { type: "FINISH_EXIT", generation: 3 },
    );
    const viewingFinalArtwork = transitionExhibition(
      enteringFinalArtwork,
      { type: "FINISH_ENTERING", generation: 4 },
    );
    const ending = transitionExhibition(
      viewingFinalArtwork,
      { type: "END_EXHIBITION" },
    );

    expect(enteringFinalArtwork.status).toBe("ENTERING_ARTWORK");
    expect(viewingFinalArtwork.status).toBe("VIEWING_FINAL_ARTWORK");
    expect(ending.status).toBe("ENDING");
  });

  it("ignores a stale exit event after a newer artwork generation has started", () => {
    const exitingArtwork = {
      current: 4,
      status: "RABBIT_EXITING" as const,
      activeEdge: "right" as const,
      generation: 8,
    };

    const nextArtwork = transitionExhibition(
      exitingArtwork,
      { type: "FINISH_EXIT", generation: 8 },
    );
    const afterStaleExit = transitionExhibition(
      nextArtwork,
      { type: "FINISH_EXIT", generation: 8 },
    );

    expect(nextArtwork).toEqual({
      current: 5,
      status: "ENTERING_ARTWORK",
      activeEdge: null,
      generation: 9,
    });
    expect(afterStaleExit).toEqual(nextArtwork);
  });

  it("accepts only one activation for a visible rabbit", () => {
    const visibleRabbit = {
      current: 6,
      status: "RABBIT_VISIBLE" as const,
      activeEdge: "bottom" as const,
      generation: 12,
    };

    const exitingRabbit = transitionExhibition(
      visibleRabbit,
      { type: "CLICK_RABBIT" },
    );
    const afterRepeatedActivation = transitionExhibition(
      exitingRabbit,
      { type: "CLICK_RABBIT" },
    );

    expect(exitingRabbit.status).toBe("RABBIT_EXITING");
    expect(afterRepeatedActivation).toEqual(exitingRabbit);
  });

  it("resets a visible rabbit back to waiting when paused", () => {
    const visibleRabbit = {
      current: 3,
      status: "RABBIT_VISIBLE" as const,
      activeEdge: "top" as const,
      generation: 5,
    };

    const paused = transitionExhibition(visibleRabbit, {
      type: "PAUSE_TO_WAITING",
      generation: 5,
    });

    expect(paused).toEqual({
      current: 3,
      status: "WAITING_FOR_RABBIT",
      activeEdge: null,
      generation: 5,
    });
  });

  it("ignores PAUSE_TO_WAITING if not in RABBIT_VISIBLE state", () => {
    const viewingArtwork = {
      current: 2,
      status: "VIEWING" as const,
      activeEdge: null,
      generation: 4,
    };

    const result = transitionExhibition(viewingArtwork, {
      type: "PAUSE_TO_WAITING",
      generation: 4,
    });

    expect(result).toEqual(viewingArtwork);
  });
});
