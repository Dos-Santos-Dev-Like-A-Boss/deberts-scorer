import { GameConfig, TeamNames } from "@/lib/types";
import { GameSummary } from "@/lib/gameEngine";

interface Props {
  players: TeamNames;
  config: GameConfig;
  summary: GameSummary;
}

export default function ScoreBoard({ players, config, summary }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <TeamCard
        name={players.us}
        total={summary.usTotal}
        byteCount={summary.usByteCount}
        pending={summary.usPending}
        target={config.target}
        accent="sky"
      />
      <TeamCard
        name={players.them}
        total={summary.themTotal}
        byteCount={summary.themByteCount}
        pending={summary.themPending}
        target={config.target}
        accent="rose"
      />
    </div>
  );
}

function TeamCard({
  name,
  total,
  byteCount,
  pending,
  target,
  accent,
}: {
  name: string;
  total: number;
  byteCount: number;
  pending: number;
  target: number;
  accent: "sky" | "rose";
}) {
  const pct = Math.min(100, Math.max(0, (total / target) * 100));
  const colors =
    accent === "sky"
      ? { text: "text-sky-300", bar: "bg-sky-400", ring: "border-sky-400/40" }
      : { text: "text-rose-300", bar: "bg-rose-400", ring: "border-rose-400/40" };

  return (
    <div className={`rounded-2xl border ${colors.ring} bg-neutral-900 p-4`}>
      <div className={`truncate text-xs font-medium ${colors.text}`}>{name}</div>
      <div className="mt-1 text-3xl font-bold tabular-nums text-neutral-50">
        {total}
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-neutral-800">
        <div
          className={`h-full ${colors.bar}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-2 text-xs text-neutral-500">
        Байтов: <span className="tabular-nums">{byteCount}</span>
      </div>
      {pending > 0 && (
        <div className="mt-1 text-xs font-medium text-amber-400">
          На кону (висячий байт): {pending}
        </div>
      )}
    </div>
  );
}
