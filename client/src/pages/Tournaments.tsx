import { trpc } from "@/lib/trpc";
import { Calendar, ChevronRight, Filter, Trophy, Users } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

function formatDate(date: Date | string | null | undefined) {
  if (!date) return "TBD";
  return new Date(date).toLocaleDateString("uk-UA", { day: "2-digit", month: "short", year: "numeric" });
}

const statusOptions = [
  { value: "", label: "Всі" },
  { value: "upcoming", label: "Незабаром" },
  { value: "registration", label: "Реєстрація" },
  { value: "ongoing", label: "Триває" },
  { value: "completed", label: "Завершено" },
];

const formatMap: Record<string, { label: string; cls: string }> = {
  single_elimination: { label: "Single Elimination", cls: "format-se" },
  double_elimination: { label: "Double Elimination", cls: "format-de" },
  round_robin: { label: "Round Robin", cls: "format-rr" },
};

const statusMap: Record<string, { label: string; cls: string }> = {
  upcoming: { label: "Незабаром", cls: "status-upcoming" },
  registration: { label: "Реєстрація відкрита", cls: "status-registration" },
  ongoing: { label: "Триває", cls: "status-ongoing" },
  completed: { label: "Завершено", cls: "status-completed" },
  cancelled: { label: "Скасовано", cls: "status-cancelled" },
};

export default function Tournaments() {
  const [statusFilter, setStatusFilter] = useState("");
  const { data: tournaments = [], isLoading } = trpc.tournaments.list.useQuery({ status: statusFilter || undefined });

  return (
    <div className="container py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-px w-6 bg-primary" />
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">Платформа</span>
        </div>
        <h1 className="font-display text-3xl md:text-4xl font-black uppercase text-foreground mb-2">
          Турніри
        </h1>
        <p className="text-muted-foreground">Всі турніри Mobile Legends: Bang Bang на платформі TaVi Esports</p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <Filter className="w-4 h-4 text-muted-foreground" />
        {statusOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setStatusFilter(opt.value)}
            className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded transition-all duration-200 ${
              statusFilter === opt.value
                ? "bg-primary text-primary-foreground"
                : "bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Tournament Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="cyber-card p-5 animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4 mb-3" />
              <div className="h-3 bg-muted rounded w-1/2 mb-2" />
              <div className="h-3 bg-muted rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : tournaments.length === 0 ? (
        <div className="cyber-card p-16 text-center">
          <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Турнірів не знайдено</h3>
          <p className="text-muted-foreground">Спробуйте змінити фільтр або поверніться пізніше</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tournaments.map((t) => {
            const fmt = formatMap[t.format] ?? { label: t.format, cls: "format-se" };
            const st = statusMap[t.status] ?? { label: t.status, cls: "status-upcoming" };
            return (
              <Link key={t.id} href={`/tournaments/${t.slug}`}>
                <div className="cyber-card p-5 hover:border-primary/50 transition-all duration-200 group cursor-pointer h-full flex flex-col">
                  {/* Banner image */}
                  {t.bannerUrl && (
                    <div className="w-full h-32 rounded overflow-hidden mb-4">
                      <img src={t.bannerUrl} alt={t.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                  )}

                  {/* Badges */}
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className={st.cls}>{st.label}</span>
                    <span className={fmt.cls}>{fmt.label}</span>
                  </div>

                  {/* Title */}
                  <h3 className="font-heading text-lg font-bold text-foreground group-hover:text-primary transition-colors mb-2 flex-1">
                    {t.title}
                  </h3>

                  {/* Details */}
                  <div className="space-y-1.5 text-xs text-muted-foreground mt-auto pt-3 border-t border-border/50">
                    {t.prizePool && (
                      <div className="flex items-center gap-1.5 text-accent font-semibold">
                        <Trophy className="w-3.5 h-3.5" />
                        {t.prizePool}
                      </div>
                    )}
                    {t.startDate && (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(t.startDate)}
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      До {t.maxTeams} команд
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-primary text-xs font-semibold mt-3">
                    Детальніше <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
