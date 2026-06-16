import { describe, expect, it } from "vitest";
import { generateBracket, generateSingleElimination, generateDoubleElimination, generateRoundRobin } from "./brackets";
import type { BracketTeam } from "./brackets";

const TOURNAMENT_ID = 1;

function makeTeams(n: number): BracketTeam[] {
  return Array.from({ length: n }, (_, i) => ({ id: i + 1, name: `Team ${i + 1}`, seed: i + 1 }));
}

// ─── Single Elimination ───────────────────────────────────────────────────────
describe("generateSingleElimination", () => {
  it("generates 3 matches for 4 teams", () => {
    const matches = generateSingleElimination(TOURNAMENT_ID, makeTeams(4));
    expect(matches.length).toBe(3);
  });

  it("generates 7 matches for 8 teams", () => {
    const matches = generateSingleElimination(TOURNAMENT_ID, makeTeams(8));
    expect(matches.length).toBe(7);
  });

  it("generates 1 match for 2 teams", () => {
    const matches = generateSingleElimination(TOURNAMENT_ID, makeTeams(2));
    expect(matches.length).toBe(1);
    expect(matches[0].team1Id).toBe(1);
    expect(matches[0].team2Id).toBe(2);
  });

  it("handles 3 teams with BYE padding", () => {
    const matches = generateSingleElimination(TOURNAMENT_ID, makeTeams(3));
    // 3 teams → padded to 4 → 3 matches
    expect(matches.length).toBe(3);
    const round1 = matches.filter((m) => m.round === 1);
    const hasBye = round1.some((m) => m.team1Id === null || m.team2Id === null);
    expect(hasBye).toBe(true);
  });

  it("sets bracketType to 'winners' for all SE matches", () => {
    const matches = generateSingleElimination(TOURNAMENT_ID, makeTeams(4));
    expect(matches.every((m) => m.bracketType === "winners")).toBe(true);
  });

  it("sets status to 'pending' for non-BYE matches", () => {
    const matches = generateSingleElimination(TOURNAMENT_ID, makeTeams(4));
    const nonBye = matches.filter((m) => m.status !== "bye");
    expect(nonBye.every((m) => m.status === "pending")).toBe(true);
  });

  it("assigns correct tournamentId to all matches", () => {
    const matches = generateSingleElimination(42, makeTeams(4));
    expect(matches.every((m) => m.tournamentId === 42)).toBe(true);
  });
});

// ─── Double Elimination ───────────────────────────────────────────────────────
describe("generateDoubleElimination", () => {
  it("generates winners + losers + grand_final brackets for 4 teams", () => {
    const matches = generateDoubleElimination(TOURNAMENT_ID, makeTeams(4));
    const types = Array.from(new Set(matches.map((m) => m.bracketType)));
    expect(types).toContain("winners");
    expect(types).toContain("losers");
    expect(types).toContain("grand_final");
  });

  it("generates more matches than SE for same team count", () => {
    const se = generateSingleElimination(TOURNAMENT_ID, makeTeams(4));
    const de = generateDoubleElimination(TOURNAMENT_ID, makeTeams(4));
    expect(de.length).toBeGreaterThan(se.length);
  });

  it("has exactly 1 grand_final match", () => {
    const matches = generateDoubleElimination(TOURNAMENT_ID, makeTeams(4));
    const gf = matches.filter((m) => m.bracketType === "grand_final");
    expect(gf.length).toBe(1);
  });
});

// ─── Round Robin ──────────────────────────────────────────────────────────────
describe("generateRoundRobin", () => {
  it("generates 6 matches for 4 teams (n*(n-1)/2)", () => {
    const matches = generateRoundRobin(TOURNAMENT_ID, makeTeams(4));
    const realMatches = matches.filter((m) => m.status !== "bye");
    expect(realMatches.length).toBe(6);
  });

  it("generates 3 matches for 3 teams", () => {
    const matches = generateRoundRobin(TOURNAMENT_ID, makeTeams(3));
    const realMatches = matches.filter((m) => m.status !== "bye");
    expect(realMatches.length).toBe(3);
  });

  it("sets bracketType to 'group' for all RR matches", () => {
    const matches = generateRoundRobin(TOURNAMENT_ID, makeTeams(4));
    expect(matches.every((m) => m.bracketType === "group")).toBe(true);
  });

  it("each team plays against every other team exactly once", () => {
    const teams = makeTeams(4);
    const matches = generateRoundRobin(TOURNAMENT_ID, teams);
    const pairs = new Set<string>();
    for (const m of matches) {
      if (m.team1Id && m.team2Id) {
        const key = [Math.min(m.team1Id, m.team2Id), Math.max(m.team1Id, m.team2Id)].join("-");
        pairs.add(key);
      }
    }
    // 4 teams: C(4,2) = 6 unique pairs
    expect(pairs.size).toBe(6);
  });
});

// ─── Master generator ─────────────────────────────────────────────────────────
describe("generateBracket (master)", () => {
  it("delegates to SE correctly", () => {
    const matches = generateBracket("single_elimination", TOURNAMENT_ID, makeTeams(4));
    expect(matches.every((m) => m.bracketType === "winners")).toBe(true);
  });

  it("delegates to DE correctly", () => {
    const matches = generateBracket("double_elimination", TOURNAMENT_ID, makeTeams(4));
    const types = Array.from(new Set(matches.map((m) => m.bracketType)));
    expect(types).toContain("grand_final");
  });

  it("delegates to RR correctly", () => {
    const matches = generateBracket("round_robin", TOURNAMENT_ID, makeTeams(4));
    expect(matches.every((m) => m.bracketType === "group")).toBe(true);
  });
});
