"use client";

import { useState } from "react";
import { GameConfig, PlayerNames } from "@/lib/types";

interface Props {
  onStart: (players: PlayerNames, config: GameConfig) => void;
}

export default function SetupForm({ onStart }: Props) {
  const [usP1, setUsP1] = useState("");
  const [usP2, setUsP2] = useState("");
  const [themP1, setThemP1] = useState("");
  const [themP2, setThemP2] = useState("");
  const [target, setTarget] = useState<501 | 1001>(1001);
  const [bzPenalty, setBzPenalty] = useState(90);
  const [threeByePenalty, setThreeByePenalty] = useState(150);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const players: PlayerNames = {
      us: [usP1.trim() || "Игрок 1", usP2.trim() || "Игрок 2"],
      them: [themP1.trim() || "Игрок 3", themP2.trim() || "Игрок 4"],
    };
    onStart(players, { target, bzPenalty, threeByePenalty });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 pb-24">
      <TeamFields
        title="Команда «Мы»"
        accent="text-sky-400"
        p1={usP1}
        p2={usP2}
        setP1={setUsP1}
        setP2={setUsP2}
      />
      <TeamFields
        title="Команда «Они»"
        accent="text-rose-400"
        p1={themP1}
        p2={themP2}
        setP1={setThemP1}
        setP2={setThemP2}
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

function TeamFields({
  title,
  accent,
  p1,
  p2,
  setP1,
  setP2,
}: {
  title: string;
  accent: string;
  p1: string;
  p2: string;
  setP1: (v: string) => void;
  setP2: (v: string) => void;
}) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className={`text-sm font-medium ${accent}`}>{title}</h2>
      <div className="grid grid-cols-2 gap-3">
        <input
          value={p1}
          onChange={(e) => setP1(e.target.value)}
          placeholder="Игрок 1"
          className="rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-3 text-base text-neutral-100 placeholder:text-neutral-500 focus:border-sky-400 focus:outline-none"
        />
        <input
          value={p2}
          onChange={(e) => setP2(e.target.value)}
          placeholder="Игрок 2"
          className="rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-3 text-base text-neutral-100 placeholder:text-neutral-500 focus:border-sky-400 focus:outline-none"
        />
      </div>
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
