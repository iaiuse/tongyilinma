export interface GameState {
  currentLevel: number;
  score: number;
  maxLevel: number;
  hintsUsed: number;
  timeLeft: number;
  combo: number;
  energy: number;
  lastAnswerTime: number;
}

export interface Riddle {
  question: string;
  answer: string[];
  hint: string;
}

export interface GameConfig {
  comboBonus: number;
  timePenalty: number;
  energyPerHint: number;
  energyRecoveryRate: number;
  maxCombo: number;
  baseTimePerQuestion: number;
} 