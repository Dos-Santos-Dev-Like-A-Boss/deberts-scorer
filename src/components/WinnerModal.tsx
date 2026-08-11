import { PlayerNames, TeamId } from "@/lib/types";

interface Props {
  winner: TeamId;
  players: PlayerNames;
  usTotal: number;
  themTotal: number;
  onNewGame: () => void;
}

export default function WinnerModal({
  winner,
  players,
  usTotal,
  themTotal,
  onNewGame,
}: Props) {
  const winners = winner === "us" ? players.us : players.them;
  const score = winner === "us" ? usTotal : themTotal;
  const otherScore = winner === "us" ? themTotal : usTotal;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6">
      <div className="w-full max-w-sm rounded-2xl border border-neutral-700 bg-neutral-900 p-6 text-center">
        <div className="text-4xl">🏆</div>
        <h2 className="mt-3 text-xl font-bold text-neutral-50">
          Победила команда «{winner === "us" ? "Мы" : "Они"}»
        </h2>
        <p className="mt-1 text-sm text-neutral-400">
          {winners[0]} и {winners[1]}
        </p>
        <p className="mt-4 text-2xl font-bold tabular-nums text-neutral-50">
          {score} : {otherScore}
        </p>
        <button
          onClick={onNewGame}
          className="mt-6 w-full rounded-xl bg-sky-500 py-3 text-base font-semibold text-white active:bg-sky-600"
        >
          Новая игра
        </button>
      </div>
    </div>
  );
}
