import React, { useEffect, useRef } from "react";
import { FruitScene } from "../game/FruitScene";
import { GameHUD } from "../game/GameHUD";
import { useGameStore } from "../game/gameStore";
import { useActor } from "../hooks/useActor";

export function GameScreen() {
  const {
    mode,
    roomCode,
    playerName: _playerName,
    score,
    level,
    updateOnlineOpponent,
    setRobotScore,
    isPlaying,
  } = useGameStore();
  const { actor } = useActor();
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const robotUpdateRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Online: poll room state
  useEffect(() => {
    if (mode !== "online" || !roomCode || !actor) return;
    pollRef.current = setInterval(async () => {
      try {
        const state = await actor.getRoomState(roomCode);
        const playerSlot = 1;
        const oppScore =
          playerSlot === 1 ? Number(state.score2) : Number(state.score1);
        const oppLevel =
          playerSlot === 1 ? Number(state.level2) : Number(state.level1);
        updateOnlineOpponent(oppScore, oppLevel);
        if (state.status === "finished") {
          useGameStore.setState({ isPlaying: false, screen: "gameover" });
        }
      } catch (_) {}
    }, 2000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [mode, roomCode, actor, updateOnlineOpponent]);

  // Online: push score
  useEffect(() => {
    if (mode !== "online" || !roomCode || !actor) return;
    const push = async () => {
      try {
        await actor.updateRoomScore(
          roomCode,
          BigInt(1),
          BigInt(score),
          BigInt(level),
        );
      } catch (_) {}
    };
    push();
  }, [score, level, mode, roomCode, actor]);

  // Robot: simulate robot score
  useEffect(() => {
    if (mode !== "robot" || !isPlaying) return;
    robotUpdateRef.current = setInterval(() => {
      const accuracy = level < 100 ? 0.7 : level < 500 ? 0.85 : 0.95;
      const robotGain =
        Math.random() < accuracy ? Math.floor(10 * (1 + level * 0.01)) : 0;
      if (robotGain > 0) {
        setRobotScore(useGameStore.getState().robotScore + robotGain);
      }
    }, 800);
    return () => {
      if (robotUpdateRef.current) clearInterval(robotUpdateRef.current);
    };
  }, [mode, isPlaying, level, setRobotScore]);

  return (
    <>
      <FruitScene mode={mode} />
      <GameHUD />
    </>
  );
}
