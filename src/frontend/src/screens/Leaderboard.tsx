import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import React from "react";
import { useGameStore } from "../game/gameStore";
import { useActor } from "../hooks/useActor";

export function Leaderboard() {
  const { setScreen } = useGameStore();
  const { actor, isFetching } = useActor();

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTopLeaderboardScores();
    },
    enabled: !!actor && !isFetching,
  });

  return (
    <div
      className="fixed inset-0 flex flex-col items-center z-30 overflow-auto py-8"
      style={{
        background:
          "radial-gradient(ellipse at center, #2B155A 0%, #0B0614 100%)",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl mx-4 px-4"
      >
        <div
          className="orbitron text-4xl font-black text-center mb-8"
          style={{ color: "#D4AF37" }}
        >
          🏆 LEADERBOARD
        </div>

        <div className="glass-panel rounded-2xl overflow-hidden">
          {isLoading ? (
            <div
              data-ocid="leaderboard.loading_state"
              className="p-8 text-center"
              style={{ color: "#B9B2D6" }}
            >
              <div className="orbitron text-lg animate-pulse-gold">
                Loading scores...
              </div>
            </div>
          ) : entries.length === 0 ? (
            <div
              data-ocid="leaderboard.empty_state"
              className="p-8 text-center"
              style={{ color: "#B9B2D6" }}
            >
              <div className="text-4xl mb-2">⚔️</div>
              <div>No scores yet. Be the first!</div>
            </div>
          ) : (
            <div data-ocid="leaderboard.table">
              {entries.slice(0, 20).map((entry, i) => (
                <div
                  key={`${entry.playerName}-${i}`}
                  data-ocid={`leaderboard.item.${i + 1}`}
                  className="flex items-center px-6 py-4 border-b"
                  style={{
                    borderColor: "rgba(212,175,55,0.15)",
                    background: i < 3 ? "rgba(212,175,55,0.05)" : "transparent",
                  }}
                >
                  <div
                    className="orbitron text-2xl font-black w-12 text-center"
                    style={{
                      color:
                        i === 0
                          ? "#FFD700"
                          : i === 1
                            ? "#C0C0C0"
                            : i === 2
                              ? "#CD7F32"
                              : "#5A2FA0",
                    }}
                  >
                    {i === 0
                      ? "🥇"
                      : i === 1
                        ? "🥈"
                        : i === 2
                          ? "🥉"
                          : `#${i + 1}`}
                  </div>
                  <div className="flex-1 ml-4">
                    <div className="font-bold" style={{ color: "#F3F1FF" }}>
                      {entry.playerName}
                    </div>
                  </div>
                  <div
                    className="orbitron text-xl font-bold"
                    style={{ color: "#D4AF37" }}
                  >
                    {Number(entry.score).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          data-ocid="leaderboard.back.button"
          onClick={() => setScreen("mainmenu")}
          className="btn-gold w-full mt-6 py-3 rounded-xl orbitron text-base font-bold"
          style={{ color: "#B9B2D6" }}
        >
          ← BACK TO MENU
        </button>
      </motion.div>
    </div>
  );
}
