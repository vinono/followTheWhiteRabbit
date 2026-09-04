import { useCallback, useEffect, useReducer, useRef } from "react";
import { artworks, RabbitEdge } from "../content/artworks";

export type ExhibitionState =
  | "ENTERING_ARTWORK"
  | "VIEWING"
  | "WAITING_FOR_RABBIT"
  | "RABBIT_VISIBLE"
  | "RABBIT_EXITING"
  | "TRANSITIONING"
  | "ENDING";

type FSMAction =
  | { type: "FINISH_ENTERING" }
  | { type: "DWELL_TIMEOUT" }
  | { type: "SPAWN_RABBIT"; edge: RabbitEdge }
  | { type: "CLICK_RABBIT" }
  | { type: "FINISH_EXIT" }
  | { type: "GOTO_ARTWORK"; index: number }
  | { type: "RESTART" };

interface FSMState {
  current: number;
  status: ExhibitionState;
  activeEdge: RabbitEdge | null;
}

const DWELL_TIME_MS = 6000;
const MIN_RANDOM_WAIT_MS = 2000;
const MAX_RANDOM_WAIT_MS = 4000;
const RABBIT_EXIT_MS = 300;

function fsmReducer(state: FSMState, action: FSMAction): FSMState {
  switch (action.type) {
    case "FINISH_ENTERING":
      if (state.current >= artworks.length - 1) {
        return { ...state, status: "ENDING", activeEdge: null };
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
        const nextIndex = Math.min(state.current + 1, artworks.length - 1);
        const isEnd = nextIndex >= artworks.length - 1;
        return {
          current: nextIndex,
          status: isEnd ? "ENDING" : "ENTERING_ARTWORK",
          activeEdge: null,
        };
      }
      return state;

    case "GOTO_ARTWORK":
      const isTargetEnd = action.index >= artworks.length - 1;
      return {
        current: Math.max(0, Math.min(action.index, artworks.length - 1)),
        status: isTargetEnd ? "ENDING" : "ENTERING_ARTWORK",
        activeEdge: null,
      };

    case "RESTART":
      return {
        current: 0,
        status: "ENTERING_ARTWORK",
        activeEdge: null,
      };

    default:
      return state;
  }
}

export function useExhibitionFSM(isOverlayOpen: boolean) {
  const [state, dispatch] = useReducer(fsmReducer, {
    current: 0,
    status: "ENTERING_ARTWORK",
    activeEdge: null,
  });

  const { current, status, activeEdge } = state;

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
        dispatch({ type: "FINISH_ENTERING" });
      }, 700);
      return () => clearTimeout(enterTimer);
    }
  }, [status, current]);

  // Handle Dwell Timer and Rabbit Spawning
  useEffect(() => {
    clearAllTimers();

    if (isOverlayOpen || status === "ENDING") {
      return;
    }

    if (status === "VIEWING") {
      dwellTimerRef.current = setTimeout(() => {
        dispatch({ type: "DWELL_TIMEOUT" });
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
        dispatch({ type: "SPAWN_RABBIT", edge: chosenEdge });
      }, randomDelay);
    }

    return () => clearAllTimers();
  }, [status, current, isOverlayOpen, clearAllTimers]);

  // Handle Rabbit Click & Exit timer
  const onRabbitClick = useCallback(() => {
    if (state.status === "RABBIT_VISIBLE") {
      dispatch({ type: "CLICK_RABBIT" });
      exitTimerRef.current = setTimeout(() => {
        dispatch({ type: "FINISH_EXIT" });
      }, RABBIT_EXIT_MS);
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

  return {
    current: state.current,
    status: state.status,
    activeEdge: state.activeEdge,
    onRabbitClick,
    gotoArtwork,
    restartExhibition,
  };
}
