import {
  GameConfig,
  HangingResolution,
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
  /** Points currently frozen from a hanging bye, awaiting the next round. */
  usPending: number;
  themPending: number;
  winner: TeamId | null;
}

/**
 * БЗ (zero tricks) is detected automatically: whichever team ends up with
 * literal 0 raw points this round (entered directly, or as the remainder
 * of the other team's entry) gets nothing this round, and the opponent
 * banks the round's full point total. On top of that, the BZ'd team pays
 * the fixed bzPenalty out of their own running score (subtracted, not
 * added to the winner).
 *
 * Otherwise, byte ("байт") applies: the calling team collected strictly
 * fewer points than the opposing team -> the whole round total flips to
 * the opposing team. Every 3rd byte (cumulative, not necessarily
 * consecutive) by the same team costs that team an extra
 * threeByePenalty, subtracted from their running total.
 *
 * A tie (calling team's points === opposing team's points) is a
 * "висячий байт" (hanging bye): the opposing team banks their share
 * immediately, but the calling team's share freezes instead of being
 * recorded. Its fate is decided by the very next round: if the frozen
 * team scores more raw points than their opponent in that next round,
 * the freeze is added on top; otherwise (opponent scores more, or it's
 * another tie) it burns and is lost for good.
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
  let usPending = 0;
  let themPending = 0;

  for (const round of rounds) {
    const total = Math.max(1, round.total);
    let usPoints = 0;
    let themPoints = 0;
    let isBye = false;
    let isThreeBye = false;
    let isHangingBye = false;
    let bzTeam: TeamId | null = null;
    const hangingResolutions: HangingResolution[] = [];

    const enteredPoints = clamp(round.enteredPoints, 0, total);
    const otherPoints = total - enteredPoints;
    const enteredIsUs = round.enteredTeam === "us";
    const provisionalUs = enteredIsUs ? enteredPoints : otherPoints;
    const provisionalThem = enteredIsUs ? otherPoints : enteredPoints;

    // Step 1: resolve any freeze from a prior hanging bye using this
    // round's raw points, before scoring this round's own outcome.
    if (usPending > 0) {
      if (provisionalUs > provisionalThem) {
        usPoints += usPending;
        hangingResolutions.push({ team: "us", outcome: "added", points: usPending });
      } else {
        hangingResolutions.push({ team: "us", outcome: "burned", points: usPending });
      }
      usPending = 0;
    }
    if (themPending > 0) {
      if (provisionalThem > provisionalUs) {
        themPoints += themPending;
        hangingResolutions.push({ team: "them", outcome: "added", points: themPending });
      } else {
        hangingResolutions.push({ team: "them", outcome: "burned", points: themPending });
      }
      themPending = 0;
    }

    // Step 2: score this round itself.
    if (provisionalUs === 0) {
      bzTeam = "us";
    } else if (provisionalThem === 0) {
      bzTeam = "them";
    }

    if (bzTeam) {
      const winner = otherTeam(bzTeam);
      if (winner === "us") {
        usPoints += total;
      } else {
        themPoints += total;
      }
    } else {
      const callingTeam = round.callingTeam;
      const callingPoints = callingTeam === "us" ? provisionalUs : provisionalThem;
      const opposingPoints = callingTeam === "us" ? provisionalThem : provisionalUs;

      if (callingPoints === opposingPoints) {
        isHangingBye = true;
        if (callingTeam === "us") {
          themPoints += opposingPoints;
          usPending = callingPoints;
        } else {
          usPoints += opposingPoints;
          themPending = callingPoints;
        }
      } else if (callingPoints < opposingPoints) {
        isBye = true;
        if (callingTeam === "us") {
          themPoints += total;
          usByteCount += 1;
        } else {
          usPoints += total;
          themByteCount += 1;
        }
        const count = callingTeam === "us" ? usByteCount : themByteCount;
        if (count % 3 === 0) {
          isThreeBye = true;
        }
      } else {
        if (callingTeam === "us") {
          usPoints += callingPoints;
          themPoints += opposingPoints;
        } else {
          themPoints += callingPoints;
          usPoints += opposingPoints;
        }
      }
    }

    usTotal += usPoints;
    themTotal += themPoints;

    if (bzTeam === "us") {
      usTotal -= config.bzPenalty;
    } else if (bzTeam === "them") {
      themTotal -= config.bzPenalty;
    }

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
      isHangingBye,
      hangingResolutions,
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

  return {
    results,
    usTotal,
    themTotal,
    usByteCount,
    themByteCount,
    usPending,
    themPending,
    winner,
  };
}

function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  return Math.min(Math.max(value, min), max);
}
