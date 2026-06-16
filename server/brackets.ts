/**
 * Bracket generation utilities for Single Elimination, Double Elimination, and Round Robin.
 * All functions return arrays of InsertMatch records ready to be persisted.
 */

import type { InsertMatch } from "../drizzle/schema";

export type BracketFormat = "single_elimination" | "double_elimination" | "round_robin";

export interface BracketTeam {
  id: number;
  name: string;
  seed: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Round up to the next power of 2 */
function nextPowerOfTwo(n: number): number {
  let p = 1;
  while (p < n) p *= 2;
  return p;
}

/** Standard seeding pairs for a bracket of size n (power of 2) */
function seedPairs(size: number): [number, number][] {
  if (size === 2) return [[1, 2]];
  const half = size / 2;
  const pairs: [number, number][] = [];
  for (let i = 1; i <= half; i++) {
    pairs.push([i, size + 1 - i]);
  }
  return pairs;
}

// ─── Single Elimination ───────────────────────────────────────────────────────

export function generateSingleElimination(
  tournamentId: number,
  teams: BracketTeam[]
): InsertMatch[] {
  const size = nextPowerOfTwo(teams.length);
  const sorted = [...teams].sort((a, b) => a.seed - b.seed);
  // Pad with BYE slots
  while (sorted.length < size) {
    sorted.push({ id: -1, name: "BYE", seed: sorted.length + 1 });
  }

  const matchList: InsertMatch[] = [];
  let matchNumber = 1;

  // Round 1 — seed pairs
  const pairs = seedPairs(size);
  for (const [s1, s2] of pairs) {
    const t1 = sorted[s1 - 1];
    const t2 = sorted[s2 - 1];
    const isBye = t1.id === -1 || t2.id === -1;
    matchList.push({
      tournamentId,
      round: 1,
      matchNumber: matchNumber++,
      bracketType: "winners",
      team1Id: t1.id === -1 ? null : t1.id,
      team2Id: t2.id === -1 ? null : t2.id,
      winnerId: isBye ? (t1.id !== -1 ? t1.id : t2.id) : null,
      status: isBye ? "bye" : "pending",
      score1: 0,
      score2: 0,
    });
  }

  // Subsequent rounds — placeholders
  let roundTeams = size / 2;
  let round = 2;
  while (roundTeams >= 2) {
    for (let i = 0; i < roundTeams / 2; i++) {
      matchList.push({
        tournamentId,
        round,
        matchNumber: matchNumber++,
        bracketType: round === Math.log2(size) + 1 ? "grand_final" : "winners",
        team1Id: null,
        team2Id: null,
        winnerId: null,
        status: "pending",
        score1: 0,
        score2: 0,
      });
    }
    roundTeams /= 2;
    round++;
  }

  return matchList;
}

// ─── Double Elimination ───────────────────────────────────────────────────────

export function generateDoubleElimination(
  tournamentId: number,
  teams: BracketTeam[]
): InsertMatch[] {
  const size = nextPowerOfTwo(teams.length);
  const sorted = [...teams].sort((a, b) => a.seed - b.seed);
  while (sorted.length < size) {
    sorted.push({ id: -1, name: "BYE", seed: sorted.length + 1 });
  }

  const matchList: InsertMatch[] = [];
  let matchNumber = 1;

  // Winners bracket Round 1
  const pairs = seedPairs(size);
  for (const [s1, s2] of pairs) {
    const t1 = sorted[s1 - 1];
    const t2 = sorted[s2 - 1];
    const isBye = t1.id === -1 || t2.id === -1;
    matchList.push({
      tournamentId,
      round: 1,
      matchNumber: matchNumber++,
      bracketType: "winners",
      team1Id: t1.id === -1 ? null : t1.id,
      team2Id: t2.id === -1 ? null : t2.id,
      winnerId: isBye ? (t1.id !== -1 ? t1.id : t2.id) : null,
      status: isBye ? "bye" : "pending",
      score1: 0,
      score2: 0,
    });
  }

  // Winners bracket subsequent rounds
  const wRounds = Math.log2(size);
  for (let r = 2; r <= wRounds; r++) {
    const matchesInRound = size / Math.pow(2, r);
    for (let i = 0; i < matchesInRound; i++) {
      matchList.push({
        tournamentId,
        round: r,
        matchNumber: matchNumber++,
        bracketType: "winners",
        team1Id: null,
        team2Id: null,
        winnerId: null,
        status: "pending",
        score1: 0,
        score2: 0,
      });
    }
  }

  // Losers bracket — 2*(wRounds-1) rounds
  const lRounds = 2 * (wRounds - 1);
  for (let r = 1; r <= lRounds; r++) {
    const matchesInRound = Math.max(1, size / Math.pow(2, Math.ceil(r / 2) + 1));
    for (let i = 0; i < matchesInRound; i++) {
      matchList.push({
        tournamentId,
        round: r,
        matchNumber: matchNumber++,
        bracketType: "losers",
        team1Id: null,
        team2Id: null,
        winnerId: null,
        status: "pending",
        score1: 0,
        score2: 0,
      });
    }
  }

  // Grand Final
  matchList.push({
    tournamentId,
    round: 1,
    matchNumber: matchNumber++,
    bracketType: "grand_final",
    team1Id: null,
    team2Id: null,
    winnerId: null,
    status: "pending",
    score1: 0,
    score2: 0,
  });

  return matchList;
}

// ─── Round Robin ──────────────────────────────────────────────────────────────

export function generateRoundRobin(
  tournamentId: number,
  teams: BracketTeam[]
): InsertMatch[] {
  const matchList: InsertMatch[] = [];
  let matchNumber = 1;

  // Standard round-robin scheduling (circle method)
  const n = teams.length % 2 === 0 ? teams.length : teams.length + 1;
  const teamList = [...teams];
  if (teams.length % 2 !== 0) {
    teamList.push({ id: -1, name: "BYE", seed: n });
  }

  const rounds = n - 1;
  for (let round = 1; round <= rounds; round++) {
    for (let i = 0; i < n / 2; i++) {
      const t1 = teamList[i];
      const t2 = teamList[n - 1 - i];
      const isBye = t1.id === -1 || t2.id === -1;
      matchList.push({
        tournamentId,
        round,
        matchNumber: matchNumber++,
        bracketType: "group",
        team1Id: t1.id === -1 ? null : t1.id,
        team2Id: t2.id === -1 ? null : t2.id,
        winnerId: null,
        status: isBye ? "bye" : "pending",
        score1: 0,
        score2: 0,
      });
    }
    // Rotate teams (keep first fixed)
    const last = teamList.pop()!;
    teamList.splice(1, 0, last);
  }

  return matchList;
}

// ─── Master generator ─────────────────────────────────────────────────────────

export function generateBracket(
  format: BracketFormat,
  tournamentId: number,
  teams: BracketTeam[]
): InsertMatch[] {
  switch (format) {
    case "single_elimination":
      return generateSingleElimination(tournamentId, teams);
    case "double_elimination":
      return generateDoubleElimination(tournamentId, teams);
    case "round_robin":
      return generateRoundRobin(tournamentId, teams);
  }
}
