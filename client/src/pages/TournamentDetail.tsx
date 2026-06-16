import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  ExternalLink,
  Loader2,
  Trophy,
  Tv,
  Users,
  XCircle,
  Zap,
} from "lucide-react";
import { useSEO, buildTournamentStructuredData } from "@/hooks/useSEO";
import { useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(date: Date | string | null | undefined) {
  if (!date) return "TBD";
  return new Date(date).toLocaleDateString("uk-UA", {
    day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

const statusMap: Record<string, { label: string; cls: string }> = {
  upcoming: { label: "Незабаром", cls: "status-upcoming" },
  registration: { label: "Реєстрація відкрита", cls: "status-registration" },
  ongoing: { label: "Триває", cls: "status-ongoing" },
  completed: { label: "Завершено", cls: "status-completed" },
  cancelled: { label: "Скасовано", cls: "status-cancelled" },
};

const formatMap: Record<string, { label: string; cls: string }> = {
  single_elimination: { label: "Single Elimination", cls: "format-se" },
  double_elimination: { label: "Double Elimination", cls: "format-de" },
  round_robin: { label: "Round Robin", cls: "format-rr" },
};

// ─── Stream Embed ─────────────────────────────────────────────────────────────
function StreamEmbed({ url, platform }: { url: string; platform: string }) {
  const getEmbedUrl = () => {
    if (platform === "youtube") {
      // Support both watch?v= and youtu.be/ formats
      const match = url.match(/(?:v=|youtu\.be\/)([^&?/]+)/);
      const videoId = match?.[1];
      if (videoId) return `https://www.youtube.com/embed/${videoId}?autoplay=0`;
      // Live stream channel
      const channelMatch = url.match(/youtube\.com\/@([^/?]+)/);
      if (channelMatch) return `https://www.youtube.com/embed/live_stream?channel=${channelMatch[1]}`;
    }
    if (platform === "twitch") {
      const channelMatch = url.match(/twitch\.tv\/([^/?]+)/);
      if (channelMatch) {
        return `https://player.twitch.tv/?channel=${channelMatch[1]}&parent=${window.location.hostname}`;
      }
    }
    if (platform === "tiktok") {
      // TikTok Live embed
      const userMatch = url.match(/tiktok\.com\/@([^/?]+)/);
      if (userMatch) return `https://www.tiktok.com/embed/live/${userMatch[1]}`;
    }
    return url;
  };

  const platformIcons: Record<string, string> = {
    youtube: "🎬",
    twitch: "🟣",
    tiktok: "🎵",
  };

  const platformNames: Record<string, string> = {
    youtube: "YouTube",
    twitch: "Twitch",
    tiktok: "TikTok Live",
  };

  return (
    <div className="cyber-card overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50 bg-muted/20">
        <Tv className="w-4 h-4 text-primary" />
        <span className="text-sm font-semibold text-foreground">
          {platformIcons[platform]} Трансляція — {platformNames[platform] ?? platform}
        </span>
        <a href={url} target="_blank" rel="noopener noreferrer" className="ml-auto text-xs text-muted-foreground hover:text-primary flex items-center gap-1">
          Відкрити <ExternalLink className="w-3 h-3" />
        </a>
      </div>
      <div className="aspect-video">
        <iframe
          src={getEmbedUrl()}
          className="w-full h-full"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          title="Live Stream"
        />
      </div>
    </div>
  );
}

// ─── Bracket Visualization ────────────────────────────────────────────────────
interface BracketMatch {
  id: number;
  round: number;
  matchNumber: number;
  bracketType: string;
  team1: { id: number; name: string; logoUrl?: string | null } | null;
  team2: { id: number; name: string; logoUrl?: string | null } | null;
  winner: { id: number; name: string } | null;
  score1: number | null;
  score2: number | null;
  status: string;
}

function MatchCard({ match }: { match: BracketMatch }) {
  const isCompleted = match.status === "completed" || match.status === "bye";

  const TeamRow = ({ team, score, isWinner }: { team: { name: string; logoUrl?: string | null } | null; score: number | null; isWinner: boolean }) => (
    <div className={cn(
      "flex items-center justify-between px-3 py-2 rounded text-sm transition-colors",
      isWinner ? "bg-primary/15 text-primary font-semibold" : "text-muted-foreground",
      !team && "opacity-40"
    )}>
      <div className="flex items-center gap-2 min-w-0">
        {team?.logoUrl ? (
          <img src={team.logoUrl} alt={team.name} className="w-5 h-5 rounded object-cover border border-border shrink-0" />
        ) : (
          <div className="w-5 h-5 rounded bg-muted border border-border flex items-center justify-center text-[10px] font-bold shrink-0">
            {team?.name?.[0] ?? "?"}
          </div>
        )}
        <span className="truncate text-xs">{team?.name ?? "TBD"}</span>
      </div>
      {isCompleted && score !== null && (
        <span className={cn("text-xs font-bold ml-2 shrink-0", isWinner ? "text-primary" : "text-muted-foreground")}>
          {score}
        </span>
      )}
    </div>
  );

  return (
    <div className={cn(
      "bracket-match",
      match.status === "ongoing" && "border-primary/60 shadow-[0_0_12px_var(--neon-blue-glow)]"
    )}>
      <div className="text-[10px] text-muted-foreground mb-1.5 flex items-center justify-between">
        <span>Матч {match.matchNumber}</span>
        {match.status === "ongoing" && <span className="text-primary animate-neon-pulse">● LIVE</span>}
        {match.status === "completed" && <CheckCircle className="w-3 h-3 text-green-400" />}
      </div>
      <div className="space-y-1">
        <TeamRow
          team={match.team1}
          score={match.score1}
          isWinner={!!(match.winner && match.team1 && match.winner.id === match.team1.id)}
        />
        <div className="text-center text-[10px] text-muted-foreground">vs</div>
        <TeamRow
          team={match.team2}
          score={match.score2}
          isWinner={!!(match.winner && match.team2 && match.winner.id === match.team2.id)}
        />
      </div>
    </div>
  );
}

function BracketView({ matches, format }: { matches: BracketMatch[]; format: string }) {
  const [activeTab, setActiveTab] = useState<"winners" | "losers" | "group" | "grand_final">("winners");

  const tabs = [
    { key: "winners" as const, label: "Winners", show: format !== "round_robin" },
    { key: "losers" as const, label: "Losers", show: format === "double_elimination" },
    { key: "group" as const, label: "Група", show: format === "round_robin" },
    { key: "grand_final" as const, label: "Фінал", show: format === "double_elimination" },
  ].filter((t) => t.show);

  const filtered = matches.filter((m) => m.bracketType === activeTab);
  const rounds = Array.from(new Set(filtered.map((m) => m.round))).sort((a, b) => a - b);

  const roundLabels: Record<number, string> = {};
  if (format === "single_elimination") {
    const maxRound = Math.max(...matches.filter((m) => m.bracketType === "winners").map((m) => m.round), 0);
    rounds.forEach((r) => {
      const remaining = maxRound - r;
      if (remaining === 0) roundLabels[r] = "Фінал";
      else if (remaining === 1) roundLabels[r] = "Півфінал";
      else if (remaining === 2) roundLabels[r] = "Чвертьфінал";
      else roundLabels[r] = `Раунд ${r}`;
    });
  }

  return (
    <div>
      {tabs.length > 1 && (
        <div className="flex gap-2 mb-4">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded transition-all",
                activeTab === tab.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/50 text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground text-sm">
          Сітка ще не згенерована
        </div>
      ) : (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-8 min-w-max">
            {rounds.map((round) => {
              const roundMatches = filtered.filter((m) => m.round === round).sort((a, b) => a.matchNumber - b.matchNumber);
              return (
                <div key={round} className="flex flex-col gap-4">
                  <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground text-center pb-2 border-b border-border/50">
                    {roundLabels[round] ?? (format === "round_robin" ? `Тур ${round}` : `Раунд ${round}`)}
                  </div>
                  <div className="flex flex-col gap-4 justify-around flex-1">
                    {roundMatches.map((match) => (
                      <MatchCard key={match.id} match={match} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function TournamentDetail({ params }: { params: { slug: string } }) {
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();

  const { data: tournament, isLoading, error } = trpc.tournaments.bySlug.useQuery({ slug: params.slug });

  useSEO({
    title: tournament?.title,
    description: tournament?.description ?? undefined,
    type: "article",
    structuredData: tournament ? buildTournamentStructuredData(tournament) : undefined,
  });
  const { data: participants = [] } = trpc.tournaments.participants.useQuery(
    { tournamentId: tournament?.id ?? 0 },
    { enabled: !!tournament }
  );
  const { data: matches = [] } = trpc.tournaments.matches.useQuery(
    { tournamentId: tournament?.id ?? 0 },
    { enabled: !!tournament }
  );
  const { data: myTeam } = trpc.teams.myTeam.useQuery(undefined, { enabled: isAuthenticated });
  const { data: myRegs = [] } = trpc.teams.myRegistrations.useQuery(undefined, { enabled: isAuthenticated });

  const [activeTab, setActiveTab] = useState<"info" | "participants" | "bracket" | "stream">("info");

  const registerMutation = trpc.teams.registerForTournament.useMutation({
    onSuccess: () => {
      toast.success("Команду зареєстровано на турнір!");
      utils.teams.myRegistrations.invalidate();
      utils.tournaments.participants.invalidate({ tournamentId: tournament?.id ?? 0 });
    },
    onError: (err) => toast.error(err.message),
  });

  if (isLoading) {
    return (
      <div className="container py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-48 bg-muted rounded" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (error || !tournament) {
    return (
      <div className="container py-10 text-center">
        <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-foreground mb-2">Турнір не знайдено</h2>
        <Link href="/tournaments" className="text-primary hover:underline">← Всі турніри</Link>
      </div>
    );
  }

  const st = statusMap[tournament.status] ?? statusMap.upcoming;
  const fmt = formatMap[tournament.format] ?? formatMap.single_elimination;
  const approvedParticipants = participants.filter((p) => p.status === "approved");
  const isRegistered = myRegs.some((r) => r.tournamentId === tournament.id);
  const canRegister = isAuthenticated && myTeam && tournament.status === "registration" && !isRegistered;

  const tabs = [
    { key: "info" as const, label: "Інформація" },
    { key: "participants" as const, label: `Учасники (${approvedParticipants.length})` },
    { key: "bracket" as const, label: "Сітка" },
    ...(tournament.streamUrl ? [{ key: "stream" as const, label: "Трансляція" }] : []),
  ];

  return (
    <div className="container py-10">
      {/* Back */}
      <Link href="/tournaments" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" />
        Всі турніри
      </Link>

      {/* Banner */}
      {tournament.bannerUrl && (
        <div className="rounded-lg overflow-hidden mb-6 border border-border/50 h-48 md:h-64">
          <img src={tournament.bannerUrl} alt={tournament.title} className="w-full h-full object-cover" />
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className={st.cls}>{st.label}</span>
            <span className={fmt.cls}>{fmt.label}</span>
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-black uppercase text-foreground">
            {tournament.title}
          </h1>
        </div>

        {/* Register button */}
        {canRegister && (
          <button
            onClick={() => registerMutation.mutate({ tournamentId: tournament.id })}
            disabled={registerMutation.isPending}
            className="cyber-btn-primary shrink-0"
          >
            {registerMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trophy className="w-4 h-4" />
            )}
            Зареєструватись
          </button>
        )}
        {isRegistered && (
          <div className="flex items-center gap-2 text-sm text-green-400 border border-green-400/30 bg-green-400/10 px-3 py-2 rounded">
            <CheckCircle className="w-4 h-4" />
            Зареєстровано
          </div>
        )}
        {!isAuthenticated && tournament.status === "registration" && (
          <Link href="/register-team" className="cyber-btn-outline">
            <Zap className="w-4 h-4" />
            Увійти для реєстрації
          </Link>
        )}
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { icon: Trophy, label: "Призовий фонд", value: tournament.prizePool ?? "—" },
          { icon: Calendar, label: "Початок", value: tournament.startDate ? new Date(tournament.startDate).toLocaleDateString("uk-UA") : "TBD" },
          { icon: Users, label: "Команд", value: `${approvedParticipants.length} / ${tournament.maxTeams}` },
          { icon: Clock, label: "Реєстрація до", value: tournament.registrationDeadline ? new Date(tournament.registrationDeadline).toLocaleDateString("uk-UA") : "—" },
        ].map((s) => (
          <div key={s.label} className="cyber-card p-4">
            <div className="flex items-center gap-2 mb-1">
              <s.icon className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">{s.label}</span>
            </div>
            <p className="font-semibold text-foreground text-sm">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 border-b border-border/50 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-all border-b-2 -mb-px",
              activeTab === tab.key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "info" && (
        <div className="space-y-5">
          {tournament.description && (
            <div className="cyber-card p-5">
              <h2 className="font-heading text-lg font-bold text-foreground mb-3">Опис</h2>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{tournament.description}</p>
            </div>
          )}
          {tournament.rules && (
            <div className="cyber-card p-5">
              <h2 className="font-heading text-lg font-bold text-foreground mb-3">Правила</h2>
              <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{tournament.rules}</div>
            </div>
          )}
          <div className="cyber-card p-5">
            <h2 className="font-heading text-lg font-bold text-foreground mb-3">Розклад</h2>
            <div className="space-y-2 text-sm">
              {[
                { label: "Дедлайн реєстрації", value: formatDate(tournament.registrationDeadline) },
                { label: "Початок турніру", value: formatDate(tournament.startDate) },
                { label: "Кінець турніру", value: formatDate(tournament.endDate) },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="text-foreground font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "participants" && (
        <div className="cyber-card overflow-hidden">
          {participants.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Учасників поки немає</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/30">
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">#</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Команда</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Капітан</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Статус</th>
                  </tr>
                </thead>
                <tbody>
                  {participants.map((p, i) => {
                    const regSt = p.status === "approved"
                      ? { label: "Підтверджено", cls: "status-ongoing", icon: <CheckCircle className="w-3.5 h-3.5" /> }
                      : p.status === "rejected"
                      ? { label: "Відхилено", cls: "status-cancelled", icon: <XCircle className="w-3.5 h-3.5" /> }
                      : { label: "На розгляді", cls: "status-upcoming", icon: <Clock className="w-3.5 h-3.5" /> };
                    return (
                      <tr key={p.id} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3 text-muted-foreground">{i + 1}</td>
                        <td className="px-4 py-3">
                          <Link href={`/teams/${p.teamId}`} className="flex items-center gap-3 group">
                            {p.team?.logoUrl ? (
                              <img src={p.team.logoUrl} alt={p.team.name} className="w-8 h-8 rounded object-cover border border-border" />
                            ) : (
                              <div className="w-8 h-8 rounded bg-primary/20 border border-primary/30 flex items-center justify-center text-xs font-bold text-primary">
                                {p.team?.name?.[0] ?? "?"}
                              </div>
                            )}
                            <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                              {p.team?.name ?? "—"}
                            </span>
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{p.team?.captainNick ?? "—"}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={cn("inline-flex items-center gap-1", regSt.cls)}>
                            {regSt.icon}
                            {regSt.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === "bracket" && (
        <div className="cyber-card p-5">
          <h2 className="font-heading text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            Турнірна сітка — {fmt.label}
          </h2>
          <BracketView matches={matches as BracketMatch[]} format={tournament.format} />
        </div>
      )}

      {activeTab === "stream" && tournament.streamUrl && tournament.streamPlatform && (
        <StreamEmbed url={tournament.streamUrl} platform={tournament.streamPlatform} />
      )}
    </div>
  );
}
