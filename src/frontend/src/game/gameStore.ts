import { create } from "zustand";
import { playCombo, playMiss, playSlash, playSplat } from "./AudioManager";
import type {
  FruitInstance,
  FruitType,
  GameMode,
  GameState,
  Screen,
} from "./types";

const FRUIT_TYPES: FruitType[] = [
  "watermelon",
  "orange",
  "apple",
  "banana",
  "pineapple",
];

function getFruitScore(type: FruitType): number {
  if (type === "bomb") return 0;
  if (type === "power") return 25;
  return 10;
}

function getComboMultiplier(combo: number): number {
  if (combo >= 7) return 5;
  if (combo >= 5) return 3;
  if (combo >= 3) return 2;
  return 1;
}

function getLevelConfig(level: number) {
  const fruitCount = Math.min(2 + Math.floor(level / 5), 20);
  const speed = 1 + Math.floor(level / 10) * 0.05;
  const hasBombs = level >= 100;
  const hasPower = level >= 200;
  const hasClusters = level >= 500;
  return { fruitCount, speed, hasBombs, hasPower, hasClusters };
}

let fruitIdCounter = 0;

function spawnFruit(level: number, now: number): FruitInstance[] {
  const config = getLevelConfig(level);
  const fruits: FruitInstance[] = [];
  const count = config.hasClusters
    ? config.fruitCount + Math.floor(Math.random() * 3)
    : config.fruitCount;

  for (let i = 0; i < count; i++) {
    let type: FruitType;
    const r = Math.random();
    if (config.hasBombs && r < 0.1) {
      type = "bomb";
    } else if (config.hasPower && r < 0.15) {
      type = "power";
    } else {
      type = FRUIT_TYPES[Math.floor(Math.random() * FRUIT_TYPES.length)];
    }

    // Bug 4 fix: reduced stagger delay for faster, more responsive waves
    const delay = i * (config.hasClusters ? 0.1 : 0.2 + Math.random() * 0.3);
    const startX = (Math.random() - 0.5) * 8;
    const startY = -5;
    const startZ = (Math.random() - 0.5) * 2;
    const velX = (Math.random() - 0.5) * 2 * config.speed;
    const velY = (6 + Math.random() * 3) * config.speed;
    const velZ = (Math.random() - 0.5) * 0.5;

    fruits.push({
      id: `fruit_${fruitIdCounter++}`,
      type,
      startX,
      startY,
      startZ,
      velX,
      velY,
      velZ,
      spawnTime: now + delay,
      lifespan: 3.5 / config.speed,
      sliced: false,
      missed: false,
    });
  }
  return fruits;
}

const initialState: GameState = {
  screen: "mainmenu",
  mode: "solo",
  level: 1,
  score: 0,
  lives: 3,
  combo: 0,
  comboMultiplier: 1,
  waveProgress: 0,
  waveFruitsTotal: 0,
  waveFruitsSliced: 0,
  waveMisses: 0,
  fruits: [],
  isPlaying: false,
  robotScore: 0,
  roomCode: "",
  playerName: "",
  opponentScore: 0,
  opponentLevel: 1,
  finalScore: 0,
  finalLevel: 1,
  comboText: "",
  showComboText: false,
};

interface GameStore extends GameState {
  setScreen: (screen: Screen) => void;
  setMode: (mode: GameMode) => void;
  startGame: (mode: GameMode) => void;
  sliceFruit: (id: string) => void;
  missFruit: (id: string) => void;
  nextWave: () => void;
  setRoomCode: (code: string) => void;
  setPlayerName: (name: string) => void;
  updateOnlineOpponent: (score: number, level: number) => void;
  setRobotScore: (score: number) => void;
  tickFruits: (now: number) => void;
  setComboText: (text: string) => void;
  reset: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState,

  setScreen: (screen) => set({ screen }),
  setMode: (mode) => set({ mode }),
  setPlayerName: (playerName) => set({ playerName }),
  setRoomCode: (roomCode) => set({ roomCode }),
  updateOnlineOpponent: (opponentScore, opponentLevel) =>
    set({ opponentScore, opponentLevel }),
  setRobotScore: (robotScore) => set({ robotScore }),
  setComboText: (text) => set({ comboText: text, showComboText: true }),

  startGame: (mode) => {
    const now = performance.now() / 1000;
    const fruits = spawnFruit(1, now);
    set({
      ...initialState,
      screen: "game",
      mode,
      level: 1,
      score: 0,
      lives: 3,
      combo: 0,
      comboMultiplier: 1,
      fruits,
      waveFruitsTotal: fruits.length,
      waveFruitsSliced: 0,
      waveMisses: 0,
      isPlaying: true,
      robotScore: 0,
    });
  },

  sliceFruit: (id) => {
    const state = get();
    const fruit = state.fruits.find((f) => f.id === id);
    if (!fruit || fruit.sliced || fruit.missed) return;

    if (fruit.type === "bomb") {
      playMiss();
      const newLives = state.lives - 1;
      const updatedFruits = state.fruits.map((f) =>
        f.id === id
          ? { ...f, sliced: true, sliceTime: performance.now() / 1000 }
          : f,
      );
      if (newLives <= 0) {
        set({
          fruits: updatedFruits,
          lives: 0,
          isPlaying: false,
          screen: "gameover",
          finalScore: state.score,
          finalLevel: state.level,
        });
      } else {
        set({
          fruits: updatedFruits,
          lives: newLives,
          combo: 0,
          comboMultiplier: 1,
        });
        // Bug 2 fix: check wave completion after bomb hit
        if (updatedFruits.every((f) => f.sliced || f.missed)) {
          setTimeout(() => get().nextWave(), 800);
        }
      }
      return;
    }

    playSlash();
    playSplat();

    const newCombo = state.combo + 1;
    const multiplier = getComboMultiplier(newCombo);
    const baseScore = getFruitScore(fruit.type);
    const levelMod = 1 + (state.level - 1) * 0.01;
    const gained = Math.floor(baseScore * multiplier * levelMod);
    const newScore = state.score + gained;
    const newSliced = state.waveFruitsSliced + 1;

    const updatedFruits = state.fruits.map((f) =>
      f.id === id
        ? { ...f, sliced: true, sliceTime: performance.now() / 1000 }
        : f,
    );

    let comboText = "";
    if (newCombo === 3) {
      comboText = "TRIPLE! 2x";
      playCombo();
    } else if (newCombo === 5) {
      comboText = "PENTA! 3x";
      playCombo();
    } else if (newCombo === 7) {
      comboText = "MEGA! 5x";
      playCombo();
    } else if (newCombo > 7 && newCombo % 3 === 0) {
      comboText = `${newCombo} CHAIN! 5x`;
      playCombo();
    }

    set({
      fruits: updatedFruits,
      score: newScore,
      combo: newCombo,
      comboMultiplier: multiplier,
      waveFruitsSliced: newSliced,
      comboText,
      showComboText: comboText !== "",
    });

    // Bug 2 fix: simplified wave completion check
    if (updatedFruits.every((f) => f.sliced || f.missed)) {
      setTimeout(() => get().nextWave(), 800);
    }
  },

  missFruit: (id) => {
    const state = get();
    if (!state.isPlaying) return;
    const fruit = state.fruits.find((f) => f.id === id);
    // Bug 1 fix: removed fruit.type === "bomb" guard so bombs can expire
    if (!fruit || fruit.sliced || fruit.missed) return;

    const isBomb = fruit.type === "bomb";

    // Only deduct life and play miss sound for non-bomb fruits
    if (!isBomb) {
      playMiss();
    }

    const updatedFruits = state.fruits.map((f) =>
      f.id === id ? { ...f, missed: true } : f,
    );

    if (!isBomb) {
      const newMisses = state.waveMisses + 1;
      const newLives = state.lives - 1;

      if (newLives <= 0) {
        set({
          fruits: updatedFruits,
          lives: 0,
          waveMisses: newMisses,
          combo: 0,
          comboMultiplier: 1,
          isPlaying: false,
          screen: "gameover",
          finalScore: state.score,
          finalLevel: state.level,
        });
        return;
      }

      set({
        fruits: updatedFruits,
        lives: newLives,
        waveMisses: newMisses,
        combo: 0,
        comboMultiplier: 1,
      });
    } else {
      // Bomb expired silently — no life penalty
      set({ fruits: updatedFruits });
    }

    if (updatedFruits.every((f) => f.sliced || f.missed)) {
      setTimeout(() => get().nextWave(), 800);
    }
  },

  nextWave: () => {
    const state = get();
    if (!state.isPlaying) return;
    const newLevel = state.level + 1;
    const now = performance.now() / 1000;
    const fruits = spawnFruit(newLevel, now);
    set({
      level: newLevel,
      fruits,
      waveFruitsTotal: fruits.length,
      waveFruitsSliced: 0,
      waveMisses: 0,
      showComboText: false,
    });
  },

  // Bug 3 fix: collect expired IDs first, then call missFruit to avoid re-entrant state
  tickFruits: (now) => {
    const state = get();
    if (!state.isPlaying) return;
    const toMiss: string[] = [];
    for (const f of state.fruits) {
      if (!f.sliced && !f.missed && now - f.spawnTime > f.lifespan) {
        toMiss.push(f.id);
      }
    }
    for (const id of toMiss) {
      get().missFruit(id);
    }
  },

  reset: () => set({ ...initialState }),
}));
