import { GameConfig, RoundInput, RoundResult, TeamId, otherTeam } from "./types";

export interface GameSummary {
  results: RoundResult[];
  usTotal: number;
  themTotal: number;
  usByteCount: number;
  themByteCount: number;
  winner: TeamId | null;
}

/**
 * БЗ (zero tricks) is detected automatically: whichever team ends up with
 * literal 0 raw points this round (entered directly, or as the remainder
 * of the other team's entry) gets nothing, and the opponent receives the
 * fixed bzPenalty from game config instead of the round's point total.
 * Otherwise, byte ("байт") applies: the calling team collected strictly
 * fewer points than the opposing team -> the whole round total flips to
 * the opposing team. Every 3rd byte (cumulative, not necessarily
 * consecutive) by the same team costs that team an extra
 * threeByePenalty, subtracted from their running total.
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
    const total = Math.max(1, round.total);
    let usPoints = 0;
    let themPoints = 0;
    let isBye = false;
    let isThreeBye = false;
    let bzTeam: TeamId | null = null;

    const enteredPoints = clamp(round.enteredPoints, 0, total);
    const otherPoints = total - enteredPoints;
    const enteredIsUs = round.enteredTeam === "us";
    let provisionalUs = enteredIsUs ? enteredPoints : otherPoints;
    let provisionalThem = enteredIsUs ? otherPoints : enteredPoints;

    if (provisionalUs === 0) {
      bzTeam = "us";
    } else if (provisionalThem === 0) {
      bzTeam = "them";
    }

    if (bzTeam) {
      const winner = otherTeam(bzTeam);
      usPoints = winner === "us" ? config.bzPenalty : 0;
      themPoints = winner === "them" ? config.bzPenalty : 0;
    } else {
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
      bzTeam,
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
