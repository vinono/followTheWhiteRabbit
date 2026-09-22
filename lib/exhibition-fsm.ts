import { useCallback, useEffect, useReducer, useRef } from "react";
import { artworks, type RabbitEdge } from "../content/artworks";

export type ExhibitionState =
  | "INTRO"
  | "LOADING_ARTWORK"
  | "ENTERING_ARTWORK"
  | "VIEWING"
  | "WAITING_FOR_RABBIT"
  | "RABBIT_VISIBLE"
  | "RABBIT_EXITING"
  | "ENDING";

export interface RabbitPlacement { edge: RabbitEdge; position: number }
export interface ExhibitionModel {
  current: number;
  status: ExhibitionState;
  rabbit: RabbitPlacement | null;
  completed: boolean;
  generation: number;
}
export type ExhibitionAction =
  | { type: "START" }
  | { type: "RESTORE_COMPLETION" }
  | { type: "ARTWORK_LOADED"; generation: number; rabbit: RabbitPlacement }
  | { type: "FINISH_ENTERING"; generation: number }
  | { type: "DWELL_TIMEOUT"; generation: number }
  | { type: "SPAWN_RABBIT"; generation: number }
  | { type: "CLICK_RABBIT" }
  | { type: "FINISH_EXIT"; generation: number }
  | { type: "GOTO_ARTWORK"; index: number };

export const COMPLETION_KEY = "white-rabbit:completed:v2";
export const initialExhibition: ExhibitionModel = {
  current: 0, status: "INTRO", rabbit: null, completed: false, generation: 0,
};

function enterArtwork(state: ExhibitionModel, index: number): ExhibitionModel {
  return { ...state, current: index, status: "LOADING_ARTWORK", rabbit: null, generation: state.generation + 1 };
}

export function transitionExhibition(state: ExhibitionModel, action: ExhibitionAction): ExhibitionModel {
  if ("generation" in action && action.generation !== state.generation) return state;
  switch (action.type) {
    case "RESTORE_COMPLETION":
      return state.status === "INTRO" ? { ...state, completed: true } : state;
    case "START":
      return state.status === "INTRO" ? enterArtwork(state, 0) : state;
    case "ARTWORK_LOADED":
      if (state.status !== "LOADING_ARTWORK") return state;
      return state.completed
        ? { ...state, status: "VIEWING", rabbit: null }
        : { ...state, status: "ENTERING_ARTWORK", rabbit: action.rabbit };
    case "FINISH_ENTERING":
      return state.status === "ENTERING_ARTWORK" ? { ...state, status: "VIEWING" } : state;
    case "DWELL_TIMEOUT":
      if (state.status !== "VIEWING") return state;
      return state.completed ? state : { ...state, status: "WAITING_FOR_RABBIT" };
    case "SPAWN_RABBIT":
      return state.status === "WAITING_FOR_RABBIT" ? { ...state, status: "RABBIT_VISIBLE" } : state;
    case "CLICK_RABBIT":
      return state.status === "RABBIT_VISIBLE" ? { ...state, status: "RABBIT_EXITING" } : state;
    case "FINISH_EXIT":
      if (state.status !== "RABBIT_EXITING") return state;
      return state.current === artworks.length - 1
        ? { ...state, status: "ENDING", rabbit: null, completed: true, generation: state.generation + 1 }
        : enterArtwork(state, state.current + 1);
    case "GOTO_ARTWORK":
      return state.completed && Number.isInteger(action.index) && action.index >= 0 && action.index < artworks.length
        ? enterArtwork(state, action.index) : state;
  }
}

export function useExhibitionFSM(isDockOpen: boolean) {
  const [state, dispatch] = useReducer(transitionExhibition, initialExhibition);
  const lastEdgeRef = useRef<RabbitEdge | null>(null);
  const { current, status, generation, completed } = state;

  useEffect(() => {
    try {
      if (sessionStorage.getItem(COMPLETION_KEY) === "true") dispatch({ type: "RESTORE_COMPLETION" });
    } catch { /* Storage is optional; the in-memory journey still works. */ }
  }, []);

  useEffect(() => {
    if (!completed) return;
    try { sessionStorage.setItem(COMPLETION_KEY, "true"); } catch { /* Keep the current session usable. */ }
  }, [completed]);

  const choosePlacement = useCallback((): RabbitPlacement => {
    const allowed = artworks[current].allowedEdges;
    const permitted: RabbitEdge[] = allowed?.length ? allowed : ["top", "bottom", "left", "right"];
    const narrow = window.matchMedia("(max-width: 760px)").matches;
    const vertical = permitted.filter((edge) => edge === "top" || edge === "bottom");
    const edges: RabbitEdge[] = narrow ? (vertical.length ? vertical : ["top", "bottom"]) : permitted;
    const alternatives = edges.filter((edge) => edge !== lastEdgeRef.current);
    const candidates = alternatives.length ? alternatives : edges;
    const edge = candidates[Math.floor(Math.random() * candidates.length)];
    lastEdgeRef.current = edge;
    return { edge, position: 28 + Math.random() * 44 };
  }, [current]);

  useEffect(() => {
    if (isDockOpen) return;
    let delay: number;
    let action: ExhibitionAction;
    switch (status) {
      case "ENTERING_ARTWORK": delay = 500; action = { type: "FINISH_ENTERING", generation }; break;
      case "VIEWING": delay = 2000; action = { type: "DWELL_TIMEOUT", generation }; break;
      case "WAITING_FOR_RABBIT":
        delay = 500 + Math.floor(Math.random() * 501);
        action = { type: "SPAWN_RABBIT", generation };
        break;
      case "RABBIT_EXITING": delay = 200; action = { type: "FINISH_EXIT", generation }; break;
      default: return;
    }
    const timer = setTimeout(() => dispatch(action), delay);
    return () => clearTimeout(timer);
  }, [status, generation, isDockOpen]);

  const onArtworkLoaded = useCallback(() => {
    if (status !== "LOADING_ARTWORK") return;
    dispatch({ type: "ARTWORK_LOADED", generation, rabbit: choosePlacement() });
  }, [status, generation, choosePlacement]);
  const startExhibition = useCallback(() => dispatch({ type: "START" }), []);
  const onRabbitClick = useCallback(() => dispatch({ type: "CLICK_RABBIT" }), []);
  const gotoArtwork = useCallback((index: number) => dispatch({ type: "GOTO_ARTWORK", index }), []);

  return { ...state, onArtworkLoaded, startExhibition, onRabbitClick, gotoArtwork };
}
