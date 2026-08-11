export type TeamId = "us" | "them";

export type Bonus = 0 | 20 | 40 | 50 | 70 | 90;

export const BASE_TOTAL = 162;

export const BONUS_OPTIONS: Bonus[] = [0, 20, 40, 50, 70, 90];

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
  /** Which team's points were entered; the other team's points are the remainder. */
  enteredTeam: TeamId;
  enteredPoints: number;
}

/** Derived outcome of a single round, computed from RoundInput + config. */
export interface RoundResult extends RoundInput {
  total: number;
  usPoints: number;
  themPoints: number;
  /** Team that ended up with 0 raw points this round (БЗ), if any. */
  bzTeam: TeamId | null;
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
