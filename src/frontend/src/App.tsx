import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { useGameStore } from "./game/gameStore";
import { GameOver } from "./screens/GameOver";
import { GameScreen } from "./screens/GameScreen";
import { Leaderboard } from "./screens/Leaderboard";
import { MainMenu } from "./screens/MainMenu";
import { OnlineLobby } from "./screens/OnlineLobby";

const queryClient = new QueryClient();

function AppContent() {
  const { screen } = useGameStore();

  return (
    <div className="fixed inset-0" style={{ background: "#0B0614" }}>
      {screen === "mainmenu" && <MainMenu />}
      {screen === "game" && <GameScreen />}
      {screen === "gameover" && <GameOver />}
      {screen === "leaderboard" && <Leaderboard />}
      {screen === "online_lobby" && <OnlineLobby />}
      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}
