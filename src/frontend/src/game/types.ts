export type FruitType =
  | "watermelon"
  | "orange"
  | "apple"
  | "banana"
  | "pineapple"
  | "bomb"
  | "power";

export interface FruitConfig {
  type: FruitType;
  color: string;
  innerColor: string;
  radius: number;
  score: number;
}

export interface FruitInstance {
  id: string;
  type: FruitType;
  // Arc trajectory: position = start + velocity*t + 0.5*gravity*t^2
  startX: number;
  startY: number;
  startZ: number;
  velX: number;
  velY: number;
  velZ: number;
  spawnTime: number;
  lifespan: number; // seconds before considered missed
  sliced: boolean;
  missed: boolean;
  // Cut animation
  sliceTime?: number;
  half1Rot?: number;
  half2Rot?: number;
}

export type GameMode = "solo" | "robot" | "online";
export type Screen =
  | "mainmenu"
  | "game"
  | "gameover"
  | "leaderboard"
  | "online_lobby";

export interface GameState {
  screen: Screen;
  mode: GameMode;
  level: number;
  score: number;
  lives: number;
  combo: number;
  comboMultiplier: number;
  waveProgress: number; // 0-1
  waveFruitsTotal: number;
  waveFruitsSliced: number;
  waveMisses: number;
  fruits: FruitInstance[];
  isPlaying: boolean;
  // Robot mode
  robotScore: number;
  // Online mode
  roomCode: string;
  playerName: string;
  opponentScore: number;
  opponentLevel: number;
  // Game over
  finalScore: number;
  finalLevel: number;
  // Combo text
  comboText: string;
  showComboText: boolean;
}
