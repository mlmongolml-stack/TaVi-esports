CREATE TABLE `brackets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tournamentId` int NOT NULL,
	`data` json NOT NULL,
	`generatedAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `brackets_id` PRIMARY KEY(`id`),
	CONSTRAINT `brackets_tournamentId_unique` UNIQUE(`tournamentId`)
);
--> statement-breakpoint
CREATE TABLE `matches` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tournamentId` int NOT NULL,
	`round` int NOT NULL,
	`matchNumber` int NOT NULL,
	`bracketType` enum('winners','losers','grand_final','group') NOT NULL DEFAULT 'winners',
	`team1Id` int,
	`team2Id` int,
	`winnerId` int,
	`score1` int DEFAULT 0,
	`score2` int DEFAULT 0,
	`status` enum('pending','ongoing','completed','bye') NOT NULL DEFAULT 'pending',
	`scheduledAt` timestamp,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `matches_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `news` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(128) NOT NULL,
	`title` varchar(256) NOT NULL,
	`excerpt` text,
	`content` text NOT NULL,
	`imageUrl` text,
	`authorId` int,
	`published` boolean NOT NULL DEFAULT false,
	`tournamentId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `news_id` PRIMARY KEY(`id`),
	CONSTRAINT `news_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `players` (
	`id` int AUTO_INCREMENT NOT NULL,
	`teamId` int NOT NULL,
	`nickname` varchar(64) NOT NULL,
	`mlbbPlayerId` varchar(64),
	`role` varchar(32),
	`isCaptain` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `players_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `teams` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(128) NOT NULL,
	`logoUrl` text,
	`captainNick` varchar(64) NOT NULL,
	`captainTelegram` varchar(64),
	`captainDiscord` varchar(64),
	`mlbbPlayerId` varchar(64),
	`wins` int NOT NULL DEFAULT 0,
	`losses` int NOT NULL DEFAULT 0,
	`points` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `teams_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tournament_registrations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tournamentId` int NOT NULL,
	`teamId` int NOT NULL,
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`seed` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tournament_registrations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tournaments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(128) NOT NULL,
	`title` varchar(256) NOT NULL,
	`description` text,
	`format` enum('single_elimination','double_elimination','round_robin') NOT NULL,
	`status` enum('upcoming','registration','ongoing','completed','cancelled') NOT NULL DEFAULT 'upcoming',
	`prizePool` varchar(128),
	`maxTeams` int NOT NULL DEFAULT 16,
	`startDate` timestamp,
	`endDate` timestamp,
	`registrationDeadline` timestamp,
	`streamUrl` text,
	`streamPlatform` enum('youtube','twitch','tiktok'),
	`bannerUrl` text,
	`rules` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tournaments_id` PRIMARY KEY(`id`),
	CONSTRAINT `tournaments_slug_unique` UNIQUE(`slug`)
);
