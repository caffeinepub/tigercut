import { motion } from "motion/react";
import React from "react";
import { startAmbient } from "../game/AudioManager";
import { useGameStore } from "../game/gameStore";

export function MainMenu() {
  const { setScreen, startGame, setMode } = useGameStore();

  const handlePlay = (mode: "solo" | "robot" | "online") => {
    startAmbient();
    if (mode === "online") {
      setMode("online");
      setScreen("online_lobby");
    } else {
      startGame(mode);
    }
  };

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center z-20"
      style={{
        background:
          "radial-gradient(ellipse at center, #2B155A 0%, #1a0d38 40%, #0B0614 100%)",
      }}
    >
      {/* Ambient gold orbs */}
      <div
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl"
        style={{ background: "radial-gradient(circle, #D4AF37, transparent)" }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full opacity-10 blur-3xl"
        style={{ background: "radial-gradient(circle, #FFB24A, transparent)" }}
      />

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -60, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center mb-12"
      >
        <div
          className="orbitron text-8xl font-black tracking-wider mb-2"
          style={{
            color: "#D4AF37",
            textShadow:
              "0 0 40px rgba(212,175,55,0.8), 0 0 80px rgba(212,175,55,0.4), 0 0 120px rgba(212,175,55,0.2)",
          }}
        >
          TIGER
          <span style={{ color: "#FFB24A" }}>CUT</span>
        </div>
        <div
          className="text-lg tracking-[0.5em] uppercase"
          style={{ color: "#B9B2D6" }}
        >
          Slice. Score. Dominate.
        </div>
        <div
          className="mt-2 text-sm tracking-widest"
          style={{ color: "rgba(212,175,55,0.5)" }}
        >
          1,000 LEVELS OF FURY
        </div>
      </motion.div>

      {/* Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
        className="flex flex-col gap-4 w-72"
      >
        <button
          type="button"
          data-ocid="menu.solo.button"
          onClick={() => handlePlay("solo")}
          className="btn-gold py-4 px-8 rounded-xl orbitron text-lg font-bold tracking-wider"
          style={{ color: "#D4AF37" }}
        >
          ⚔️ PLAY SOLO
        </button>

        <button
          type="button"
          data-ocid="menu.robot.button"
          onClick={() => handlePlay("robot")}
          className="btn-gold py-4 px-8 rounded-xl orbitron text-lg font-bold tracking-wider"
          style={{ color: "#e879f9" }}
        >
          🤖 ROBOT BATTLE
        </button>

        <button
          type="button"
          data-ocid="menu.online.button"
          onClick={() => handlePlay("online")}
          className="btn-gold py-4 px-8 rounded-xl orbitron text-lg font-bold tracking-wider"
          style={{ color: "#60a5fa" }}
        >
          🌐 ONLINE MULTIPLAYER
        </button>

        <button
          type="button"
          data-ocid="menu.leaderboard.button"
          onClick={() => setScreen("leaderboard")}
          className="btn-gold py-3 px-8 rounded-xl orbitron text-base font-bold tracking-wider"
          style={{ color: "#B9B2D6" }}
        >
          🏆 LEADERBOARD
        </button>
      </motion.div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-6 text-center text-xs"
        style={{ color: "rgba(185,178,214,0.4)" }}
      >
        © {new Date().getFullYear()}. Built with love using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "rgba(212,175,55,0.6)" }}
        >
          caffeine.ai
        </a>
      </motion.div>
    </div>
  );
}
