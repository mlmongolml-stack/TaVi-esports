import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  boolean,
  json,
} from "drizzle-orm/mysql-core";

// ─── Users ────────────────────────────────────────────────────────────────────
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Teams ────────────────────────────────────────────────────────────────────
export const teams = mysqlTable("teams", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // owner / captain user
  name: varchar("name", { length: 128 }).notNull(),
  logoUrl: text("logoUrl"),
  captainNick: varchar("captainNick", { length: 64 }).notNull(),
  captainTelegram: varchar("captainTelegram", { length: 64 }),
  captainDiscord: varchar("captainDiscord", { length: 64 }),
  mlbbPlayerId: varchar("mlbbPlayerId", { length: 64 }),
  wins: int("wins").default(0).notNull(),
  losses: int("losses").default(0).notNull(),
  points: int("points").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Team = typeof teams.$inferSelect;
export type InsertTeam = typeof teams.$inferInsert;

// ─── Players (roster) ─────────────────────────────────────────────────────────
export const players = mysqlTable("players", {
  id: int("id").autoincrement().primaryKey(),
  teamId: int("teamId").notNull(),
  nickname: varchar("nickname", { length: 64 }).notNull(),
  mlbbPlayerId: varchar("mlbbPlayerId", { length: 64 }),
  role: varchar("role", { length: 32 }), // e.g. "Jungler", "Gold Lane", etc.
  isCaptain: boolean("isCaptain").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Player = typeof players.$inferSelect;
export type InsertPlayer = typeof players.$inferInsert;

// ─── Tournaments ──────────────────────────────────────────────────────────────
export const tournaments = mysqlTable("tournaments", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 128 }).notNull().unique(),
  title: varchar("title", { length: 256 }).notNull(),
  description: text("description"),
  format: mysqlEnum("format", ["single_elimination", "double_elimination", "round_robin"]).notNull(),
  status: mysqlEnum("status", ["upcoming", "registration", "ongoing", "completed", "cancelled"]).default("upcoming").notNull(),
  prizePool: varchar("prizePool", { length: 128 }),
  maxTeams: int("maxTeams").default(16).notNull(),
  startDate: timestamp("startDate"),
  endDate: timestamp("endDate"),
  registrationDeadline: timestamp("registrationDeadline"),
  streamUrl: text("streamUrl"),
  streamPlatform: mysqlEnum("streamPlatform", ["youtube", "twitch", "tiktok"]),
  bannerUrl: text("bannerUrl"),
  rules: text("rules"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Tournament = typeof tournaments.$inferSelect;
export type InsertTournament = typeof tournaments.$inferInsert;

// ─── Tournament Registrations ─────────────────────────────────────────────────
export const tournamentRegistrations = mysqlTable("tournament_registrations", {
  id: int("id").autoincrement().primaryKey(),
  tournamentId: int("tournamentId").notNull(),
  teamId: int("teamId").notNull(),
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  seed: int("seed"), // seeding position in bracket
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TournamentRegistration = typeof tournamentRegistrations.$inferSelect;
export type InsertTournamentRegistration = typeof tournamentRegistrations.$inferInsert;

// ─── Brackets ─────────────────────────────────────────────────────────────────
export const brackets = mysqlTable("brackets", {
  id: int("id").autoincrement().primaryKey(),
  tournamentId: int("tournamentId").notNull().unique(),
  data: json("data").notNull(), // full bracket JSON structure
  generatedAt: timestamp("generatedAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Bracket = typeof brackets.$inferSelect;
export type InsertBracket = typeof brackets.$inferInsert;

// ─── Matches ──────────────────────────────────────────────────────────────────
export const matches = mysqlTable("matches", {
  id: int("id").autoincrement().primaryKey(),
  tournamentId: int("tournamentId").notNull(),
  round: int("round").notNull(),        // 1-indexed round number
  matchNumber: int("matchNumber").notNull(), // position within the round
  bracketType: mysqlEnum("bracketType", ["winners", "losers", "grand_final", "group"]).default("winners").notNull(),
  team1Id: int("team1Id"),
  team2Id: int("team2Id"),
  winnerId: int("winnerId"),
  score1: int("score1").default(0),
  score2: int("score2").default(0),
  status: mysqlEnum("status", ["pending", "ongoing", "completed", "bye"]).default("pending").notNull(),
  scheduledAt: timestamp("scheduledAt"),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Match = typeof matches.$inferSelect;
export type InsertMatch = typeof matches.$inferInsert;

// ─── News ─────────────────────────────────────────────────────────────────────
export const news = mysqlTable("news", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 128 }).notNull().unique(),
  title: varchar("title", { length: 256 }).notNull(),
  excerpt: text("excerpt"),
  content: text("content").notNull(),
  imageUrl: text("imageUrl"),
  authorId: int("authorId"),
  published: boolean("published").default(false).notNull(),
  tournamentId: int("tournamentId"), // optional link to tournament
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type News = typeof news.$inferSelect;
export type InsertNews = typeof news.$inferInsert;
