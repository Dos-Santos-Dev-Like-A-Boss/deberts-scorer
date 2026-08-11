import { GameConfig, RoundInput, RoundResult, TeamId, otherTeam } from "./types";

export interface GameSummary {
  results: RoundResult[];
  usTotal: number;
  themTotal: number;
  usByteCount: number;
  themByteCount: number;
  /** Sum of each team's frozen hanging-bye points still waiting to be released. */
  usPending: number;
  themPending: number;
  winner: TeamId | null;
}

/**
 * БЗ (zero tricks) is detected automatically: whichever team ends up with
 * literal 0 raw points this round (entered directly, or as the remainder
 * of the other team's entry) gets nothing, and the opponent receives the
 * round's full point total PLUS the fixed bzPenalty from game config on
 * top of it (a "capot" bonus, not a replacement for the points they
 * actually won).
 *
 * Otherwise, byte ("байт") applies: the calling team collected strictly
 * fewer points than the opposing team -> the whole round total flips to
 * the opposing team. Every 3rd byte (cumulative, not necessarily
 * consecutive) by the same team costs that team an extra
 * threeByePenalty, subtracted from their running total.
 *
 * A tie (calling team's points === opposing team's points) is a
 * "висячий байт" (hanging bye): the opposing team banks their share
 * immediately, but the calling team's share freezes in a per-team queue
 * instead of being recorded. It is only released - oldest first - the
 * next time that team calls and wins outright (or, if another hanging
 * bye happens for them first, that new tie releases the previous freeze
 * and queues its own share instead). A later loss doesn't forfeit
 * frozen points; they just keep waiting.
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
  const pending: Record<TeamId, number[]> = { us: [], them: [] };

  for (const round of rounds) {
    const total = Math.max(1, round.total);
    let usPoints = 0;
    let themPoints = 0;
    let isBye = false;
    let isThreeBye = false;
    let isHangingBye = false;
    let bzTeam: TeamId | null = null;
    let hangingReleasedTeam: TeamId | null = null;
    let hangingReleasedPoints = 0;

    const enteredPoints = clamp(round.enteredPoints, 0, total);
    const otherPoints = total - enteredPoints;
    const enteredIsUs = round.enteredTeam === "us";
    const provisionalUs = enteredIsUs ? enteredPoints : otherPoints;
    const provisionalThem = enteredIsUs ? otherPoints : enteredPoints;

    if (provisionalUs === 0) {
      bzTeam = "us";
    } else if (provisionalThem === 0) {
      bzTeam = "them";
    }

    if (bzTeam) {
      const winner = otherTeam(bzTeam);
      usPoints = winner === "us" ? total + config.bzPenalty : 0;
      themPoints = winner === "them" ? total + config.bzPenalty : 0;
    } else {
      const callingTeam = round.callingTeam;
      const callingPoints = callingTeam === "us" ? provisionalUs : provisionalThem;
      const opposingPoints = callingTeam === "us" ? provisionalThem : provisionalUs;

      if (callingPoints === opposingPoints) {
        isHangingBye = true;
        if (pending[callingTeam].length > 0) {
          hangingReleasedTeam = callingTeam;
          hangingReleasedPoints = pending[callingTeam].shift()!;
        }
        pending[callingTeam].push(callingPoints);

        const callerAward = hangingReleasedPoints;
        if (callingTeam === "us") {
          usPoints = callerAward;
          themPoints = opposingPoints;
        } else {
          themPoints = callerAward;
          usPoints = opposingPoints;
        }
      } else if (callingPoints < opposingPoints) {
        isBye = true;
        if (callingTeam === "us") {
          usPoints = 0;
          themPoints = total;
          usByteCount += 1;
        } else {
          themPoints = 0;
          usPoints = total;
          themByteCount += 1;
        }
        const count = callingTeam === "us" ? usByteCount : themByteCount;
        if (count % 3 === 0) {
          isThreeBye = true;
        }
      } else {
        let callerAward = callingPoints;
        if (pending[callingTeam].length > 0) {
          hangingReleasedTeam = callingTeam;
          hangingReleasedPoints = pending[callingTeam].shift()!;
          callerAward += hangingReleasedPoints;
        }
        if (callingTeam === "us") {
          usPoints = callerAward;
          themPoints = opposingPoints;
        } else {
          themPoints = callerAward;
          usPoints = opposingPoints;
        }
      }
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
      isHangingBye,
      hangingReleasedTeam,
      hangingReleasedPoints,
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

  const usPending = pending.us.reduce((sum, v) => sum + v, 0);
  const themPending = pending.them.reduce((sum, v) => sum + v, 0);

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
