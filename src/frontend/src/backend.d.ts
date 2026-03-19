import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface RoomState {
    status: Type__1;
    score1: bigint;
    score2: bigint;
    player1: string;
    player2?: string;
    level1: bigint;
    level2: bigint;
}
export interface LeaderboardEntry {
    score: bigint;
    playerName: string;
}
export interface PlayerStats {
    highestLevel: bigint;
    highestScore: bigint;
    totalGames: bigint;
}
export enum Type {
    win = "win",
    draw = "draw",
    lose = "lose"
}
export enum Type__1 {
    playing = "playing",
    finished = "finished",
    waiting = "waiting"
}
export interface backendInterface {
    createRoom(playerName: string): Promise<string>;
    getPlayerStats(): Promise<PlayerStats>;
    getRoomState(roomCode: string): Promise<RoomState>;
    getTopLeaderboardScores(): Promise<Array<LeaderboardEntry>>;
    joinRoom(roomCode: string, playerName: string): Promise<void>;
    submitLeaderboardScore(playerName: string, score: bigint): Promise<void>;
    submitRobotBattleResult(player: string, playerScore: bigint, robotScore: bigint, outcome: Type): Promise<void>;
    updatePlayerStats(highestLevel: bigint, highestScore: bigint): Promise<void>;
    updateRoomScore(roomCode: string, playerSlot: bigint, score: bigint, level: bigint): Promise<void>;
}
