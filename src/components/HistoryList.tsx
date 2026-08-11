import { RoundResult, TeamNames, TeamId, GameConfig } from "@/lib/types";

interface Props {
  results: RoundResult[];
  players: TeamNames;
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

  const teamLabel = (team: TeamId) => players[team];

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
              <span className="truncate text-sky-400">
                {players.us} {r.usPoints > 0 ? `+${r.usPoints}` : r.usPoints}
              </span>
              <span className="truncate text-rose-400">
                {players.them} {r.themPoints > 0 ? `+${r.themPoints}` : r.themPoints}
              </span>
            </div>
            {r.bzTeam && (
              <div className="mt-1 text-xs font-medium text-amber-400">
                БЗ у {teamLabel(r.bzTeam)} · сопернику весь банк ({r.total}),
                у {teamLabel(r.bzTeam)} доп. штраф −{config.bzPenalty}
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
            {r.isHangingBye && (
              <div className="mt-1 text-xs font-medium text-amber-400">
                Висячий байт у {teamLabel(r.callingTeam)} — {r.total / 2}{" "}
                очков заморожены, решится в следующем раунде
              </div>
            )}
            {r.hangingResolutions.map((res, i) => (
              <div
                key={i}
                className={`mt-1 text-xs font-medium ${
                  res.outcome === "added" ? "text-emerald-400" : "text-red-500"
                }`}
              >
                {res.outcome === "added"
                  ? `Разморожено +${res.points} для ${teamLabel(res.team)}`
                  : `Сгорело ${res.points} у ${teamLabel(res.team)} (висячий байт не подтверждён)`}
              </div>
            ))}
          </li>
        ))}
      </ul>
    </div>
  );
}
