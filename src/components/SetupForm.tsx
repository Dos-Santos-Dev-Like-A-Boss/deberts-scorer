"use client";

import { useState } from "react";
import { GameConfig, TeamNames } from "@/lib/types";

interface Props {
  onStart: (teams: TeamNames, config: GameConfig) => void;
}

export default function SetupForm({ onStart }: Props) {
  const [teamA, setTeamA] = useState("");
  const [teamB, setTeamB] = useState("");
  const [target, setTarget] = useState<501 | 1001>(1001);
  const [bzPenalty, setBzPenalty] = useState(100);
  const [threeByePenalty, setThreeByePenalty] = useState(150);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const teams: TeamNames = {
      us: teamA.trim() || "Команда А",
      them: teamB.trim() || "Команда Б",
    };
    onStart(teams, { target, bzPenalty, threeByePenalty });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 pb-24">
      <TeamNameField
        label="Название команды 1"
        accent="text-sky-400"
        value={teamA}
        onChange={setTeamA}
        placeholder="Команда А"
      />
      <TeamNameField
        label="Название команды 2"
        accent="text-rose-400"
        value={teamB}
        onChange={setTeamB}
        placeholder="Команда Б"
      />

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-medium text-neutral-400">Игра до</h2>
        <div className="grid grid-cols-2 gap-3">
          {([501, 1001] as const).map((value) => (
            <button
              type="button"
              key={value}
              onClick={() => setTarget(value)}
              className={`rounded-xl border py-3 text-lg font-semibold transition-colors ${
                target === value
                  ? "border-sky-400 bg-sky-400/10 text-sky-300"
                  : "border-neutral-700 text-neutral-300"
              }`}
            >
              {value}
            </button>
          ))}
        </div>
      </section>

      <NumberField
        label="Штраф за «БЗ» (без взяток)"
        value={bzPenalty}
        onChange={setBzPenalty}
      />
      <NumberField
        label="Штраф за «3 байта»"
        value={threeByePenalty}
        onChange={setThreeByePenalty}
      />

      <div className="fixed inset-x-0 bottom-0 border-t border-neutral-800 bg-neutral-950/95 p-4 backdrop-blur">
        <button
          type="submit"
          className="mx-auto block w-full max-w-md rounded-xl bg-sky-500 py-4 text-lg font-semibold text-white active:bg-sky-600"
        >
          Начать игру
        </button>
      </div>
    </form>
  );
}

function TeamNameField({
  label,
  accent,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  accent: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className={`text-sm font-medium ${accent}`}>{label}</h2>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-3 text-base text-neutral-100 placeholder:text-neutral-500 focus:border-sky-400 focus:outline-none"
      />
    </section>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-sm font-medium text-neutral-400">{label}</h2>
      <input
        type="number"
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-3 text-base text-neutral-100 focus:border-sky-400 focus:outline-none"
      />
    </section>
  );
}
