import { motion } from "motion/react";
import React, { useEffect } from "react";
import { stopAmbient } from "../game/AudioManager";
import { useGameStore } from "../game/gameStore";
import { useActor } from "../hooks/useActor";

export function GameOver() {
  const {
    finalScore,
    finalLevel,
    robotScore,
    mode,
    playerName,
    startGame,
    setScreen,
  } = useGameStore();
  const { actor } = useActor();

  useEffect(() => {
    stopAmbient();
    if (!actor) return;

    const submit = async () => {
      try {
        await Promise.all([
          actor.submitLeaderboardScore(
            playerName || "Anonymous",
            BigInt(finalScore),
          ),
          actor.updatePlayerStats(BigInt(finalLevel), BigInt(finalScore)),
        ]);
        if (mode === "robot") {
          // Bug 5 fix: replaced Type enum (from backend.d) with plain string literals
          const outcome: string =
            finalScore > robotScore
              ? "win"
              : finalScore < robotScore
                ? "lose"
                : "draw";
          await actor.submitRobotBattleResult(
            playerName || "Anonymous",
            BigInt(finalScore),
            BigInt(robotScore),
            outcome as any,
          );
        }
      } catch (_) {}
    };
    submit();
  }, [actor, playerName, finalScore, finalLevel, mode, robotScore]);

  const isWin = mode === "robot" ? finalScore > robotScore : true;

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center z-30"
      style={{
        background:
          "radial-gradient(ellipse at center, #2B155A 0%, #0B0614 100%)",
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="glass-panel p-10 rounded-2xl text-center max-w-md w-full mx-4"
      >
        <div
          className="orbitron text-5xl font-black mb-2"
          style={{ color: isWin ? "#D4AF37" : "#e879f9" }}
        >
          {mode === "robot" ? (isWin ? "VICTORY!" : "DEFEATED") : "GAME OVER"}
        </div>

        <div className="my-6 space-y-3">
          <div className="flex justify-between items-center">
            <span style={{ color: "#B9B2D6" }}>Final Score</span>
            <span className="orbitron text-2xl" style={{ color: "#D4AF37" }}>
              {finalScore.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span style={{ color: "#B9B2D6" }}>Level Reached</span>
            <span className="orbitron text-2xl" style={{ color: "#D4AF37" }}>
              {finalLevel} / 1000
            </span>
          </div>
          {mode === "robot" && (
            <div className="flex justify-between items-center">
              <span style={{ color: "#B9B2D6" }}>🤖 Robot Score</span>
              <span className="orbitron text-2xl" style={{ color: "#e879f9" }}>
                {robotScore.toLocaleString()}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            data-ocid="gameover.play_again.primary_button"
            onClick={() => startGame(mode)}
            className="btn-gold py-4 px-8 rounded-xl orbitron text-lg font-bold"
            style={{ color: "#D4AF37" }}
          >
            ▶ PLAY AGAIN
          </button>
          <button
            type="button"
            data-ocid="gameover.leaderboard.secondary_button"
            onClick={() => setScreen("leaderboard")}
            className="btn-gold py-3 px-8 rounded-xl orbitron text-base"
            style={{ color: "#B9B2D6" }}
          >
            🏆 LEADERBOARD
          </button>
          <button
            type="button"
            data-ocid="gameover.mainmenu.secondary_button"
            onClick={() => setScreen("mainmenu")}
            className="btn-gold py-3 px-8 rounded-xl orbitron text-base"
            style={{ color: "#B9B2D6" }}
          >
            ← MAIN MENU
          </button>
        </div>
      </motion.div>
    </div>
  );
}
