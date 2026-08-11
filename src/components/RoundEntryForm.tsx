"use client";

import { useState } from "react";
import { BASE_TOTAL, Bonus, PlayerNames, RoundInput, TeamId } from "@/lib/types";
import { bonusLabel } from "@/lib/gameEngine";

interface Props {
  players: PlayerNames;
  onSubmit: (input: Omit<RoundInput, "id">) => void;
}

const BONUS_OPTIONS: Bonus[] = [0, 20, 50, 70];

export default function RoundEntryForm({ players, onSubmit }: Props) {
  const [bonus, setBonus] = useState<Bonus>(0);
  const [callingTeam, setCallingTeam] = useState<TeamId>("us");
  const [bzTeam, setBzTeam] = useState<TeamId | null>(null);
  const [enteredTeam, setEnteredTeam] = useState<TeamId>("us");
  const [pointsStr, setPointsStr] = useState("");

  const total = BASE_TOTAL + bonus;
  const points = Math.min(Math.max(Number(pointsStr) || 0, 0), total);

  function teamLabel(team: TeamId) {
    return team === "us" ? "Мы" : "Они";
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({
      bonus,
      callingTeam,
      bzTeam,
      enteredTeam,
      enteredPoints: points,
    });
    setBonus(0);
    setCallingTeam("us");
    setBzTeam(null);
    setEnteredTeam("us");
    setPointsStr("");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <FieldGroup label="Игра (сумма очков раздачи)">
        <div className="grid grid-cols-2 gap-2">
          {BONUS_OPTIONS.map((b) => (
            <ToggleButton
              key={b}
              active={bonus === b}
              onClick={() => setBonus(b)}
            >
              {bonusLabel(b)} · {BASE_TOTAL + b}
            </ToggleButton>
          ))}
        </div>
      </FieldGroup>

      <FieldGroup label="Кто играл в масть">
        <div className="grid grid-cols-2 gap-2">
          {(["us", "them"] as const).map((team) => (
            <ToggleButton
              key={team}
              active={callingTeam === team}
              onClick={() => setCallingTeam(team)}
            >
              {teamLabel(team)}
            </ToggleButton>
          ))}
        </div>
      </FieldGroup>

      <FieldGroup label="БЗ (без взяток)">
        <div className="grid grid-cols-3 gap-2">
          <ToggleButton active={bzTeam === null} onClick={() => setBzTeam(null)}>
            Нет
          </ToggleButton>
          <ToggleButton active={bzTeam === "us"} onClick={() => setBzTeam("us")}>
            БЗ у нас
          </ToggleButton>
          <ToggleButton
            active={bzTeam === "them"}
            onClick={() => setBzTeam("them")}
          >
            БЗ у них
          </ToggleButton>
        </div>
      </FieldGroup>

      {bzTeam === null && (
        <FieldGroup label={`Очки чьей команды вводите (всего в раздаче: ${total})`}>
          <div className="grid grid-cols-2 gap-2 mb-2">
            {(["us", "them"] as const).map((team) => (
              <ToggleButton
                key={team}
                active={enteredTeam === team}
                onClick={() => setEnteredTeam(team)}
              >
                {teamLabel(team)}
              </ToggleButton>
            ))}
          </div>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={total}
            placeholder="Очки"
            value={pointsStr}
            onChange={(e) => setPointsStr(e.target.value)}
            className="w-full rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-3 text-lg text-neutral-100 focus:border-sky-400 focus:outline-none"
          />
          <p className="mt-1 text-xs text-neutral-500">
            Соперник получит остаток: {total - points}
          </p>
        </FieldGroup>
      )}

      <button
        type="submit"
        className="mt-2 rounded-xl bg-emerald-500 py-4 text-lg font-semibold text-white active:bg-emerald-600"
      >
        Записать раунд
      </button>
    </form>
  );
}

function FieldGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3 className="mb-2 text-sm font-medium text-neutral-400">{label}</h3>
      {children}
    </section>
  );
}

function ToggleButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border px-3 py-3 text-sm font-medium transition-colors ${
        active
          ? "border-sky-400 bg-sky-400/10 text-sky-300"
          : "border-neutral-700 text-neutral-300"
      }`}
    >
      {children}
    </button>
  );
}
