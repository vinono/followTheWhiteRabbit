import { describe, expect, it } from "vitest";
import { transitionExhibition } from "./exhibition-fsm";

describe("exhibition progression invariants", () => {
  it("enters and presents the final artwork before accepting an ending action", () => {
    const penultimateArtwork = {
      current: 12,
      status: "RABBIT_EXITING" as const,
      activeEdge: "left" as const,
      session: 3,
    };

    const enteringFinalArtwork = transitionExhibition(
      penultimateArtwork,
      { type: "FINISH_EXIT", session: 3 },
      14,
    );
    const viewingFinalArtwork = transitionExhibition(
      enteringFinalArtwork,
      { type: "FINISH_ENTERING", session: 4 },
      14,
    );
    const ending = transitionExhibition(
      viewingFinalArtwork,
      { type: "END_EXHIBITION" },
      14,
    );

    expect(enteringFinalArtwork.status).toBe("ENTERING_ARTWORK");
    expect(viewingFinalArtwork.status).toBe("VIEWING_FINAL_ARTWORK");
    expect(ending.status).toBe("ENDING");
  });

  it("ignores a stale exit event after a newer artwork session has started", () => {
    const exitingArtwork = {
      current: 4,
      status: "RABBIT_EXITING" as const,
      activeEdge: "right" as const,
      session: 8,
    };

    const nextArtwork = transitionExhibition(
      exitingArtwork,
      { type: "FINISH_EXIT", session: 8 },
      14,
    );
    const afterStaleExit = transitionExhibition(
      nextArtwork,
      { type: "FINISH_EXIT", session: 8 },
      14,
    );

    expect(nextArtwork).toEqual({
      current: 5,
      status: "ENTERING_ARTWORK",
      activeEdge: null,
      session: 9,
    });
    expect(afterStaleExit).toEqual(nextArtwork);
  });

  it("accepts only one activation for a visible rabbit", () => {
    const visibleRabbit = {
      current: 6,
      status: "RABBIT_VISIBLE" as const,
      activeEdge: "bottom" as const,
      session: 12,
    };

    const exitingRabbit = transitionExhibition(
      visibleRabbit,
      { type: "CLICK_RABBIT" },
      14,
    );
    const afterRepeatedActivation = transitionExhibition(
      exitingRabbit,
      { type: "CLICK_RABBIT" },
      14,
    );

    expect(exitingRabbit.status).toBe("RABBIT_EXITING");
    expect(afterRepeatedActivation).toEqual(exitingRabbit);
  });
});
