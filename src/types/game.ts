export interface GameState {
  grid: boolean[][];
  revealed: boolean[][];
  betAmount: number;
  isGameOver: boolean;
  isWinner: boolean;
  revealedCount: number;
}

export interface GameStats {
  multiplier: number;
  nextMultiplier: number;
  probability: number;
}