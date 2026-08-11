export type TeamId = "us" | "them";

export const BASE_TOTAL = 162;

export const PRESET_TOTALS: number[] = [162, 182, 202, 212, 232, 252];

export interface TeamNames {
  us: string;
  them: string;
}

export interface GameConfig {
  target: 501 | 1001;
  bzPenalty: number;
  threeByePenalty: number;
}

/** Raw input the user provides for a single round. */
export interface RoundInput {
  id: number;
  /** Total points in play for this round's deal (preset or custom). */
  total: number;
  callingTeam: TeamId;
  /** Which team's points were entered; the other team's points are the remainder. */
  enteredTeam: TeamId;
  enteredPoints: number;
}

/** Derived outcome of a single round, computed from RoundInput + config. */
export interface RoundResult extends RoundInput {
  usPoints: number;
  themPoints: number;
  /** Team that ended up with 0 raw points this round (БЗ), if any. */
  bzTeam: TeamId | null;
  isBye: boolean;
  isThreeBye: boolean;
  /** Calling team tied the opposing team — their share freezes until they next win. */
  isHangingBye: boolean;
  /** Team (if any) whose frozen hanging-bye points were released this round. */
  hangingReleasedTeam: TeamId | null;
  hangingReleasedPoints: number;
  usByteCountAfter: number;
  themByteCountAfter: number;
}

export interface GamePhaseSetup {
  phase: "setup";
}

export interface GamePhasePlaying {
  phase: "playing" | "finished";
  config: GameConfig;
  players: TeamNames;
  rounds: RoundInput[];
}

export type PersistedState =
  | GamePhaseSetup
  | GamePhasePlaying;

export function otherTeam(team: TeamId): TeamId {
  return team === "us" ? "them" : "us";
}
