export type TeamId = "us" | "them";

export type Bonus = 0 | 20 | 50 | 70;

export const BASE_TOTAL = 162;

export interface PlayerNames {
  us: [string, string];
  them: [string, string];
}

export interface GameConfig {
  target: 501 | 1001;
  bzPenalty: number;
  threeByePenalty: number;
}

/** Raw input the user provides for a single round. */
export interface RoundInput {
  id: number;
  bonus: Bonus;
  callingTeam: TeamId;
  /** Team that took zero tricks this round, if any. */
  bzTeam: TeamId | null;
  /** Which team's points were manually entered (ignored when bzTeam is set). */
  enteredTeam: TeamId;
  enteredPoints: number;
}

/** Derived outcome of a single round, computed from RoundInput + config. */
export interface RoundResult extends RoundInput {
  total: number;
  usPoints: number;
  themPoints: number;
  isBye: boolean;
  isThreeBye: boolean;
  usByteCountAfter: number;
  themByteCountAfter: number;
}

export interface GamePhaseSetup {
  phase: "setup";
}

export interface GamePhasePlaying {
  phase: "playing" | "finished";
  config: GameConfig;
  players: PlayerNames;
  rounds: RoundInput[];
}

export type PersistedState =
  | GamePhaseSetup
  | GamePhasePlaying;

export function otherTeam(team: TeamId): TeamId {
  return team === "us" ? "them" : "us";
}
