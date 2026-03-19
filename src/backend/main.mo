import Map "mo:core/Map";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";

actor {
  module RoomStatus {
    public type Type = { #waiting; #playing; #finished };

    public func compare(status1 : Type, status2 : Type) : Order.Order {
      switch (status1, status2) {
        case (#waiting, #waiting) { #equal };
        case (#waiting, _) { #less };
        case (#playing, #waiting) { #greater };
        case (#playing, #playing) { #equal };
        case (#playing, #finished) { #less };
        case (#finished, #finished) { #equal };
        case (#finished, _) { #greater };
      };
    };
  };

  module GameResult {
    public type Type = { #win; #lose; #draw };

    public func compare(result1 : Type, result2 : Type) : Order.Order {
      switch (result1, result2) {
        case (#win, #win) { #equal };
        case (#win, _) { #less };
        case (#lose, #lose) { #equal };
        case (#lose, #draw) { #less };
        case (#draw, #draw) { #equal };
        case (#draw, _) { #greater };
      };
    };
  };

  type LeaderboardEntry = {
    playerName : Text;
    score : Nat;
  };

  module LeaderboardEntry {
    public func compareByScore(entry1 : LeaderboardEntry, entry2 : LeaderboardEntry) : Order.Order {
      switch (Nat.compare(entry2.score, entry1.score)) {
        case (#equal) { Text.compare(entry1.playerName, entry2.playerName) };
        case (order) { order };
      };
    };
  };

  type RoomState = {
    player1 : Text;
    player2 : ?Text;
    score1 : Nat;
    score2 : Nat;
    level1 : Nat;
    level2 : Nat;
    status : RoomStatus.Type;
  };

  module RoomState {
    public func compareByStatus(state1 : RoomState, state2 : RoomState) : Order.Order {
      switch (
        Text.compare(state1.player1, state2.player1),
        state1.player2.compare(state2.player2)
      ) {
        case (#equal, #equal) { RoomStatus.compare(state1.status, state2.status) };
        case (#equal, order) { order };
        case (order, _) { order };
      };
    };
  };

  type RobotBattleResult = {
    playerScore : Nat;
    robotScore : Nat;
    outcome : GameResult.Type;
  };

  module RobotBattleResult {
    public func compareByOutcome(result1 : RobotBattleResult, result2 : RobotBattleResult) : Order.Order {
      switch (GameResult.compare(result1.outcome, result2.outcome)) {
        case (#equal) { Nat.compare(result1.playerScore, result2.playerScore) };
        case (order) { order };
      };
    };
  };

  type PlayerStats = {
    totalGames : Nat;
    highestLevel : Nat;
    highestScore : Nat;
  };

  module PlayerStats {
    public func compareByHighestScore(stats1 : PlayerStats, stats2 : PlayerStats) : Order.Order {
      Nat.compare(stats2.highestScore, stats1.highestScore);
    };
  };

  let leaderboardEntries = Map.empty<Text, Nat>();
  let roomStates = Map.empty<Text, RoomState>();
  let robotBattleResults = Map.empty<Text, RobotBattleResult>();
  let playerStats = Map.empty<Principal, PlayerStats>();

  public shared ({ caller }) func submitLeaderboardScore(playerName : Text, score : Nat) : async () {
    leaderboardEntries.add(playerName, score);
  };

  public query ({ caller }) func getTopLeaderboardScores() : async [LeaderboardEntry] {
    let allEntries = leaderboardEntries.entries().toArray();
    if (allEntries.size() == 0) {
      return [];
    };

    let sortedEntries = allEntries.sort(
      func(a, b) {
        if (a.1 > b.1) { #less } else if (a.1 < b.1) { #greater } else {
          Text.compare(a.0, b.0);
        };
      }
    );

    let topEntries = sortedEntries.sliceToArray(0, Nat.min(sortedEntries.size(), 20));
    topEntries.map<(Text, Nat), LeaderboardEntry>(
      func(entry) {
        {
          playerName = entry.0;
          score = entry.1;
        };
      }
    );
  };

  public shared ({ caller }) func createRoom(playerName : Text) : async Text {
    let roomCode = playerName.concat(caller.toText());
    let newRoom = {
      player1 = playerName;
      player2 = null;
      score1 = 0;
      score2 = 0;
      level1 = 1;
      level2 = 1;
      status = #waiting;
    };
    roomStates.add(roomCode, newRoom);
    roomCode;
  };

  public shared ({ caller }) func joinRoom(roomCode : Text, playerName : Text) : async () {
    switch (roomStates.get(roomCode)) {
      case (null) { Runtime.trap("Room does not exist") };
      case (?roomState) {
        if (roomState.player2 != null) {
          Runtime.trap("Room is already full");
        };
        let updatedRoom = {
          roomState with
          player2 = ?playerName;
          status = #playing;
        };
        roomStates.add(roomCode, updatedRoom);
      };
    };
  };

  public query ({ caller }) func getRoomState(roomCode : Text) : async RoomState {
    switch (roomStates.get(roomCode)) {
      case (null) { Runtime.trap("Room does not exist") };
      case (?roomState) { roomState };
    };
  };

  public shared ({ caller }) func updateRoomScore(roomCode : Text, playerSlot : Nat, score : Nat, level : Nat) : async () {
    if (playerSlot != 1 and playerSlot != 2) {
      Runtime.trap("Invalid player slot. Must be 1 or 2");
    };
    switch (roomStates.get(roomCode)) {
      case (null) { Runtime.trap("Room does not exist") };
      case (?roomState) {
        let updatedRoom = switch (playerSlot) {
          case (1) {
            { roomState with score1 = score; level1 = level };
          };
          case (2) {
            { roomState with score2 = score; level2 = level };
          };
          case (_) {
            Runtime.trap("Invalid player slot. Must be 1 or 2");
          };
        };
        roomStates.add(roomCode, updatedRoom);
      };
    };
  };

  public shared ({ caller }) func submitRobotBattleResult(player : Text, playerScore : Nat, robotScore : Nat, outcome : GameResult.Type) : async () {
    let result = {
      playerScore;
      robotScore;
      outcome;
    };
    robotBattleResults.add(player, result);
  };

  public shared ({ caller }) func updatePlayerStats(highestLevel : Nat, highestScore : Nat) : async () {
    let stats : PlayerStats = {
      totalGames = 1;
      highestLevel;
      highestScore;
    };
    playerStats.add(caller, stats);
  };

  public query ({ caller }) func getPlayerStats() : async PlayerStats {
    switch (playerStats.get(caller)) {
      case (null) { Runtime.trap("No stats found for current user") };
      case (?stats) { stats };
    };
  };
};
