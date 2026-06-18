import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { useSEO } from "@/hooks/useSEO";
import {
  Calendar,
  ChevronRight,
  Clock,
  Crown,
  ExternalLink,
  Flame,
  Shield,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { Link } from "wouter";

import { useAuth } from "@/_core/hooks/useAuth";

function formatDate(date: Date | string | null | undefined) {
  if (!date) return "TBD";
  return new Date(date).toLocaleDateString("uk-UA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    upcoming: { label: "Незабаром", cls: "status-upcoming" },
    registration: { label: "Реєстрація", cls: "status-registration" },
    ongoing: { label: "Триває", cls: "status-ongoing" },
    completed: { label: "Завершено", cls: "status-completed" },
    cancelled: { label: "Скасовано", cls: "status-cancelled" },
  };
  const s = map[status] ?? { label: status, cls: "status-upcoming" };
  return <span className={s.cls}>{s.label}</span>;
}

function FormatBadge({ format }: { format: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    single_elimination: { label: "SE", cls: "format-se" },
    double_elimination: { label: "DE", cls: "format-de" },
    round_robin: { label: "RR", cls: "format-rr" },
  };
  const f = map[format] ?? { label: format, cls: "format-se" };
  return <span className={f.cls}>{f.label}</span>;
}

export default function Home() {
  const { isAuthenticated } = useAuth();
  useSEO({
    title: "Головна",
    description: "TaVi Esports — офіційна платформа для турнірів Mobile Legends: Bang Bang в Україні. Реєструй команду та змагайся!",
  });
  const { data: tournaments = [] } = trpc.tournaments.list.useQuery({ status: undefined });
  const { data: news = [] } = trpc.news.list.useQuery({ limit: 4 });
  const { data: teamsCount = 0 } = trpc.tournaments.teamsCount.useQuery();

  const upcoming = tournaments.filter((t) => t.status === "upcoming" || t.status === "registration");
  const featuredTournament = upcoming[0] ?? tournaments[0];

  return (
    <div className="min-h-screen">
      {/* ── Hero Banner ──────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden cyber-grid-bg cyber-scanlines">
        {/* Background glow effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-secondary/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-accent/10 rounded-full blur-3xl" />
        </div>

        <div className="container relative py-20 md:py-28">
          <div className="max-w-3xl">
            {/* Pre-title */}
            <div className="flex items-center gap-2 mb-4">
              <div className="h-px w-8 bg-primary" />
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
                Mobile Legends: Bang Bang
              </span>
            </div>

            {/* Main title */}
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-black uppercase leading-none mb-4">
              <span className="block text-foreground">TaVi</span>
              <span className="block neon-blue">Esports</span>
              <span className="block text-2xl sm:text-3xl md:text-4xl text-muted-foreground font-heading font-semibold tracking-wider mt-1">
                Турнірна Платформа
              </span>
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground mb-8 max-w-xl leading-relaxed">
              Реєструй команду, змагайся з найкращими гравцями України та здобувай перемогу
              у офіційних турнірах Mobile Legends: Bang Bang.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-3">
              {isAuthenticated ? (
                <Link href="/register-team" className="cyber-btn-primary">
                  <Trophy className="w-4 h-4" />
                  Зареєструвати команду
                </Link>
              ) : (
                <Link href="/login" className="cyber-btn-primary">
                  <Zap className="w-4 h-4" />
                  Почати зараз
                </Link>
              )}
              <Link href="/tournaments" className="cyber-btn-outline">
                Всі турніри
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Stats row */}
            <div className="flex flex-wrap gap-6 mt-10">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                <span className="text-sm">
                  <span className="font-bold text-foreground neon-blue">{teamsCount}</span>
                  <span className="text-muted-foreground ml-1">команд</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-accent" />
                <span className="text-sm">
                  <span className="font-bold text-foreground">{tournaments.length}</span>
                  <span className="text-muted-foreground ml-1">турнірів</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-secondary" />
                <span className="text-sm">
                  <span className="font-bold text-foreground">{upcoming.length}</span>
                  <span className="text-muted-foreground ml-1">активних</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* ── Featured Tournament Banner ────────────────────────────────────────── */}
      {featuredTournament && (
        <section className="container py-8">
          <Link href={`/tournaments/${featuredTournament.slug}`}>
            <div className="cyber-card border border-primary/30 p-6 hover:border-primary/60 transition-all duration-300 group cursor-pointer">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/20 border border-primary/40 rounded-lg flex items-center justify-center shrink-0">
                    <Trophy className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold uppercase tracking-widest text-primary">
                        {featuredTournament.status === "registration" ? "🔥 Відкрита реєстрація" : "⚡ Найближчий турнір"}
                      </span>
                    </div>
                    <h2 className="text-xl font-heading font-bold text-foreground group-hover:text-primary transition-colors">
                      {featuredTournament.title}
                    </h2>
                    <div className="flex flex-wrap items-center gap-3 mt-1">
                      <StatusBadge status={featuredTournament.status} />
                      <FormatBadge format={featuredTournament.format} />
                      {featuredTournament.prizePool && (
                        <span className="text-xs text-accent font-semibold">
                          💰 {featuredTournament.prizePool}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground shrink-0">
                  {featuredTournament.startDate && (
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      {formatDate(featuredTournament.startDate)}
                    </div>
                  )}
                  <ChevronRight className="w-5 h-5 text-primary group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* ── Main content grid ─────────────────────────────────────────────────── */}
      <section className="container pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upcoming Tournaments */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-heading text-2xl font-bold text-foreground flex items-center gap-2">
                <Trophy className="w-5 h-5 text-primary" />
                Турніри
              </h2>
              <Link href="/tournaments" className="text-sm text-primary hover:text-primary/80 flex items-center gap-1 transition-colors">
                Всі <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {tournaments.length === 0 ? (
              <div className="cyber-card p-10 text-center">
                <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">Турніри незабаром з'являться</p>
              </div>
            ) : (
              <div className="space-y-3">
                {tournaments.slice(0, 5).map((t) => (
                  <Link key={t.id} href={`/tournaments/${t.slug}`}>
                    <div className="cyber-card p-4 hover:border-primary/40 transition-all duration-200 group cursor-pointer">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 bg-primary/10 border border-primary/20 rounded flex items-center justify-center shrink-0">
                            <Trophy className="w-5 h-5 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                              {t.title}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2 mt-0.5">
                              <StatusBadge status={t.status} />
                              <FormatBadge format={t.format} />
                              {t.prizePool && (
                                <span className="text-xs text-accent">💰 {t.prizePool}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0">
                          {t.startDate && (
                            <div className="hidden sm:flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {formatDate(t.startDate)}
                            </div>
                          )}
                          <ChevronRight className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* News sidebar */}
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-heading text-2xl font-bold text-foreground flex items-center gap-2">
                <Zap className="w-5 h-5 text-accent" />
                Новини
              </h2>
              <Link href="/news" className="text-sm text-primary hover:text-primary/80 flex items-center gap-1 transition-colors">
                Всі <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {news.length === 0 ? (
              <div className="cyber-card p-8 text-center">
                <Zap className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Новини незабаром</p>
              </div>
            ) : (
              <div className="space-y-3">
                {news.map((article) => (
                  <Link key={article.id} href={`/news/${article.slug}`}>
                    <div className="cyber-card p-4 hover:border-primary/40 transition-all duration-200 group cursor-pointer">
                      {article.imageUrl && (
                        <img
                          src={article.imageUrl}
                          alt={article.title}
                          className="w-full h-32 object-cover rounded mb-3"
                        />
                      )}
                      <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-1">
                        {article.title}
                      </h3>
                      {article.excerpt && (
                        <p className="text-xs text-muted-foreground line-clamp-2">{article.excerpt}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        {formatDate(article.createdAt)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Features Section ──────────────────────────────────────────────────── */}
      <section className="border-t border-border/50 bg-card/20 py-16">
        <div className="container">
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl font-bold text-foreground mb-2">
              Чому <span className="neon-blue">TaVi Esports</span>?
            </h2>
            <p className="text-muted-foreground">Все необхідне для проведення та участі в турнірах</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Trophy, title: "Турнірна сітка", desc: "SE, DE та Round Robin з автоматичною генерацією", color: "text-primary" },
              { icon: Users, title: "Команди", desc: "Реєстрація та управління складом до 7 гравців", color: "text-accent" },
              { icon: Crown, title: "Рейтинг", desc: "Таблиця лідерів та статистика гравців", color: "text-secondary" },
              { icon: ExternalLink, title: "Трансляції", desc: "YouTube, Twitch та TikTok Live прямо на сайті", color: "text-green-400" },
            ].map((f) => (
              <div key={f.title} className="cyber-card p-5 text-center">
                <div className={cn("w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center mx-auto mb-3", f.color)}>
                  <f.icon className="w-5 h-5" />
                </div>
                <h3 className="font-heading font-semibold text-foreground mb-1">{f.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────────────────────────────── */}
      <section className="container py-16">
        <div className="cyber-card border border-primary/30 p-8 md:p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 cyber-grid-bg opacity-30" />
          <div className="relative">
            <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-3">
              Готовий до бою?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Зареєструй свою команду та прийми участь у наступному турнірі TaVi Esports
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              {isAuthenticated ? (
                <Link href="/register-team" className="cyber-btn-primary">
                  <Trophy className="w-4 h-4" />
                  Зареєструвати команду
                </Link>
              ) : (
                <Link href="/login" className="cyber-btn-primary">
                  <Zap className="w-4 h-4" />
                  Увійти та зареєструватись
                </Link>
              )}
              <Link href="/tournaments" className="cyber-btn-outline">
                Переглянути турніри
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
