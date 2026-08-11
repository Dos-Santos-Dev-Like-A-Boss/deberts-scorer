import {
  BASE_TOTAL,
  GameConfig,
  RoundInput,
  RoundResult,
  TeamId,
  otherTeam,
} from "./types";

export interface GameSummary {
  results: RoundResult[];
  usTotal: number;
  themTotal: number;
  usByteCount: number;
  themByteCount: number;
  winner: TeamId | null;
}

/**
 * Byte ("байт") = calling team collected strictly fewer points than the
 * opposing team -> the whole round total flips to the opposing team.
 * БЗ (zero tricks) is flagged manually per round and replaces the normal
 * split entirely: the БЗ team scores 0, the opponent gets the fixed
 * bzPenalty from game config instead of the round's point total.
 * Every 3rd byte (cumulative, not necessarily consecutive) by the same
 * team costs that team an extra threeByePenalty, subtracted from their
 * running total.
 */
export function computeGame(
  config: GameConfig,
  rounds: RoundInput[]
): GameSummary {
  const results: RoundResult[] = [];
  let usTotal = 0;
  let themTotal = 0;
  let usByteCount = 0;
  let themByteCount = 0;

  for (const round of rounds) {
    const total = BASE_TOTAL + round.bonus;
    let usPoints = 0;
    let themPoints = 0;
    let isBye = false;
    let isThreeBye = false;

    if (round.bzTeam) {
      const winner = otherTeam(round.bzTeam);
      if (winner === "us") {
        usPoints = config.bzPenalty;
      } else {
        themPoints = config.bzPenalty;
      }
    } else {
      const enteredPoints = clamp(round.enteredPoints, 0, total);
      const otherPoints = total - enteredPoints;
      const enteredIsUs = round.enteredTeam === "us";
      let provisionalUs = enteredIsUs ? enteredPoints : otherPoints;
      let provisionalThem = enteredIsUs ? otherPoints : enteredPoints;

      const callingPoints =
        round.callingTeam === "us" ? provisionalUs : provisionalThem;
      const opposingPoints =
        round.callingTeam === "us" ? provisionalThem : provisionalUs;

      if (callingPoints < opposingPoints) {
        isBye = true;
        if (round.callingTeam === "us") {
          provisionalUs = 0;
          provisionalThem = total;
        } else {
          provisionalThem = 0;
          provisionalUs = total;
        }
        if (round.callingTeam === "us") {
          usByteCount += 1;
        } else {
          themByteCount += 1;
        }
        const count = round.callingTeam === "us" ? usByteCount : themByteCount;
        if (count % 3 === 0) {
          isThreeBye = true;
        }
      }

      usPoints = provisionalUs;
      themPoints = provisionalThem;
    }

    usTotal += usPoints;
    themTotal += themPoints;

    if (isThreeBye) {
      if (round.callingTeam === "us") {
        usTotal -= config.threeByePenalty;
      } else {
        themTotal -= config.threeByePenalty;
      }
    }

    results.push({
      ...round,
      total,
      usPoints,
      themPoints,
      isBye,
      isThreeBye,
      usByteCountAfter: usByteCount,
      themByteCountAfter: themByteCount,
    });
  }

  let winner: TeamId | null = null;
  const usReached = usTotal >= config.target;
  const themReached = themTotal >= config.target;
  if (usReached && themReached) {
    winner = usTotal === themTotal ? null : usTotal > themTotal ? "us" : "them";
  } else if (usReached) {
    winner = "us";
  } else if (themReached) {
    winner = "them";
  }

  return { results, usTotal, themTotal, usByteCount, themByteCount, winner };
}

function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  return Math.min(Math.max(value, min), max);
}

export function bonusLabel(bonus: number): string {
  switch (bonus) {
    case 0:
      return "Без прикупа";
    case 20:
      return "Белла (+20)";
    case 50:
      return "Терц/Полтинник (+50)";
    case 70:
      return "Белла + Терц (+70)";
    default:
      return `+${bonus}`;
  }
}
