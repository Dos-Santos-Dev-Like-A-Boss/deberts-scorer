"use client";

import { useDebertsGame } from "@/hooks/useDebertsGame";
import SetupForm from "@/components/SetupForm";
import RoundEntryForm from "@/components/RoundEntryForm";
import ScoreBoard from "@/components/ScoreBoard";
import HistoryList from "@/components/HistoryList";
import WinnerModal from "@/components/WinnerModal";

export default function Home() {
  const { state, summary, startGame, addRound, undoLastRound, resetGame } =
    useDebertsGame();

  if (state.phase === "setup") {
    return (
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 pt-6">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-neutral-50">Деберц 2×2</h1>
          <p className="text-sm text-neutral-500">Настройка новой игры</p>
        </header>
        <SetupForm onStart={startGame} />
      </main>
    );
  }

  if (!summary) return null;

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 pb-10 pt-6">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-neutral-50">Деберц 2×2</h1>
        <button
          onClick={resetGame}
          className="text-xs font-medium text-neutral-500 active:text-neutral-300"
        >
          Новая игра
        </button>
      </header>

      <ScoreBoard players={state.players} config={state.config} summary={summary} />

      {state.phase === "playing" && (
        <section className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-4">
          <h2 className="mb-4 text-sm font-medium text-neutral-400">
            Новый раунд
          </h2>
          <RoundEntryForm players={state.players} onSubmit={addRound} />
        </section>
      )}

      <HistoryList
        results={summary.results}
        players={state.players}
        config={state.config}
        onUndo={undoLastRound}
      />

      {state.phase === "finished" && summary.winner && (
        <WinnerModal
          winner={summary.winner}
          players={state.players}
          usTotal={summary.usTotal}
          themTotal={summary.themTotal}
          onNewGame={resetGame}
        />
      )}
    </main>
  );
}
