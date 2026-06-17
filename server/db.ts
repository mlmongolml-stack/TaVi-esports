import { and, desc, eq, like, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import {
  Bracket,
  InsertBracket,
  InsertMatch,
  InsertNews,
  InsertPlayer,
  InsertTeam,
  InsertTournament,
  InsertTournamentRegistration,
  InsertUser,
  Match,
  Tournament,
  brackets,
  matches,
  news,
  players,
  teams,
  tournamentRegistrations,
  tournaments,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;
let _pool: Pool | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _pool = new Pool({ connectionString: process.env.DATABASE_URL });
      _db = drizzle(_pool);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
      _pool = null;
    }
  }
  return _db;
}

// ─── Users ────────────────────────────────────────────────────────────────────
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};

  const textFields = ["name", "email", "loginMethod"] as const;
  for (const field of textFields) {
    const value = user[field];
    if (value === undefined) continue;
    const normalized = value ?? null;
    values[field] = normalized;
    updateSet[field] = normalized;
  }

  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }

  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

  // PostgreSQL: Use ON CONFLICT for upsert
  const existingUser = await db.select().from(users).where(eq(users.openId, user.openId)).limit(1);
  if (existingUser.length > 0) {
    await db.update(users).set(updateSet).where(eq(users.openId, user.openId));
  } else {
    await db.insert(users).values(values);
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

// ─── Teams ────────────────────────────────────────────────────────────────────
export async function createTeam(data: InsertTeam) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.insert(teams).values(data);
}

export async function getTeamByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(teams).where(eq(teams.userId, userId)).limit(1);
  return result[0];
}

export async function getTeamById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(teams).where(eq(teams.id, id)).limit(1);
  return result[0];
}

export async function updateTeam(id: number, data: Partial<InsertTeam>) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.update(teams).set(data).where(eq(teams.id, id));
}

export async function getAllTeams(search?: string) {
  const db = await getDb();
  if (!db) return [];
  if (search) {
    return db.select().from(teams).where(like(teams.name, `%${search}%`)).orderBy(desc(teams.points));
  }
  return db.select().from(teams).orderBy(desc(teams.points));
}

export async function getTeamsCount() {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: sql<number>`count(*)` }).from(teams);
  return result[0]?.count ?? 0;
}

// ─── Players ──────────────────────────────────────────────────────────────────
export async function getPlayersByTeamId(teamId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(players).where(eq(players.teamId, teamId));
}

export async function replaceTeamPlayers(teamId: number, newPlayers: Omit<InsertPlayer, "teamId">[]) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.delete(players).where(eq(players.teamId, teamId));
  if (newPlayers.length > 0) {
    await db.insert(players).values(newPlayers.map((p) => ({ ...p, teamId })));
  }
}

// ─── Tournaments ──────────────────────────────────────────────────────────────
export async function createTournament(data: InsertTournament) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.insert(tournaments).values(data);
}

export async function getTournaments(status?: Tournament["status"]) {
  const db = await getDb();
  if (!db) return [];
  if (status) {
    return db
      .select()
      .from(tournaments)
      .where(eq(tournaments.status, status))
      .orderBy(desc(tournaments.startDate));
  }
  return db.select().from(tournaments).orderBy(desc(tournaments.startDate));
}

export async function getTournamentBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(tournaments).where(eq(tournaments.slug, slug)).limit(1);
  return result[0];
}

export async function getTournamentById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(tournaments).where(eq(tournaments.id, id)).limit(1);
  return result[0];
}

export async function updateTournament(id: number, data: Partial<InsertTournament>) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.update(tournaments).set(data).where(eq(tournaments.id, id));
}

// ─── Tournament Registrations ─────────────────────────────────────────────────
export async function registerTeamForTournament(data: InsertTournamentRegistration) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.insert(tournamentRegistrations).values(data);
}

export async function getRegistrationsByTournament(tournamentId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(tournamentRegistrations)
    .where(eq(tournamentRegistrations.tournamentId, tournamentId));
}

export async function getRegistrationsByTeam(teamId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(tournamentRegistrations)
    .where(eq(tournamentRegistrations.teamId, teamId));
}

export async function updateRegistrationStatus(
  id: number,
  status: "pending" | "approved" | "rejected"
) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.update(tournamentRegistrations).set({ status }).where(eq(tournamentRegistrations.id, id));
}

export async function getRegistrationByTournamentAndTeam(tournamentId: number, teamId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(tournamentRegistrations)
    .where(
      and(
        eq(tournamentRegistrations.tournamentId, tournamentId),
        eq(tournamentRegistrations.teamId, teamId)
      )
    )
    .limit(1);
  return result[0];
}

// ─── Brackets ─────────────────────────────────────────────────────────────────
export async function saveBracket(data: InsertBracket) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const existing = await db
    .select()
    .from(brackets)
    .where(eq(brackets.tournamentId, data.tournamentId))
    .limit(1);
  if (existing.length > 0) {
    await db
      .update(brackets)
      .set({ data: data.data })
      .where(eq(brackets.tournamentId, data.tournamentId));
  } else {
    await db.insert(brackets).values(data);
  }
}

export async function getBracketByTournamentId(tournamentId: number): Promise<Bracket | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(brackets)
    .where(eq(brackets.tournamentId, tournamentId))
    .limit(1);
  return result[0];
}

// ─── Matches ──────────────────────────────────────────────────────────────────
export async function createMatches(data: InsertMatch[]) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  if (data.length === 0) return;
  await db.insert(matches).values(data);
}

export async function getMatchesByTournament(tournamentId: number): Promise<Match[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(matches)
    .where(eq(matches.tournamentId, tournamentId))
    .orderBy(matches.round, matches.matchNumber);
}

export async function updateMatch(
  id: number,
  data: { winnerId?: number; score1?: number; score2?: number; status?: Match["status"] }
) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const updateData: Partial<Match> = { ...data };
  if (data.status === "completed") {
    updateData.completedAt = new Date();
  }
  await db.update(matches).set(updateData).where(eq(matches.id, id));
}

export async function deleteMatchesByTournament(tournamentId: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.delete(matches).where(eq(matches.tournamentId, tournamentId));
}

// ─── News ─────────────────────────────────────────────────────────────────────
export async function createNews(data: InsertNews) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.insert(news).values(data);
}

export async function getPublishedNews(limit = 10) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(news)
    .where(eq(news.published, true))
    .orderBy(desc(news.createdAt))
    .limit(limit);
}

export async function getAllNews() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(news).orderBy(desc(news.createdAt));
}

export async function getNewsBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(news).where(eq(news.slug, slug)).limit(1);
  return result[0];
}

export async function updateNews(id: number, data: Partial<InsertNews>) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.update(news).set(data).where(eq(news.id, id));
}

export async function deleteNews(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.delete(news).where(eq(news.id, id));
}
