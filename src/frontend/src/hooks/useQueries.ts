import { useQuery } from "@tanstack/react-query";
import { useActor } from "./useActor";

export function useLeaderboard() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTopLeaderboardScores();
    },
    enabled: !!actor && !isFetching,
  });
}

export function usePlayerStats() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["playerStats"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getPlayerStats();
    },
    enabled: !!actor && !isFetching,
  });
}
