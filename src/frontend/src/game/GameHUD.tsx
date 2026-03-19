import { AnimatePresence, motion } from "motion/react";
import React, { useEffect, useRef } from "react";
import { useGameStore } from "./gameStore";

function LivesDisplay({ lives }: { lives: number }) {
  return (
    <div className="flex gap-1">
      {[0, 1, 2].map((i) => (
        <span
          key={`life-slot-${i}`}
          className={`text-2xl ${i < lives ? "opacity-100" : "opacity-20"}`}
        >
          🐯
        </span>
      ))}
    </div>
  );
}

export function GameHUD() {
  const {
    level,
    score,
    lives,
    combo,
    comboMultiplier,
    waveFruitsSliced,
    waveFruitsTotal,
    mode,
    robotScore,
    opponentScore,
    opponentLevel,
    comboText,
    showComboText,
    setComboText,
  } = useGameStore();

  const comboTextTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (showComboText) {
      if (comboTextTimerRef.current) clearTimeout(comboTextTimerRef.current);
      comboTextTimerRef.current = setTimeout(() => {
        setComboText("");
        useGameStore.setState({ showComboText: false });
      }, 1200);
    }
    return () => {
      if (comboTextTimerRef.current) clearTimeout(comboTextTimerRef.current);
    };
  }, [showComboText, setComboText]);

  const wavePercent =
    waveFruitsTotal > 0 ? (waveFruitsSliced / waveFruitsTotal) * 100 : 0;

  return (
    <div className="fixed inset-0 pointer-events-none z-10">
      {/* Top Left: Level */}
      <div className="absolute top-4 left-4 flex flex-col gap-2">
        <div
          data-ocid="game.level.panel"
          className="glass-panel px-4 py-2 rounded-full flex items-center gap-2"
        >
          <span className="text-xs font-rajdhani text-yellow-400 uppercase tracking-widest">
            Level
          </span>
          <span
            className="orbitron text-2xl font-bold gold-glow"
            style={{ color: "#D4AF37" }}
          >
            {level}
          </span>
          <span className="text-xs text-gray-400">/ 1000</span>
        </div>
        <LivesDisplay lives={lives} />
      </div>

      {/* Top Center: Score */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2">
        <div
          data-ocid="game.score.panel"
          className="glass-panel px-6 py-2 rounded-full text-center"
        >
          <div className="text-xs text-gray-400 uppercase tracking-widest">
            Score
          </div>
          <div
            className="orbitron text-3xl font-black gold-glow"
            style={{ color: "#D4AF37" }}
          >
            {score.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Top Right: Combo + opponent */}
      <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
        {combo >= 2 && (
          <div
            data-ocid="game.combo.panel"
            className="glass-panel px-4 py-1 rounded-full"
          >
            <span
              className="orbitron text-lg font-bold"
              style={{ color: "#FFB24A" }}
            >
              x{comboMultiplier} COMBO
            </span>
          </div>
        )}

        {mode === "robot" && (
          <div
            data-ocid="game.robot.panel"
            className="glass-panel px-4 py-2 rounded-lg text-right"
          >
            <div className="text-xs text-gray-400">🤖 Robot</div>
            <div className="orbitron text-xl" style={{ color: "#e879f9" }}>
              {robotScore.toLocaleString()}
            </div>
          </div>
        )}

        {mode === "online" && (
          <div
            data-ocid="game.opponent.panel"
            className="glass-panel px-4 py-2 rounded-lg text-right"
          >
            <div className="text-xs text-gray-400">⚔️ Opponent</div>
            <div className="orbitron text-xl" style={{ color: "#60a5fa" }}>
              {opponentScore.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500">Lvl {opponentLevel}</div>
          </div>
        )}
      </div>

      {/* Wave Progress Bar */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-64">
        <div className="text-xs text-center mb-1" style={{ color: "#B9B2D6" }}>
          Wave Progress
        </div>
        <div
          className="h-2 rounded-full"
          style={{ background: "rgba(212,175,55,0.2)" }}
        >
          <div
            data-ocid="game.wave.progress"
            className="h-2 rounded-full transition-all duration-300"
            style={{
              width: `${wavePercent}%`,
              background: "linear-gradient(90deg, #C89A2B, #D4AF37, #FFD700)",
              boxShadow: "0 0 8px rgba(212,175,55,0.6)",
            }}
          />
        </div>
      </div>

      {/* Combo Text Pop */}
      <AnimatePresence>
        {showComboText && comboText && (
          <motion.div
            key={comboText + score}
            initial={{ opacity: 1, scale: 0.5, y: 0 }}
            animate={{ opacity: 0, scale: 1.3, y: -80 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            className="absolute top-1/3 left-1/2 -translate-x-1/2 text-4xl font-black orbitron text-center pointer-events-none"
            style={{
              color: "#FFD700",
              textShadow: "0 0 30px rgba(255,215,0,0.9)",
            }}
          >
            {comboText}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Back button */}
      <div
        className="absolute bottom-4 left-4 pointer-events-auto"
        style={{ zIndex: 20 }}
      >
        <button
          type="button"
          data-ocid="game.back.button"
          onClick={() => {
            useGameStore.setState({ isPlaying: false, screen: "mainmenu" });
          }}
          className="btn-gold px-4 py-2 rounded-lg text-sm orbitron"
          style={{ color: "#D4AF37" }}
        >
          ✕ QUIT
        </button>
      </div>
    </div>
  );
}
