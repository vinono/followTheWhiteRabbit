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
  | { type: "FINISH_ENTERING"; session: number }
  | { type: "DWELL_TIMEOUT"; session: number }
  | { type: "SPAWN_RABBIT"; edge: RabbitEdge; session: number }
  | { type: "CLICK_RABBIT" }
  | { type: "FINISH_EXIT"; session: number }
  | { type: "GOTO_ARTWORK"; index: number }
  | { type: "END_EXHIBITION" }
  | { type: "RESTART" };

export interface ExhibitionModel {
  current: number;
  status: ExhibitionState;
  activeEdge: RabbitEdge | null;
  session: number;
}

const DWELL_TIME_MS = 6000;
const MIN_RANDOM_WAIT_MS = 2000;
const MAX_RANDOM_WAIT_MS = 4000;
const RABBIT_EXIT_MS = 300;

export function transitionExhibition(
  state: ExhibitionModel,
  action: ExhibitionAction,
  artworkCount = artworks.length,
): ExhibitionModel {
  if ("session" in action && action.session !== state.session) {
    return state;
  }

  switch (action.type) {
    case "FINISH_ENTERING":
      if (state.current >= artworkCount - 1) {
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
        const nextIndex = Math.min(state.current + 1, artworkCount - 1);
        return {
          current: nextIndex,
          status: "ENTERING_ARTWORK",
          activeEdge: null,
          session: state.session + 1,
        };
      }
      return state;

    case "GOTO_ARTWORK":
      return {
        current: Math.max(0, Math.min(action.index, artworkCount - 1)),
        status: "ENTERING_ARTWORK",
        activeEdge: null,
        session: state.session + 1,
      };

    case "END_EXHIBITION":
      if (state.status === "VIEWING_FINAL_ARTWORK") {
        return { ...state, status: "ENDING", activeEdge: null };
      }
      return state;

    case "RESTART":
      return {
        current: 0,
        status: "ENTERING_ARTWORK",
        activeEdge: null,
        session: state.session + 1,
      };

    default:
      return state;
  }
}

function exhibitionReducer(state: ExhibitionModel, action: ExhibitionAction) {
  return transitionExhibition(state, action);
}

export function useExhibitionFSM(isOverlayOpen: boolean) {
  const [state, dispatch] = useReducer(exhibitionReducer, {
    current: 0,
    status: "ENTERING_ARTWORK",
    activeEdge: null,
    session: 0,
  });

  const { current, status, activeEdge, session } = state;

  const dwellTimerRef = useRef<NodeJS.Timeout | null>(null);
  const randomTimerRef = useRef<NodeJS.Timeout | null>(null);
  const exitTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastEdgeRef = useRef<RabbitEdge | null>(null);

  const clearAllTimers = useCallback(() => {
    if (dwellTimerRef.current) clearTimeout(dwellTimerRef.current);
    if (randomTimerRef.current) clearTimeout(randomTimerRef.current);
    if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
    dwellTimerRef.current = null;
    randomTimerRef.current = null;
    exitTimerRef.current = null;
  }, []);

  // Handle ENTERING_ARTWORK -> VIEWING transition
  useEffect(() => {
    if (status === "ENTERING_ARTWORK") {
      const enterTimer = setTimeout(() => {
        dispatch({ type: "FINISH_ENTERING", session });
      }, 700);
      return () => clearTimeout(enterTimer);
    }
  }, [status, current, session]);

  // Handle Dwell Timer and Rabbit Spawning
  useEffect(() => {
    clearAllTimers();

    if (isOverlayOpen || status === "ENDING") {
      return;
    }

    if (status === "VIEWING") {
      dwellTimerRef.current = setTimeout(() => {
        dispatch({ type: "DWELL_TIMEOUT", session });
      }, DWELL_TIME_MS);
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
        dispatch({ type: "SPAWN_RABBIT", edge: chosenEdge, session });
      }, randomDelay);
    }

    return () => clearAllTimers();
  }, [status, current, session, isOverlayOpen, clearAllTimers]);

  // Handle Rabbit Click & Exit timer
  const onRabbitClick = useCallback(() => {
    if (state.status === "RABBIT_VISIBLE") {
      dispatch({ type: "CLICK_RABBIT" });
      exitTimerRef.current = setTimeout(() => {
        dispatch({ type: "FINISH_EXIT", session });
      }, RABBIT_EXIT_MS);
    }
  }, [state.status, session]);

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
