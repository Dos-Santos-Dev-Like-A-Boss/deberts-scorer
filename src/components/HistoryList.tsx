import { RoundResult, PlayerNames, GameConfig } from "@/lib/types";

interface Props {
  results: RoundResult[];
  players: PlayerNames;
  config: GameConfig;
  onUndo: () => void;
}

export default function HistoryList({ results, players, config, onUndo }: Props) {
  if (results.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-neutral-500">
        Раундов пока нет — запишите первый выше.
      </p>
    );
  }

  const teamLabel = (team: "us" | "them") => (team === "us" ? "Мы" : "Они");

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-neutral-400">
          История раундов
        </h3>
        <button
          onClick={onUndo}
          className="text-xs font-medium text-rose-400 active:text-rose-300"
        >
          Отменить последний
        </button>
      </div>
      <ul className="flex flex-col gap-2">
        {[...results].reverse().map((r) => (
          <li
            key={r.id}
            className="rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm"
          >
            <div className="flex items-center justify-between text-neutral-300">
              <span className="font-medium">
                Раунд {r.id} · играли {teamLabel(r.callingTeam)}
              </span>
              <span className="tabular-nums text-neutral-500">
                {r.total} очк.
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between text-xs">
              <span className="text-sky-400">
                Мы {r.usPoints > 0 ? `+${r.usPoints}` : r.usPoints}
              </span>
              <span className="text-rose-400">
                Они {r.themPoints > 0 ? `+${r.themPoints}` : r.themPoints}
              </span>
            </div>
            {r.bzTeam && (
              <div className="mt-1 text-xs font-medium text-amber-400">
                БЗ у {teamLabel(r.bzTeam)} · штраф {config.bzPenalty}
              </div>
            )}
            {r.isBye && !r.bzTeam && (
              <div className="mt-1 text-xs font-medium text-amber-400">
                Байт у {teamLabel(r.callingTeam)} — все очки сопернику
              </div>
            )}
            {r.isThreeBye && (
              <div className="mt-1 text-xs font-medium text-red-500">
                3-й байт у {teamLabel(r.callingTeam)} — доп. штраф −
                {config.threeByePenalty}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
