import { describe, expect, it } from "vitest";
import { initialExhibition, transitionExhibition, type ExhibitionModel, type RabbitPlacement } from "./exhibition-fsm";
import { artworks } from "../content/artworks";

const rabbit: RabbitPlacement = { edge: "top", position: 42 };

describe("exhibition progression invariants", () => {
  it("requires Start and a loaded photo before the viewing rhythm begins", () => {
    expect(transitionExhibition(initialExhibition, { type: "FINISH_ENTERING", generation: 0 })).toBe(initialExhibition);
    expect(transitionExhibition(initialExhibition, { type: "CLICK_RABBIT" })).toBe(initialExhibition);
    const loading = transitionExhibition(initialExhibition, { type: "START" });
    expect(loading.status).toBe("LOADING_ARTWORK");
    expect(transitionExhibition(loading, { type: "FINISH_ENTERING", generation: 1 })).toBe(loading);
    const entering = transitionExhibition(loading, { type: "ARTWORK_LOADED", generation: 1, rabbit });
    expect(entering.status).toBe("ENTERING_ARTWORK");
    expect(transitionExhibition(entering, { type: "FINISH_ENTERING", generation: 1 }).status).toBe("VIEWING");
  });

  it("presents the final photo with its full rhythm and unlocks only after following its rabbit", () => {
    const penultimate: ExhibitionModel = { ...initialExhibition, current: artworks.length - 2, status: "RABBIT_EXITING", rabbit, generation: 3 };
    const loading = transitionExhibition(penultimate, { type: "FINISH_EXIT", generation: 3 });
    expect(loading.current).toBe(artworks.length - 1);
    expect(loading.completed).toBe(false);
    const entering = transitionExhibition(loading, { type: "ARTWORK_LOADED", generation: 4, rabbit });
    const viewing = transitionExhibition(entering, { type: "FINISH_ENTERING", generation: 4 });
    expect(viewing.status).toBe("VIEWING");
    expect(transitionExhibition(viewing, { type: "CLICK_RABBIT" })).toBe(viewing);
    const waiting = transitionExhibition(viewing, { type: "DWELL_TIMEOUT", generation: 4 });
    const visible = transitionExhibition(waiting, { type: "SPAWN_RABBIT", generation: 4 });
    expect(visible.completed).toBe(false);
    const exiting = transitionExhibition(visible, { type: "CLICK_RABBIT" });
    expect(exiting.completed).toBe(false);
    const ending = transitionExhibition(exiting, { type: "FINISH_EXIT", generation: 4 });
    expect(ending.status).toBe("ENDING");
    expect(ending.completed).toBe(true);
    expect(ending.rabbit).toBeNull();
  });

  it("rejects direct navigation before completion and invalid indices afterwards", () => {
    expect(transitionExhibition(initialExhibition, { type: "GOTO_ARTWORK", index: 13 })).toBe(initialExhibition);
    const completed = { ...initialExhibition, completed: true };
    for (const index of [-1, 14, 0.5, NaN]) {
      expect(transitionExhibition(completed, { type: "GOTO_ARTWORK", index })).toBe(completed);
    }
    expect(transitionExhibition(completed, { type: "GOTO_ARTWORK", index: 5 }).current).toBe(5);
  });

  it("ignores stale load and exit events and repeated activation", () => {
    const visible: ExhibitionModel = { ...initialExhibition, current: 4, status: "RABBIT_VISIBLE", rabbit, generation: 8 };
    const exiting = transitionExhibition(visible, { type: "CLICK_RABBIT" });
    expect(transitionExhibition(exiting, { type: "CLICK_RABBIT" })).toBe(exiting);
    const next = transitionExhibition(exiting, { type: "FINISH_EXIT", generation: 8 });
    expect(next.current).toBe(5);
    expect(next.generation).toBe(9);
    expect(transitionExhibition(next, { type: "FINISH_EXIT", generation: 8 })).toBe(next);
    expect(transitionExhibition(next, { type: "ARTWORK_LOADED", generation: 8, rabbit })).toBe(next);
  });

  it("restores completion without skipping intro, and keeps revisited photos in quiet viewing mode without rabbit", () => {
    const restored = transitionExhibition(initialExhibition, { type: "RESTORE_COMPLETION" });
    expect(restored.status).toBe("INTRO");
    const loading = transitionExhibition(restored, { type: "GOTO_ARTWORK", index: 7 });
    const ready = transitionExhibition(loading, { type: "ARTWORK_LOADED", generation: loading.generation, rabbit });
    expect(ready.status).toBe("VIEWING");
    expect(ready.rabbit).toBeNull();
  });
});
