"use client";

import { useCallback, useEffect, useMemo, useReducer } from "react";
import { computeGame, GameSummary } from "@/lib/gameEngine";
import { clearState, loadState, saveState } from "@/lib/storage";
import { GameConfig, PersistedState, TeamNames, RoundInput } from "@/lib/types";

type Action =
  | { type: "HYDRATE"; state: PersistedState }
  | { type: "START_GAME"; players: TeamNames; config: GameConfig }
  | { type: "ADD_ROUND"; input: Omit<RoundInput, "id"> }
  | { type: "UNDO_LAST_ROUND" }
  | { type: "RESET_GAME" };

function reducer(state: PersistedState, action: Action): PersistedState {
  switch (action.type) {
    case "HYDRATE":
      return action.state;
    case "START_GAME":
      return {
        phase: "playing",
        players: action.players,
        config: action.config,
        rounds: [],
      };
    case "ADD_ROUND": {
      if (state.phase === "setup") return state;
      const nextId = state.rounds.length
        ? state.rounds[state.rounds.length - 1].id + 1
        : 1;
      const rounds = [...state.rounds, { ...action.input, id: nextId }];
      const summary = computeGame(state.config, rounds);
      return {
        ...state,
        rounds,
        phase: summary.winner ? "finished" : "playing",
      };
    }
    case "UNDO_LAST_ROUND": {
      if (state.phase === "setup" || state.rounds.length === 0) return state;
      const rounds = state.rounds.slice(0, -1);
      return { ...state, rounds, phase: "playing" };
    }
    case "RESET_GAME":
      clearState();
      return { phase: "setup" };
    default:
      return state;
  }
}

export function useDebertsGame() {
  const [state, dispatch] = useReducer(reducer, { phase: "setup" });

  useEffect(() => {
    const saved = loadState();
    if (saved) dispatch({ type: "HYDRATE", state: saved });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const summary: GameSummary | null = useMemo(() => {
    if (state.phase === "setup") return null;
    return computeGame(state.config, state.rounds);
  }, [state]);

  const startGame = useCallback(
    (players: TeamNames, config: GameConfig) =>
      dispatch({ type: "START_GAME", players, config }),
    []
  );

  const addRound = useCallback(
    (input: Omit<RoundInput, "id">) => dispatch({ type: "ADD_ROUND", input }),
    []
  );

  const undoLastRound = useCallback(
    () => dispatch({ type: "UNDO_LAST_ROUND" }),
    []
  );

  const resetGame = useCallback(() => dispatch({ type: "RESET_GAME" }), []);

  return { state, summary, startGame, addRound, undoLastRound, resetGame };
}
