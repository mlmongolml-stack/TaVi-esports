import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import {
  Calendar,
  CheckCircle,
  Clock,
  Edit,
  Loader2,
  Plus,
  Save,
  Shield,
  Trash2,
  Trophy,
  Users,
  XCircle,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";

const MLBB_ROLES = ["Jungler", "Gold Lane", "EXP Lane", "Mid Lane", "Roamer", "Hyper", "Flex"];

function formatDate(date: Date | string | null | undefined) {
  if (!date) return "TBD";
  return new Date(date).toLocaleDateString("uk-UA", { day: "2-digit", month: "short", year: "numeric" });
}

const regStatusMap: Record<string, { label: string; icon: React.ReactNode; cls: string }> = {
  pending: { label: "На розгляді", icon: <Clock className="w-3.5 h-3.5" />, cls: "status-upcoming" },
  approved: { label: "Підтверджено", icon: <CheckCircle className="w-3.5 h-3.5" />, cls: "status-ongoing" },
  rejected: { label: "Відхилено", icon: <XCircle className="w-3.5 h-3.5" />, cls: "status-cancelled" },
};

interface PlayerForm {
  nickname: string;
  mlbbPlayerId: string;
  role: string;
  isCaptain: boolean;
}

export default function Dashboard() {
  const { isAuthenticated, loading, user } = useAuth();
  const utils = trpc.useUtils();

  const { data: team, isLoading: teamLoading } = trpc.teams.myTeam.useQuery(undefined, { enabled: isAuthenticated });
  const { data: registrations = [], isLoading: regsLoading } = trpc.teams.myRegistrations.useQuery(undefined, { enabled: isAuthenticated });

  const [editing, setEditing] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [captainNick, setCaptainNick] = useState("");
  const [captainTelegram, setCaptainTelegram] = useState("");
  const [captainDiscord, setCaptainDiscord] = useState("");
  const [players, setPlayers] = useState<PlayerForm[]>([]);

  useEffect(() => {
    if (team) {
      setTeamName(team.name);
      setLogoUrl(team.logoUrl ?? "");
      setCaptainNick(team.captainNick);
      setCaptainTelegram(team.captainTelegram ?? "");
      setCaptainDiscord(team.captainDiscord ?? "");
      setPlayers(
        (team.players ?? []).map((p) => ({
          nickname: p.nickname,
          mlbbPlayerId: p.mlbbPlayerId ?? "",
          role: p.role ?? "",
          isCaptain: p.isCaptain,
        }))
      );
    }
  }, [team]);

  const updateMutation = trpc.teams.update.useMutation({
    onSuccess: () => {
      toast.success("Команду оновлено!");
      utils.teams.myTeam.invalidate();
      setEditing(false);
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSave = () => {
    if (players.some((p) => !p.nickname.trim())) {
      toast.error("Заповніть нікнейми всіх гравців");
      return;
    }
    updateMutation.mutate({
      name: teamName,
      logoUrl,
      captainNick,
      captainTelegram,
      captainDiscord,
      players: players.map((p) => ({
        nickname: p.nickname,
        mlbbPlayerId: p.mlbbPlayerId || undefined,
        role: p.role || undefined,
        isCaptain: p.isCaptain,
      })),
    });
  };

  if (loading || teamLoading) {
    return (
      <div className="container py-20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container py-20 text-center max-w-md mx-auto">
        <Shield className="w-16 h-16 text-primary mx-auto mb-4" />
        <h2 className="font-display text-2xl font-bold text-foreground mb-3">Потрібна авторизація</h2>
        <p className="text-muted-foreground mb-6">Увійдіть для доступу до особистого кабінету</p>
        <Link href="/login" className="cyber-btn-primary">
          <Zap className="w-4 h-4" />
          Увійти
        </Link>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="container py-20 text-center max-w-md mx-auto">
        <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="font-display text-2xl font-bold text-foreground mb-3">Команди немає</h2>
        <p className="text-muted-foreground mb-6">Зареєструйте команду для участі у турнірах</p>
        <Link href="/register-team" className="cyber-btn-primary">
          <Plus className="w-4 h-4" />
          Зареєструвати команду
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-px w-6 bg-primary" />
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">Особистий кабінет</span>
        </div>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            {team.logoUrl && (
              <img src={team.logoUrl} alt={team.name} className="w-14 h-14 rounded-lg object-cover border border-border" />
            )}
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-black uppercase text-foreground">
                {team.name}
              </h1>
              <p className="text-sm text-muted-foreground">Капітан: {team.captainNick}</p>
            </div>
          </div>
          <div className="flex gap-3">
            {user?.role === "admin" && (
              <Link href="/admin" className="cyber-btn-accent text-xs py-2 px-4">
                <Shield className="w-3.5 h-3.5" />
                Адмін
              </Link>
            )}
            {!editing ? (
              <button onClick={() => setEditing(true)} className="cyber-btn-outline text-xs py-2 px-4">
                <Edit className="w-3.5 h-3.5" />
                Редагувати
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={handleSave} disabled={updateMutation.isPending} className="cyber-btn-primary text-xs py-2 px-4">
                  {updateMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  Зберегти
                </button>
                <button onClick={() => setEditing(false)} className="cyber-btn-outline text-xs py-2 px-4">
                  Скасувати
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Team info + Roster */}
        <div className="lg:col-span-2 space-y-5">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Перемоги", value: team.wins, color: "text-green-400" },
              { label: "Поразки", value: team.losses, color: "text-red-400" },
              { label: "Очки", value: team.points, color: "text-accent" },
            ].map((s) => (
              <div key={s.label} className="cyber-card p-4 text-center">
                <div className={cn("text-2xl font-display font-bold", s.color)}>{s.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Team Details (editable) */}
          <div className="cyber-card p-5 space-y-4">
            <h2 className="font-heading text-lg font-bold text-foreground flex items-center gap-2">
              <Trophy className="w-5 h-5 text-primary" />
              Деталі команди
            </h2>
            {editing ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { label: "Назва команди", value: teamName, setter: setTeamName, placeholder: "Назва" },
                  { label: "URL логотипу", value: logoUrl, setter: setLogoUrl, placeholder: "https://..." },
                  { label: "Нік капітана", value: captainNick, setter: setCaptainNick, placeholder: "GameNick" },
                  { label: "Telegram", value: captainTelegram, setter: setCaptainTelegram, placeholder: "@username" },
                  { label: "Discord", value: captainDiscord, setter: setCaptainDiscord, placeholder: "user#0000" },
                ].map((field) => (
                  <div key={field.label}>
                    <label className="block text-xs text-muted-foreground mb-1">{field.label}</label>
                    <input
                      type="text"
                      value={field.value}
                      onChange={(e) => field.setter(e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full bg-input border border-border rounded px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  { label: "Telegram", value: team.captainTelegram },
                  { label: "Discord", value: team.captainDiscord },
                  { label: "MLBB ID", value: team.mlbbPlayerId },
                  { label: "Зареєстровано", value: formatDate(team.createdAt) },
                ].map((item) => item.value ? (
                  <div key={item.label}>
                    <span className="text-xs text-muted-foreground">{item.label}</span>
                    <p className="text-foreground font-medium">{item.value}</p>
                  </div>
                ) : null)}
              </div>
            )}
          </div>

          {/* Roster */}
          <div className="cyber-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-lg font-bold text-foreground flex items-center gap-2">
                <Users className="w-5 h-5 text-secondary" />
                Склад ({players.length}/7)
              </h2>
              {editing && players.length < 7 && (
                <button
                  type="button"
                  onClick={() => setPlayers([...players, { nickname: "", mlbbPlayerId: "", role: "", isCaptain: false }])}
                  className="cyber-btn-outline text-xs py-1.5 px-3"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Додати
                </button>
              )}
            </div>

            <div className="space-y-2">
              {players.map((p, i) => (
                <div key={i} className={cn("rounded-lg p-3 border", editing ? "bg-muted/30 border-border/60" : "bg-muted/20 border-transparent")}>
                  {editing ? (
                    <div className="flex items-start gap-3">
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <input
                          type="text"
                          value={p.nickname}
                          onChange={(e) => setPlayers(players.map((pl, idx) => idx === i ? { ...pl, nickname: e.target.value } : pl))}
                          placeholder="Нікнейм *"
                          className="bg-input border border-border rounded px-2.5 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                        />
                        <input
                          type="text"
                          value={p.mlbbPlayerId}
                          onChange={(e) => setPlayers(players.map((pl, idx) => idx === i ? { ...pl, mlbbPlayerId: e.target.value } : pl))}
                          placeholder="MLBB ID"
                          className="bg-input border border-border rounded px-2.5 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                        />
                        <select
                          value={p.role}
                          onChange={(e) => setPlayers(players.map((pl, idx) => idx === i ? { ...pl, role: e.target.value } : pl))}
                          className="bg-input border border-border rounded px-2.5 py-1.5 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                        >
                          <option value="">Роль</option>
                          {MLBB_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                        </select>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <label className="flex items-center gap-1 text-xs text-muted-foreground cursor-pointer">
                          <input
                            type="checkbox"
                            checked={p.isCaptain}
                            onChange={(e) => setPlayers(players.map((pl, idx) => ({ ...pl, isCaptain: idx === i ? e.target.checked : false })))}
                            className="w-3.5 h-3.5 accent-primary"
                          />
                          Кап.
                        </label>
                        {players.length > 1 && (
                          <button onClick={() => setPlayers(players.filter((_, idx) => idx !== i))} className="text-destructive hover:text-destructive/80">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
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
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Registrations */}
        <div className="space-y-5">
          <div className="cyber-card p-5">
            <h2 className="font-heading text-lg font-bold text-foreground flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-accent" />
              Мої турніри
            </h2>

            {regsLoading ? (
              <div className="space-y-2">
                {[1, 2].map((i) => (
                  <div key={i} className="h-16 bg-muted/50 rounded animate-pulse" />
                ))}
              </div>
            ) : registrations.length === 0 ? (
              <div className="text-center py-6">
                <Trophy className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Немає реєстрацій</p>
                <Link href="/tournaments" className="text-xs text-primary hover:underline mt-2 block">
                  Переглянути турніри →
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {registrations.map((reg) => {
                  const st = regStatusMap[reg.status] ?? regStatusMap.pending;
                  return (
                    <div key={reg.id} className="bg-muted/30 rounded-lg p-3 border border-border/50">
                      <Link href={`/tournaments/${reg.tournament?.slug}`} className="text-sm font-medium text-foreground hover:text-primary transition-colors block mb-1.5">
                        {reg.tournament?.title ?? "Турнір"}
                      </Link>
                      <div className="flex items-center justify-between">
                        <span className={cn("inline-flex items-center gap-1", st.cls)}>
                          {st.icon}
                          {st.label}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(reg.createdAt)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div className="cyber-card p-5">
            <h2 className="font-heading text-base font-bold text-foreground mb-3">Швидкі дії</h2>
            <div className="space-y-2">
              <Link href="/tournaments" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors py-1.5">
                <Trophy className="w-4 h-4" />
                Переглянути турніри
              </Link>
              <Link href="/leaderboard" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors py-1.5">
                <Zap className="w-4 h-4" />
                Таблиця лідерів
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
