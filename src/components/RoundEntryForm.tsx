"use client";

import { useState } from "react";
import {
  BASE_TOTAL,
  PRESET_TOTALS,
  PlayerNames,
  RoundInput,
  TeamId,
} from "@/lib/types";

interface Props {
  players: PlayerNames;
  onSubmit: (input: Omit<RoundInput, "id">) => void;
}

export default function RoundEntryForm({ players, onSubmit }: Props) {
  const [presetTotal, setPresetTotal] = useState(BASE_TOTAL);
  const [customMode, setCustomMode] = useState(false);
  const [customTotalStr, setCustomTotalStr] = useState("");
  const [callingTeam, setCallingTeam] = useState<TeamId>("us");
  const [enteredTeam, setEnteredTeam] = useState<TeamId>("us");
  const [pointsStr, setPointsStr] = useState("");

  const total = customMode
    ? Math.max(0, Number(customTotalStr) || 0)
    : presetTotal;
  const points = Math.min(Math.max(Number(pointsStr) || 0, 0), total);
  const canSubmit = total > 0;

  function teamLabel(team: TeamId) {
    return team === "us" ? "Мы" : "Они";
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    onSubmit({
      total,
      callingTeam,
      enteredTeam,
      enteredPoints: points,
    });
    setPresetTotal(BASE_TOTAL);
    setCustomMode(false);
    setCustomTotalStr("");
    setCallingTeam("us");
    setEnteredTeam("us");
    setPointsStr("");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <FieldGroup label="Игра (сумма очков раздачи)">
        <div className="grid grid-cols-3 gap-2">
          {PRESET_TOTALS.map((t) => (
            <ToggleButton
              key={t}
              active={!customMode && presetTotal === t}
              onClick={() => {
                setCustomMode(false);
                setPresetTotal(t);
              }}
            >
              {t}
            </ToggleButton>
          ))}
          <ToggleButton
            className="col-span-3"
            active={customMode}
            onClick={() => setCustomMode(true)}
          >
            Своё значение
          </ToggleButton>
        </div>
        {customMode && (
          <input
            type="number"
            inputMode="numeric"
            min={1}
            placeholder="Сумма очков раздачи"
            value={customTotalStr}
            onChange={(e) => setCustomTotalStr(e.target.value)}
            autoFocus
            className="mt-2 w-full rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-3 text-lg text-neutral-100 focus:border-sky-400 focus:outline-none"
          />
        )}
      </FieldGroup>

      <FieldGroup label="Кто играл">
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

      <button
        type="submit"
        disabled={!canSubmit}
        className="mt-2 rounded-xl bg-emerald-500 py-4 text-lg font-semibold text-white active:bg-emerald-600 disabled:opacity-40"
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
  className = "",
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border px-3 py-3 text-sm font-medium transition-colors ${
        active
          ? "border-sky-400 bg-sky-400/10 text-sky-300"
          : "border-neutral-700 text-neutral-300"
      } ${className}`}
    >
      {children}
    </button>
  );
}
