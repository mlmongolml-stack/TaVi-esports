import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { Crown, Loader2, Search, Trophy, Users, Zap } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

export default function Leaderboard() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const { data: teams = [], isLoading } = trpc.teams.leaderboard.useQuery();
  const { data: searchResults = [], isLoading: searching } = trpc.teams.search.useQuery(
    { query: debouncedQuery },
    { enabled: debouncedQuery.length > 0 }
  );

  const displayTeams = debouncedQuery ? searchResults : teams;

  const handleSearch = (val: string) => {
    setQuery(val);
    const timer = setTimeout(() => setDebouncedQuery(val), 300);
    return () => clearTimeout(timer);
  };

  const rankColor = (i: number) => {
    if (i === 0) return "text-yellow-400";
    if (i === 1) return "text-gray-300";
    if (i === 2) return "text-amber-600";
    return "text-muted-foreground";
  };

  const rankBg = (i: number) => {
    if (i === 0) return "bg-yellow-400/10 border-yellow-400/30";
    if (i === 1) return "bg-gray-400/10 border-gray-400/30";
    if (i === 2) return "bg-amber-600/10 border-amber-600/30";
    return "bg-muted/20 border-border/50";
  };

  return (
    <div className="container py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-px w-6 bg-accent" />
          <span className="text-xs font-semibold uppercase tracking-widest text-accent">Рейтинг</span>
        </div>
        <h1 className="font-display text-3xl md:text-4xl font-black uppercase text-foreground mb-2">
          Таблиця лідерів
        </h1>
        <p className="text-muted-foreground">Найкращі команди платформи TaVi Esports</p>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Пошук команди..."
          className="w-full bg-input border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
        />
        {(searching) && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {/* Top 3 podium */}
      {!debouncedQuery && teams.length >= 3 && (
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[teams[1], teams[0], teams[2]].map((team, podiumIdx) => {
            const actualRank = podiumIdx === 0 ? 1 : podiumIdx === 1 ? 0 : 2;
            const heights = ["h-28", "h-36", "h-24"];
            const icons = ["🥈", "🥇", "🥉"];
            if (!team) return <div key={podiumIdx} />;
            return (
              <Link key={team.id} href={`/teams/${team.id}`}>
                <div className={cn(
                  "cyber-card border rounded-lg p-4 text-center flex flex-col items-center justify-end cursor-pointer hover:border-primary/50 transition-all",
                  heights[podiumIdx],
                  rankBg(actualRank)
                )}>
                  <div className="text-2xl mb-1">{icons[podiumIdx]}</div>
                  {team.logoUrl && (
                    <img src={team.logoUrl} alt={team.name} className="w-8 h-8 rounded-full object-cover border border-border mb-1" />
                  )}
                  <p className={cn("text-xs font-bold truncate w-full text-center", rankColor(actualRank))}>
                    {team.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{team.points} очк.</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Full table */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-14 bg-muted/30 rounded animate-pulse" />
          ))}
        </div>
      ) : displayTeams.length === 0 ? (
        <div className="cyber-card p-16 text-center">
          <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {debouncedQuery ? "Команд не знайдено" : "Команд поки немає"}
          </h3>
          <p className="text-muted-foreground text-sm">
            {debouncedQuery ? "Спробуйте інший запит" : "Зареєструйте першу команду!"}
          </p>
        </div>
      ) : (
        <div className="cyber-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 bg-muted/30">
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground w-12">#</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Команда</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">П</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">П</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Очки</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden sm:table-cell">Win%</th>
                </tr>
              </thead>
              <tbody>
                {displayTeams.map((team, i) => {
                  const total = team.wins + team.losses;
                  const winRate = total > 0 ? Math.round((team.wins / total) * 100) : 0;
                  return (
                    <tr
                      key={team.id}
                      className="border-b border-border/30 hover:bg-muted/20 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <span className={cn("font-display font-bold text-base", rankColor(i))}>
                          {i < 3 ? ["🥇", "🥈", "🥉"][i] : i + 1}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/teams/${team.id}`} className="flex items-center gap-3 group">
                          {team.logoUrl ? (
                            <img src={team.logoUrl} alt={team.name} className="w-8 h-8 rounded object-cover border border-border" />
                          ) : (
                            <div className="w-8 h-8 rounded bg-primary/20 border border-primary/30 flex items-center justify-center text-xs font-bold text-primary">
                              {team.name[0]}
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
                              {team.name}
                            </p>
                            <p className="text-xs text-muted-foreground">{team.captainNick}</p>
                          </div>
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-center text-green-400 font-semibold">{team.wins}</td>
                      <td className="px-4 py-3 text-center text-red-400 font-semibold">{team.losses}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-display font-bold text-accent">{team.points}</span>
                      </td>
                      <td className="px-4 py-3 text-center hidden sm:table-cell">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full transition-all"
                              style={{ width: `${winRate}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground w-8">{winRate}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
