import { motion } from "motion/react";
import React, { useState } from "react";
import { startAmbient } from "../game/AudioManager";
import { useGameStore } from "../game/gameStore";
import { useActor } from "../hooks/useActor";

export function OnlineLobby() {
  const { setScreen, startGame, setRoomCode, setPlayerName, playerName } =
    useGameStore();
  const { actor } = useActor();
  const [nameInput, setNameInput] = useState(playerName || "");
  const [joinCode, setJoinCode] = useState("");
  const [createdCode, setCreatedCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreateRoom = async () => {
    if (!nameInput.trim()) {
      setError("Enter your name first");
      return;
    }
    if (!actor) {
      setError("Not connected");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const code = await actor.createRoom(nameInput.trim());
      setCreatedCode(code);
      setRoomCode(code);
      setPlayerName(nameInput.trim());
    } catch {
      setError("Failed to create room");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!nameInput.trim()) {
      setError("Enter your name first");
      return;
    }
    if (!joinCode.trim()) {
      setError("Enter room code");
      return;
    }
    if (!actor) {
      setError("Not connected");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await actor.joinRoom(joinCode.trim(), nameInput.trim());
      setRoomCode(joinCode.trim());
      setPlayerName(nameInput.trim());
      startAmbient();
      startGame("online");
    } catch {
      setError("Failed to join room");
    } finally {
      setLoading(false);
    }
  };

  const handleStartWithCode = () => {
    if (createdCode) {
      startAmbient();
      startGame("online");
    }
  };

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center z-30"
      style={{
        background:
          "radial-gradient(ellipse at center, #2B155A 0%, #0B0614 100%)",
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="glass-panel rounded-2xl p-8 w-full max-w-md mx-4"
      >
        <div
          className="orbitron text-3xl font-black text-center mb-6"
          style={{ color: "#60a5fa" }}
        >
          🌐 ONLINE LOBBY
        </div>

        {/* Player name */}
        <div className="mb-6">
          <label
            htmlFor="lobby-name"
            className="block text-sm mb-2"
            style={{ color: "#B9B2D6" }}
          >
            Your Name
          </label>
          <input
            id="lobby-name"
            data-ocid="lobby.name.input"
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="Enter your name..."
            maxLength={20}
            className="w-full bg-transparent border rounded-lg px-4 py-3 orbitron text-sm outline-none focus:ring-1"
            style={{
              borderColor: "rgba(212,175,55,0.4)",
              color: "#F3F1FF",
              background: "rgba(20,10,40,0.6)",
            }}
          />
        </div>

        {/* Create Room */}
        <div className="mb-4">
          <button
            type="button"
            data-ocid="lobby.create.button"
            onClick={handleCreateRoom}
            disabled={loading}
            className="btn-gold w-full py-3 rounded-xl orbitron font-bold"
            style={{ color: "#D4AF37" }}
          >
            {loading ? "Creating..." : "+ CREATE ROOM"}
          </button>
          {createdCode && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-3 glass-panel px-4 py-3 rounded-lg text-center"
            >
              <div className="text-xs mb-1" style={{ color: "#B9B2D6" }}>
                Share this code:
              </div>
              <div
                className="orbitron text-3xl font-black"
                style={{ color: "#D4AF37" }}
              >
                {createdCode}
              </div>
              <button
                type="button"
                data-ocid="lobby.start.button"
                onClick={handleStartWithCode}
                className="btn-gold mt-3 px-6 py-2 rounded-lg orbitron text-sm font-bold"
                style={{ color: "#60a5fa" }}
              >
                START GAME →
              </button>
            </motion.div>
          )}
        </div>

        <div className="flex items-center gap-3 my-4">
          <div
            className="flex-1 h-px"
            style={{ background: "rgba(212,175,55,0.2)" }}
          />
          <span className="text-sm" style={{ color: "#B9B2D6" }}>
            OR
          </span>
          <div
            className="flex-1 h-px"
            style={{ background: "rgba(212,175,55,0.2)" }}
          />
        </div>

        {/* Join Room */}
        <div className="flex gap-2">
          <input
            data-ocid="lobby.code.input"
            type="text"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            placeholder="ROOM CODE"
            maxLength={6}
            className="flex-1 bg-transparent border rounded-lg px-4 py-3 orbitron text-sm uppercase outline-none"
            style={{
              borderColor: "rgba(96,165,250,0.4)",
              color: "#F3F1FF",
              background: "rgba(20,10,40,0.6)",
            }}
          />
          <button
            type="button"
            data-ocid="lobby.join.button"
            onClick={handleJoinRoom}
            disabled={loading}
            className="btn-gold px-5 py-3 rounded-xl orbitron font-bold"
            style={{ color: "#60a5fa" }}
          >
            JOIN
          </button>
        </div>

        {error && (
          <div
            data-ocid="lobby.error_state"
            className="mt-3 text-sm text-center"
            style={{ color: "#f87171" }}
          >
            {error}
          </div>
        )}

        <button
          type="button"
          data-ocid="lobby.back.button"
          onClick={() => setScreen("mainmenu")}
          className="btn-gold w-full mt-6 py-3 rounded-xl orbitron text-sm"
          style={{ color: "#B9B2D6" }}
        >
          ← BACK
        </button>
      </motion.div>
    </div>
  );
}
