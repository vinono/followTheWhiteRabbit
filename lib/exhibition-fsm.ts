import { useCallback, useEffect, useReducer, useRef } from "react";
import { artworks, RabbitEdge } from "../content/artworks";

export type ExhibitionState =
  | "ENTERING_ARTWORK"
  | "VIEWING"
  | "WAITING_FOR_RABBIT"
  | "RABBIT_VISIBLE"
  | "RABBIT_EXITING"
  | "TRANSITIONING"
  | "VIEWING_FINAL_ARTWORK"
  | "ENDING";

export type ExhibitionAction =
  | { type: "FINISH_ENTERING"; generation: number }
  | { type: "DWELL_TIMEOUT"; generation: number }
  | { type: "SPAWN_RABBIT"; edge: RabbitEdge; generation: number }
  | { type: "CLICK_RABBIT" }
  | { type: "FINISH_EXIT"; generation: number }
  | { type: "GOTO_ARTWORK"; index: number }
  | { type: "PAUSE_TO_WAITING"; generation: number }
  | { type: "END_EXHIBITION" }
  | { type: "RESTART" };

export interface ExhibitionModel {
  current: number;
  status: ExhibitionState;
  activeEdge: RabbitEdge | null;
  generation: number;
}

const DWELL_TIME_MS = 6000;
const MIN_RANDOM_WAIT_MS = 2000;
const MAX_RANDOM_WAIT_MS = 4000;
const RABBIT_EXIT_MS = 300;

function enterArtwork(state: ExhibitionModel, index: number): ExhibitionModel {
  return {
    current: Math.max(0, Math.min(index, artworks.length - 1)),
    status: "ENTERING_ARTWORK",
    activeEdge: null,
    generation: state.generation + 1,
  };
}

export function transitionExhibition(
  state: ExhibitionModel,
  action: ExhibitionAction,
): ExhibitionModel {
  if ("generation" in action && action.generation !== state.generation) {
    return state;
  }

  switch (action.type) {
    case "FINISH_ENTERING":
      if (state.current >= artworks.length - 1) {
        return { ...state, status: "VIEWING_FINAL_ARTWORK", activeEdge: null };
      }
      return { ...state, status: "VIEWING", activeEdge: null };

    case "DWELL_TIMEOUT":
      if (state.status === "VIEWING") {
        return { ...state, status: "WAITING_FOR_RABBIT" };
      }
      return state;

    case "SPAWN_RABBIT":
      if (state.status === "WAITING_FOR_RABBIT") {
        return { ...state, status: "RABBIT_VISIBLE", activeEdge: action.edge };
      }
      return state;

    case "CLICK_RABBIT":
      if (state.status === "RABBIT_VISIBLE") {
        return { ...state, status: "RABBIT_EXITING" };
      }
      return state;

    case "FINISH_EXIT":
      if (state.status === "RABBIT_EXITING") {
        return enterArtwork(state, state.current + 1);
      }
      return state;

    case "GOTO_ARTWORK":
      return enterArtwork(state, action.index);

    case "PAUSE_TO_WAITING":
      if (state.status === "RABBIT_VISIBLE") {
        return { ...state, status: "WAITING_FOR_RABBIT", activeEdge: null };
      }
      return state;

    case "END_EXHIBITION":
      if (state.status === "VIEWING_FINAL_ARTWORK") {
        return { ...state, status: "ENDING", activeEdge: null };
      }
      return state;

    case "RESTART":
      return enterArtwork(state, 0);

    default:
      return state;
  }
}

export function useExhibitionFSM(isOverlayOpen: boolean, prefersReducedMotion: boolean = false) {
  const [state, dispatch] = useReducer(transitionExhibition, {
    current: 0,
    status: "ENTERING_ARTWORK",
    activeEdge: null,
    generation: 0,
  });

  const { current, status, activeEdge, generation } = state;

  const dwellTimerRef = useRef<NodeJS.Timeout | null>(null);
  const randomTimerRef = useRef<NodeJS.Timeout | null>(null);
  const exitTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastEdgeRef = useRef<RabbitEdge | null>(null);
  const dwellRemainingRef = useRef<number>(DWELL_TIME_MS);
  const dwellStartTimeRef = useRef<number | null>(null);

  useEffect(() => {
    dwellRemainingRef.current = DWELL_TIME_MS;
    dwellStartTimeRef.current = null;
  }, [generation]);

  const clearRabbitScheduleTimers = useCallback(() => {
    if (dwellTimerRef.current) clearTimeout(dwellTimerRef.current);
    if (randomTimerRef.current) clearTimeout(randomTimerRef.current);
    dwellTimerRef.current = null;
    randomTimerRef.current = null;
  }, []);

  const clearAllTimers = useCallback(() => {
    clearRabbitScheduleTimers();
    if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
    exitTimerRef.current = null;
    dwellRemainingRef.current = DWELL_TIME_MS;
    dwellStartTimeRef.current = null;
  }, [clearRabbitScheduleTimers]);

  // Handle ENTERING_ARTWORK -> VIEWING transition
  useEffect(() => {
    if (status === "ENTERING_ARTWORK") {
      const enterTimer = setTimeout(() => {
        dispatch({ type: "FINISH_ENTERING", generation });
      }, 700);
      return () => clearTimeout(enterTimer);
    }
  }, [status, current, generation]);

  // Hide rabbit and reset to waiting phase when overlay opens or reduced motion is active
  useEffect(() => {
    if ((isOverlayOpen || prefersReducedMotion) && status === "RABBIT_VISIBLE") {
      dispatch({ type: "PAUSE_TO_WAITING", generation });
    }
  }, [isOverlayOpen, prefersReducedMotion, status, generation]);

  // Handle Dwell Timer and Rabbit Spawning
  useEffect(() => {
    clearRabbitScheduleTimers();

    if (
      prefersReducedMotion ||
      isOverlayOpen ||
      status === "ENDING" ||
      status === "VIEWING_FINAL_ARTWORK"
    ) {
      return;
    }

    if (status === "VIEWING") {
      dwellStartTimeRef.current = Date.now();
      const delay = Math.max(0, dwellRemainingRef.current);
      dwellTimerRef.current = setTimeout(() => {
        dwellRemainingRef.current = 0;
        dwellStartTimeRef.current = null;
        dispatch({ type: "DWELL_TIMEOUT", generation });
      }, delay);
    } else if (status === "WAITING_FOR_RABBIT") {
      const currentArtwork = artworks[current];
      const allowed = currentArtwork?.allowedEdges?.length
        ? currentArtwork.allowedEdges
        : (["left", "right", "bottom", "top"] as RabbitEdge[]);

      // Pick edge, avoiding consecutive duplicate
      const filtered = allowed.filter((e) => e !== lastEdgeRef.current);
      const candidates = filtered.length > 0 ? filtered : allowed;
      const chosenEdge = candidates[Math.floor(Math.random() * candidates.length)];
      lastEdgeRef.current = chosenEdge;

      const randomDelay =
        MIN_RANDOM_WAIT_MS +
        Math.floor(Math.random() * (MAX_RANDOM_WAIT_MS - MIN_RANDOM_WAIT_MS));

      randomTimerRef.current = setTimeout(() => {
        dispatch({ type: "SPAWN_RABBIT", edge: chosenEdge, generation });
      }, randomDelay);
    }

    return () => {
      if (dwellStartTimeRef.current !== null) {
        const elapsed = Date.now() - dwellStartTimeRef.current;
        dwellRemainingRef.current = Math.max(0, dwellRemainingRef.current - elapsed);
        dwellStartTimeRef.current = null;
      }
      clearRabbitScheduleTimers();
    };
  }, [status, current, generation, isOverlayOpen, prefersReducedMotion, clearRabbitScheduleTimers]);

  useEffect(() => {
    if (status !== "RABBIT_EXITING") {
      return;
    }

    exitTimerRef.current = setTimeout(() => {
      dispatch({ type: "FINISH_EXIT", generation });
    }, RABBIT_EXIT_MS);

    return () => {
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
      exitTimerRef.current = null;
    };
  }, [status, generation]);

  // Handle Rabbit Click & Exit timer
  const onRabbitClick = useCallback(() => {
    if (state.status === "RABBIT_VISIBLE") {
      dispatch({ type: "CLICK_RABBIT" });
    }
  }, [state.status]);

  const gotoArtwork = useCallback(
    (index: number) => {
      clearAllTimers();
      dispatch({ type: "GOTO_ARTWORK", index });
    },
    [clearAllTimers]
  );

  const restartExhibition = useCallback(() => {
    clearAllTimers();
    dispatch({ type: "RESTART" });
  }, [clearAllTimers]);

  const endExhibition = useCallback(() => {
    clearAllTimers();
    dispatch({ type: "END_EXHIBITION" });
  }, [clearAllTimers]);

  return {
    current: state.current,
    status: state.status,
    activeEdge: state.activeEdge,
    onRabbitClick,
    gotoArtwork,
    endExhibition,
    restartExhibition,
  };
}
