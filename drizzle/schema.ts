import {
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  varchar,
  boolean,
  jsonb,
} from "drizzle-orm/pg-core";

// ─── Enums ────────────────────────────────────────────────────────────────────
export const roleEnum = pgEnum("role", ["user", "admin"]);
export const formatEnum = pgEnum("format", ["single_elimination", "double_elimination", "round_robin"]);
export const statusEnum = pgEnum("status", ["upcoming", "registration", "ongoing", "completed", "cancelled"]);
export const registrationStatusEnum = pgEnum("registration_status", ["pending", "approved", "rejected"]);
export const streamPlatformEnum = pgEnum("stream_platform", ["youtube", "twitch", "tiktok"]);
export const bracketTypeEnum = pgEnum("bracket_type", ["winners", "losers", "grand_final", "group"]);
export const matchStatusEnum = pgEnum("match_status", ["pending", "ongoing", "completed", "bye"]);

// ─── Users ────────────────────────────────────────────────────────────────────
export const users = pgTable("users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Teams ────────────────────────────────────────────────────────────────────
export const teams = pgTable("teams", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("userId").notNull(), // owner / captain user
  name: varchar("name", { length: 128 }).notNull(),
  logoUrl: text("logoUrl"),
  captainNick: varchar("captainNick", { length: 64 }).notNull(),
  captainTelegram: varchar("captainTelegram", { length: 64 }),
  captainDiscord: varchar("captainDiscord", { length: 64 }),
  mlbbPlayerId: varchar("mlbbPlayerId", { length: 64 }),
  wins: integer("wins").default(0).notNull(),
  losses: integer("losses").default(0).notNull(),
  points: integer("points").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Team = typeof teams.$inferSelect;
export type InsertTeam = typeof teams.$inferInsert;

// ─── Players (roster) ─────────────────────────────────────────────────────────
export const players = pgTable("players", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  teamId: integer("teamId").notNull(),
  nickname: varchar("nickname", { length: 64 }).notNull(),
  mlbbPlayerId: varchar("mlbbPlayerId", { length: 64 }),
  role: varchar("role", { length: 32 }), // e.g. "Jungler", "Gold Lane", etc.
  isCaptain: boolean("isCaptain").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Player = typeof players.$inferSelect;
export type InsertPlayer = typeof players.$inferInsert;

// ─── Tournaments ──────────────────────────────────────────────────────────────
export const tournaments = pgTable("tournaments", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  slug: varchar("slug", { length: 128 }).notNull().unique(),
  title: varchar("title", { length: 256 }).notNull(),
  description: text("description"),
  format: formatEnum("format").notNull(),
  status: statusEnum("status").default("upcoming").notNull(),
  prizePool: varchar("prizePool", { length: 128 }),
  maxTeams: integer("maxTeams").default(16).notNull(),
  startDate: timestamp("startDate"),
  endDate: timestamp("endDate"),
  registrationDeadline: timestamp("registrationDeadline"),
  streamUrl: text("streamUrl"),
  streamPlatform: streamPlatformEnum("streamPlatform"),
  bannerUrl: text("bannerUrl"),
  rules: text("rules"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Tournament = typeof tournaments.$inferSelect;
export type InsertTournament = typeof tournaments.$inferInsert;

// ─── Tournament Registrations ─────────────────────────────────────────────────
export const tournamentRegistrations = pgTable("tournament_registrations", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  tournamentId: integer("tournamentId").notNull(),
  teamId: integer("teamId").notNull(),
  status: registrationStatusEnum("status").default("pending").notNull(),
  seed: integer("seed"), // seeding position in bracket
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type TournamentRegistration = typeof tournamentRegistrations.$inferSelect;
export type InsertTournamentRegistration = typeof tournamentRegistrations.$inferInsert;

// ─── Brackets ─────────────────────────────────────────────────────────────────
export const brackets = pgTable("brackets", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  tournamentId: integer("tournamentId").notNull().unique(),
  data: jsonb("data").notNull(), // full bracket JSON structure
  generatedAt: timestamp("generatedAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Bracket = typeof brackets.$inferSelect;
export type InsertBracket = typeof brackets.$inferInsert;

// ─── Matches ──────────────────────────────────────────────────────────────────
export const matches = pgTable("matches", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  tournamentId: integer("tournamentId").notNull(),
  round: integer("round").notNull(),        // 1-indexed round number
  matchNumber: integer("matchNumber").notNull(), // position within the round
  bracketType: bracketTypeEnum("bracketType").default("winners").notNull(),
  team1Id: integer("team1Id"),
  team2Id: integer("team2Id"),
  winnerId: integer("winnerId"),
  score1: integer("score1").default(0),
  score2: integer("score2").default(0),
  status: matchStatusEnum("status").default("pending").notNull(),
  scheduledAt: timestamp("scheduledAt"),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Match = typeof matches.$inferSelect;
export type InsertMatch = typeof matches.$inferInsert;

// ─── News ─────────────────────────────────────────────────────────────────────
export const news = pgTable("news", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  slug: varchar("slug", { length: 128 }).notNull().unique(),
  title: varchar("title", { length: 256 }).notNull(),
  excerpt: text("excerpt"),
  content: text("content").notNull(),
  imageUrl: text("imageUrl"),
  authorId: integer("authorId"),
  published: boolean("published").default(false).notNull(),
  tournamentId: integer("tournamentId"), // optional link to tournament
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type News = typeof news.$inferSelect;
export type InsertNews = typeof news.$inferInsert;
