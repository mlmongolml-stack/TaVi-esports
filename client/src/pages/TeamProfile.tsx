import { trpc } from "@/lib/trpc";
import { ArrowLeft, Crown, Shield, Trophy, Users, Zap } from "lucide-react";
import { Link } from "wouter";

export default function TeamProfile({ params }: { params: { id: string } }) {
  const teamId = parseInt(params.id, 10);
  const { data: team, isLoading, error } = trpc.teams.byId.useQuery({ id: teamId }, { enabled: !isNaN(teamId) });

  if (isLoading) {
    return (
      <div className="container py-10 max-w-2xl">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/4" />
          <div className="h-24 bg-muted rounded" />
          <div className="h-48 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="container py-10 text-center">
        <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-foreground mb-2">Команду не знайдено</h2>
        <Link href="/leaderboard" className="text-primary hover:underline">← Повернутись до рейтингу</Link>
      </div>
    );
  }

  const total = team.wins + team.losses;
  const winRate = total > 0 ? Math.round((team.wins / total) * 100) : 0;

  return (
    <div className="container py-10 max-w-2xl">
      <Link href="/leaderboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" />
        Таблиця лідерів
      </Link>

      {/* Team header */}
      <div className="cyber-card p-6 mb-5">
        <div className="flex items-center gap-4 mb-5">
          {team.logoUrl ? (
            <img src={team.logoUrl} alt={team.name} className="w-16 h-16 rounded-lg object-cover border border-border" />
          ) : (
            <div className="w-16 h-16 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center text-2xl font-display font-bold text-primary">
              {team.name[0]}
            </div>
          )}
          <div>
            <h1 className="font-display text-2xl font-black uppercase text-foreground">{team.name}</h1>
            <p className="text-sm text-muted-foreground flex items-center gap-1.5">
              <Crown className="w-3.5 h-3.5 text-accent" />
              Капітан: {team.captainNick}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Перемоги", value: team.wins, color: "text-green-400" },
            { label: "Поразки", value: team.losses, color: "text-red-400" },
            { label: "Очки", value: team.points, color: "text-accent" },
            { label: "Win Rate", value: `${winRate}%`, color: "text-primary" },
          ].map((s) => (
            <div key={s.label} className="bg-muted/30 rounded-lg p-3 text-center">
              <div className={`text-xl font-display font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Contact info */}
        <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-border/50 text-sm text-muted-foreground">
          {team.captainTelegram && (
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              Telegram: <span className="text-foreground">{team.captainTelegram}</span>
            </div>
          )}
          {team.captainDiscord && (
            <div className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              Discord: <span className="text-foreground">{team.captainDiscord}</span>
            </div>
          )}
        </div>
      </div>

      {/* Roster */}
      <div className="cyber-card p-5">
        <h2 className="font-heading text-lg font-bold text-foreground flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-secondary" />
          Склад команди
        </h2>
        <div className="space-y-2">
          {(team.players ?? []).map((p, i) => (
            <div key={p.id} className="flex items-center justify-between bg-muted/20 rounded-lg px-4 py-3 border border-border/40">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-xs font-bold text-primary">
                  {i + 1}
                </div>
                <div>
                  <span className="text-sm font-medium text-foreground">{p.nickname}</span>
                  {p.isCaptain && <span className="ml-2 text-xs text-accent">★ Капітан</span>}
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                {p.role && <span className="bg-muted/50 px-2 py-0.5 rounded">{p.role}</span>}
                {p.mlbbPlayerId && <span>ID: {p.mlbbPlayerId}</span>}
              </div>
            </div>
          ))}
          {(!team.players || team.players.length === 0) && (
            <p className="text-sm text-muted-foreground text-center py-4">Склад не вказано</p>
          )}
        </div>
      </div>
    </div>
  );
}
