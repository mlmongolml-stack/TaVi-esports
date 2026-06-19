import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import {
  createMatches,
  createNews,
  createTeam,
  createTournament,
  deleteMatchesByTournament,
  deleteNews,
  getAllNews,
  getAllTeams,
  getBracketByTournamentId,
  getMatchesByTournament,
  getNewsBySlug,
  getPlayersByTeamId,
  getPublishedNews,
  getRegistrationByTournamentAndTeam,
  getRegistrationsByTeam,
  getRegistrationsByTournament,
  getTeamById,
  getTeamByUserId,
  getTeamsCount,
  getTournamentById,
  getTournamentBySlug,
  getTournaments,
  registerTeamForTournament,
  replaceTeamPlayers,
  saveBracket,
  updateMatch,
  updateNews,
  updateRegistrationStatus,
  updateTeam,
  updateTournament,
  getUserByEmail,
  getDb,
} from "./db";
import { users } from "../drizzle/schema";
import { generateBracket } from "./brackets";

// ─── Admin guard ──────────────────────────────────────────────────────────────
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Потрібні права адміністратора" });
  }
  return next({ ctx });
});

// ─── Shared validators ────────────────────────────────────────────────────────
const playerSchema = z.object({
  nickname: z.string().min(1).max(64),
  mlbbPlayerId: z.string().max(64).optional(),
  role: z.string().max(32).optional(),
  isCaptain: z.boolean().optional(),
});

export const appRouter = router({
  system: systemRouter,

  // ─── Auth ──────────────────────────────────────────────────────────────────
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    
    loginLocal: publicProcedure
      .input(z.object({ email: z.string().email("Invalid email format"), nickname: z.string().min(1, "Nickname required") }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });
        
        // Find or create user
        let user = await getUserByEmail(input.email);
        if (!user) {
          // Create new user
          await db.insert(users).values({
            openId: `local_${input.email}`,
            email: input.email,
            name: input.nickname,
            loginMethod: "local",
            role: input.email === "ml.mongol.ml@gmail.com" ? "admin" : "user",
          });
          user = await getUserByEmail(input.email);
        }
        
        if (!user) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        
        // Set session cookie
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, JSON.stringify({ userId: user.id, email: user.email }), cookieOptions);
        
        return { success: true, user };
      }),
    
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ─── Tournaments (public) ──────────────────────────────────────────────────
  tournaments: router({
    list: publicProcedure
      .input(z.object({ status: z.string().optional() }).optional())
      .query(async ({ input }) => {
        return getTournaments(input?.status as any);
      }),

    bySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const t = await getTournamentBySlug(input.slug);
        if (!t) throw new TRPCError({ code: "NOT_FOUND" });
        return t;
      }),

    participants: publicProcedure
      .input(z.object({ tournamentId: z.number() }))
      .query(async ({ input }) => {
        const regs = await getRegistrationsByTournament(input.tournamentId);
        const teamsData = await Promise.all(
          regs.map(async (r) => {
            const team = await getTeamById(r.teamId);
            return { ...r, team };
          })
        );
        return teamsData;
      }),

    bracket: publicProcedure
      .input(z.object({ tournamentId: z.number() }))
      .query(async ({ input }) => {
        return getBracketByTournamentId(input.tournamentId);
      }),

    matches: publicProcedure
      .input(z.object({ tournamentId: z.number() }))
      .query(async ({ input }) => {
        const matchList = await getMatchesByTournament(input.tournamentId);
        const enriched = await Promise.all(
          matchList.map(async (m) => ({
            ...m,
            team1: m.team1Id ? await getTeamById(m.team1Id) : null,
            team2: m.team2Id ? await getTeamById(m.team2Id) : null,
            winner: m.winnerId ? await getTeamById(m.winnerId) : null,
          }))
        );
        return enriched;
      }),

    teamsCount: publicProcedure.query(async () => {
      return getTeamsCount();
    }),
  }),

  // ─── Teams (public + protected) ────────────────────────────────────────────
  teams: router({
    search: publicProcedure
      .input(z.object({ query: z.string().optional() }))
      .query(async ({ input }) => {
        return getAllTeams(input.query);
      }),

    leaderboard: publicProcedure.query(async () => {
      return getAllTeams();
    }),

    byId: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const team = await getTeamById(input.id);
        if (!team) throw new TRPCError({ code: "NOT_FOUND" });
        const roster = await getPlayersByTeamId(input.id);
        return { ...team, players: roster };
      }),

    myTeam: protectedProcedure.query(async ({ ctx }) => {
      const team = await getTeamByUserId(ctx.user.id);
      if (!team) return null;
      const roster = await getPlayersByTeamId(team.id);
      return { ...team, players: roster };
    }),

    register: protectedProcedure
      .input(
        z.object({
          name: z.string().min(2).max(128),
          logoUrl: z.string().url().optional().or(z.literal("")),
          captainNick: z.string().min(1).max(64),
          captainTelegram: z.string().max(64).optional(),
          captainDiscord: z.string().max(64).optional(),
          mlbbPlayerId: z.string().max(64).optional(),
          players: z.array(playerSchema).min(1).max(7),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const existing = await getTeamByUserId(ctx.user.id);
        if (existing) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "У вас вже є зареєстрована команда",
          });
        }
        await createTeam({
          userId: ctx.user.id,
          name: input.name,
          logoUrl: input.logoUrl || null,
          captainNick: input.captainNick,
          captainTelegram: input.captainTelegram || null,
          captainDiscord: input.captainDiscord || null,
          mlbbPlayerId: input.mlbbPlayerId || null,
        });
        const team = await getTeamByUserId(ctx.user.id);
        if (!team) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        await replaceTeamPlayers(
          team.id,
          input.players.map((p) => ({
            nickname: p.nickname,
            mlbbPlayerId: p.mlbbPlayerId || null,
            role: p.role || null,
            isCaptain: p.isCaptain ?? false,
          }))
        );
        return team;
      }),

    update: protectedProcedure
      .input(
        z.object({
          name: z.string().min(2).max(128).optional(),
          logoUrl: z.string().optional(),
          captainNick: z.string().min(1).max(64).optional(),
          captainTelegram: z.string().max(64).optional(),
          captainDiscord: z.string().max(64).optional(),
          mlbbPlayerId: z.string().max(64).optional(),
          players: z.array(playerSchema).min(1).max(7).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const team = await getTeamByUserId(ctx.user.id);
        if (!team) throw new TRPCError({ code: "NOT_FOUND", message: "Команду не знайдено" });
        const { players: newPlayers, ...teamData } = input;
        await updateTeam(team.id, teamData);
        if (newPlayers) {
          await replaceTeamPlayers(
            team.id,
            newPlayers.map((p) => ({
              nickname: p.nickname,
              mlbbPlayerId: p.mlbbPlayerId || null,
              role: p.role || null,
              isCaptain: p.isCaptain ?? false,
            }))
          );
        }
        return { success: true };
      }),

    registerForTournament: protectedProcedure
      .input(z.object({ tournamentId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const team = await getTeamByUserId(ctx.user.id);
        if (!team) throw new TRPCError({ code: "NOT_FOUND", message: "Спочатку зареєструйте команду" });
        const existing = await getRegistrationByTournamentAndTeam(input.tournamentId, team.id);
        if (existing) throw new TRPCError({ code: "CONFLICT", message: "Команда вже зареєстрована" });
        await registerTeamForTournament({ tournamentId: input.tournamentId, teamId: team.id });
        return { success: true };
      }),

    myRegistrations: protectedProcedure.query(async ({ ctx }) => {
      const team = await getTeamByUserId(ctx.user.id);
      if (!team) return [];
      const regs = await getRegistrationsByTeam(team.id);
      return Promise.all(
        regs.map(async (r) => ({
          ...r,
          tournament: await getTournamentById(r.tournamentId),
        }))
      );
    }),
  }),

  // ─── News (public) ─────────────────────────────────────────────────────────
  news: router({
    list: publicProcedure
      .input(z.object({ limit: z.number().optional() }).optional())
      .query(async ({ input }) => {
        return getPublishedNews(input?.limit ?? 10);
      }),

    bySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const article = await getNewsBySlug(input.slug);
        if (!article || !article.published) throw new TRPCError({ code: "NOT_FOUND" });
        return article;
      }),
  }),

  // ─── Admin ─────────────────────────────────────────────────────────────────
  admin: router({
    // Tournaments
    createTournament: adminProcedure
      .input(
        z.object({
          slug: z.string().min(2).max(128),
          title: z.string().min(2).max(256),
          description: z.string().optional(),
          format: z.enum(["single_elimination", "double_elimination", "round_robin"]),
          status: z.enum(["upcoming", "registration", "ongoing", "completed", "cancelled"]).optional(),
          prizePool: z.string().max(128).optional(),
          maxTeams: z.number().min(2).max(128).optional(),
          startDate: z.string().optional(),
          endDate: z.string().optional(),
          registrationDeadline: z.string().optional(),
          streamUrl: z.string().optional(),
          streamPlatform: z.enum(["youtube", "twitch", "tiktok"]).optional(),
          bannerUrl: z.string().optional(),
          rules: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        await createTournament({
          ...input,
          startDate: input.startDate ? new Date(input.startDate) : null,
          endDate: input.endDate ? new Date(input.endDate) : null,
          registrationDeadline: input.registrationDeadline
            ? new Date(input.registrationDeadline)
            : null,
        });
        return { success: true };
      }),

    updateTournament: adminProcedure
      .input(
        z.object({
          id: z.number(),
          title: z.string().min(2).max(256).optional(),
          description: z.string().optional(),
          format: z.enum(["single_elimination", "double_elimination", "round_robin"]).optional(),
          status: z.enum(["upcoming", "registration", "ongoing", "completed", "cancelled"]).optional(),
          prizePool: z.string().max(128).optional(),
          maxTeams: z.number().min(2).max(128).optional(),
          startDate: z.string().optional(),
          endDate: z.string().optional(),
          registrationDeadline: z.string().optional(),
          streamUrl: z.string().optional(),
          streamPlatform: z.enum(["youtube", "twitch", "tiktok"]).optional().nullable(),
          bannerUrl: z.string().optional(),
          rules: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, startDate, endDate, registrationDeadline, ...rest } = input;
        await updateTournament(id, {
          ...rest,
          startDate: startDate ? new Date(startDate) : undefined,
          endDate: endDate ? new Date(endDate) : undefined,
          registrationDeadline: registrationDeadline ? new Date(registrationDeadline) : undefined,
        });
        return { success: true };
      }),

    listTournaments: adminProcedure.query(async () => {
      return getTournaments();
    }),

    // Registrations
    listRegistrations: adminProcedure
      .input(z.object({ tournamentId: z.number() }))
      .query(async ({ input }) => {
        const regs = await getRegistrationsByTournament(input.tournamentId);
        return Promise.all(
          regs.map(async (r) => ({ ...r, team: await getTeamById(r.teamId) }))
        );
      }),

    updateRegistration: adminProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.enum(["pending", "approved", "rejected"]),
        })
      )
      .mutation(async ({ input }) => {
        await updateRegistrationStatus(input.id, input.status);
        return { success: true };
      }),

    // Teams
    listTeams: adminProcedure.query(async () => {
      return getAllTeams();
    }),

    updateTeamAdmin: adminProcedure
      .input(
        z.object({
          id: z.number(),
          wins: z.number().optional(),
          losses: z.number().optional(),
          points: z.number().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await updateTeam(id, data);
        return { success: true };
      }),

    // Bracket generation
    generateBracket: adminProcedure
      .input(z.object({ tournamentId: z.number() }))
      .mutation(async ({ input }) => {
        const tournament = await getTournamentById(input.tournamentId);
        if (!tournament) throw new TRPCError({ code: "NOT_FOUND" });

        const regs = await getRegistrationsByTournament(input.tournamentId);
        const approvedRegs = regs.filter((r) => r.status === "approved");
        if (approvedRegs.length < 2) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Потрібно мінімум 2 підтверджені команди",
          });
        }

        const bracketTeams = await Promise.all(
          approvedRegs.map(async (r, i) => {
            const team = await getTeamById(r.teamId);
            return { id: r.teamId, name: team?.name ?? "Unknown", seed: r.seed ?? i + 1 };
          })
        );

        const matchList = generateBracket(tournament.format, input.tournamentId, bracketTeams);

        // Clear existing matches and regenerate
        await deleteMatchesByTournament(input.tournamentId);
        await createMatches(matchList);

        // Save bracket metadata
        await saveBracket({
          tournamentId: input.tournamentId,
          data: { format: tournament.format, teams: bracketTeams, generatedAt: new Date() },
        });

        return { success: true, matchCount: matchList.length };
      }),

    // Match results
    updateMatch: adminProcedure
      .input(
        z.object({
          matchId: z.number(),
          winnerId: z.number().optional(),
          score1: z.number().optional(),
          score2: z.number().optional(),
          status: z.enum(["pending", "ongoing", "completed", "bye"]).optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { matchId, ...data } = input;
        await updateMatch(matchId, data);

        // Update team stats if match completed
        if (data.status === "completed" && data.winnerId) {
          const matchData = await import("./db").then((m) => m.getMatchesByTournament(0));
          // Stats update is handled separately for now
        }

        return { success: true };
      }),

    // News
    createNews: adminProcedure
      .input(
        z.object({
          slug: z.string().min(2).max(128),
          title: z.string().min(2).max(256),
          excerpt: z.string().optional(),
          content: z.string().min(1),
          imageUrl: z.string().optional(),
          published: z.boolean().optional(),
          tournamentId: z.number().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await createNews({ ...input, authorId: ctx.user.id });
        return { success: true };
      }),

    updateNews: adminProcedure
      .input(
        z.object({
          id: z.number(),
          title: z.string().min(2).max(256).optional(),
          excerpt: z.string().optional(),
          content: z.string().optional(),
          imageUrl: z.string().optional(),
          published: z.boolean().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await updateNews(id, data);
        return { success: true };
      }),

    deleteNews: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteNews(input.id);
        return { success: true };
      }),

    listNews: adminProcedure.query(async () => {
      return getAllNews();
    }),
  }),
});

export type AppRouter = typeof appRouter;
