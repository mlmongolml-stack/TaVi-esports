CREATE TYPE "public"."bracket_type" AS ENUM('winners', 'losers', 'grand_final', 'group');--> statement-breakpoint
CREATE TYPE "public"."format" AS ENUM('single_elimination', 'double_elimination', 'round_robin');--> statement-breakpoint
CREATE TYPE "public"."match_status" AS ENUM('pending', 'ongoing', 'completed', 'bye');--> statement-breakpoint
CREATE TYPE "public"."registration_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TYPE "public"."status" AS ENUM('upcoming', 'registration', 'ongoing', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."stream_platform" AS ENUM('youtube', 'twitch', 'tiktok');--> statement-breakpoint
CREATE TABLE "brackets" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "brackets_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"tournamentId" integer NOT NULL,
	"data" jsonb NOT NULL,
	"generatedAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "brackets_tournamentId_unique" UNIQUE("tournamentId")
);
--> statement-breakpoint
CREATE TABLE "matches" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "matches_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"tournamentId" integer NOT NULL,
	"round" integer NOT NULL,
	"matchNumber" integer NOT NULL,
	"bracketType" "bracket_type" DEFAULT 'winners' NOT NULL,
	"team1Id" integer,
	"team2Id" integer,
	"winnerId" integer,
	"score1" integer DEFAULT 0,
	"score2" integer DEFAULT 0,
	"status" "match_status" DEFAULT 'pending' NOT NULL,
	"scheduledAt" timestamp,
	"completedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "news" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "news_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"slug" varchar(128) NOT NULL,
	"title" varchar(256) NOT NULL,
	"excerpt" text,
	"content" text NOT NULL,
	"imageUrl" text,
	"authorId" integer,
	"published" boolean DEFAULT false NOT NULL,
	"tournamentId" integer,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "news_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "players" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "players_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"teamId" integer NOT NULL,
	"nickname" varchar(64) NOT NULL,
	"mlbbPlayerId" varchar(64),
	"role" varchar(32),
	"isCaptain" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "teams" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "teams_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userId" integer NOT NULL,
	"name" varchar(128) NOT NULL,
	"logoUrl" text,
	"captainNick" varchar(64) NOT NULL,
	"captainTelegram" varchar(64),
	"captainDiscord" varchar(64),
	"mlbbPlayerId" varchar(64),
	"wins" integer DEFAULT 0 NOT NULL,
	"losses" integer DEFAULT 0 NOT NULL,
	"points" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tournament_registrations" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "tournament_registrations_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"tournamentId" integer NOT NULL,
	"teamId" integer NOT NULL,
	"status" "registration_status" DEFAULT 'pending' NOT NULL,
	"seed" integer,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tournaments" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "tournaments_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"slug" varchar(128) NOT NULL,
	"title" varchar(256) NOT NULL,
	"description" text,
	"format" "format" NOT NULL,
	"status" "status" DEFAULT 'upcoming' NOT NULL,
	"prizePool" varchar(128),
	"maxTeams" integer DEFAULT 16 NOT NULL,
	"startDate" timestamp,
	"endDate" timestamp,
	"registrationDeadline" timestamp,
	"streamUrl" text,
	"streamPlatform" "stream_platform",
	"bannerUrl" text,
	"rules" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tournaments_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"openId" varchar(64) NOT NULL,
	"name" text,
	"email" varchar(320),
	"loginMethod" varchar(64),
	"role" "role" DEFAULT 'user' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"lastSignedIn" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_openId_unique" UNIQUE("openId")
);
