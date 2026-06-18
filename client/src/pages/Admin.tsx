import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import {
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Edit,
  Loader2,
  Plus,
  Shield,
  Trash2,
  Trophy,
  Users,
  XCircle,
  Zap,
  FileText,
  Settings,
} from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";

// ─── Tournament Form ──────────────────────────────────────────────────────────
interface TournamentFormData {
  slug: string;
  title: string;
  description: string;
  format: "single_elimination" | "double_elimination" | "round_robin";
  status: "upcoming" | "registration" | "ongoing" | "completed" | "cancelled";
  prizePool: string;
  maxTeams: number;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  streamUrl: string;
  streamPlatform: "youtube" | "twitch" | "tiktok" | "";
  bannerUrl: string;
  rules: string;
}

const emptyTournamentForm = (): TournamentFormData => ({
  slug: "",
  title: "",
  description: "",
  format: "single_elimination",
  status: "upcoming",
  prizePool: "",
  maxTeams: 16,
  startDate: "",
  endDate: "",
  registrationDeadline: "",
  streamUrl: "",
  streamPlatform: "",
  bannerUrl: "",
  rules: "",
});

function TournamentForm({
  initial,
  onSave,
  onCancel,
  isLoading,
}: {
  initial: TournamentFormData;
  onSave: (data: TournamentFormData) => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const [form, setForm] = useState(initial);
  const set = (field: keyof TournamentFormData, value: string | number) =>
    setForm((f) => ({ ...f, [field]: value }));

  return (
    <div className="cyber-card p-6 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { label: "Назва *", field: "title" as const, placeholder: "TaVi Cup #1" },
          { label: "Slug *", field: "slug" as const, placeholder: "tavi-cup-1" },
          { label: "Призовий фонд", field: "prizePool" as const, placeholder: "1000 UAH" },
          { label: "URL банеру", field: "bannerUrl" as const, placeholder: "https://..." },
          { label: "URL трансляції", field: "streamUrl" as const, placeholder: "https://youtube.com/..." },
        ].map((f) => (
          <div key={f.field}>
            <label className="block text-xs text-muted-foreground mb-1">{f.label}</label>
            <input
              type="text"
              value={form[f.field] as string}
              onChange={(e) => set(f.field, e.target.value)}
              placeholder={f.placeholder}
              className="w-full bg-input border border-border rounded px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        ))}

        <div>
          <label className="block text-xs text-muted-foreground mb-1">Формат *</label>
          <select
            value={form.format}
            onChange={(e) => set("format", e.target.value)}
            className="w-full bg-input border border-border rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
          >
            <option value="single_elimination">Single Elimination</option>
            <option value="double_elimination">Double Elimination</option>
            <option value="round_robin">Round Robin</option>
          </select>
        </div>

        <div>
          <label className="block text-xs text-muted-foreground mb-1">Статус</label>
          <select
            value={form.status}
            onChange={(e) => set("status", e.target.value)}
            className="w-full bg-input border border-border rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
          >
            <option value="upcoming">Незабаром</option>
            <option value="registration">Реєстрація</option>
            <option value="ongoing">Триває</option>
            <option value="completed">Завершено</option>
            <option value="cancelled">Скасовано</option>
          </select>
        </div>

        <div>
          <label className="block text-xs text-muted-foreground mb-1">Платформа трансляції</label>
          <select
            value={form.streamPlatform}
            onChange={(e) => set("streamPlatform", e.target.value)}
            className="w-full bg-input border border-border rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
          >
            <option value="">Немає</option>
            <option value="youtube">YouTube</option>
            <option value="twitch">Twitch</option>
            <option value="tiktok">TikTok Live</option>
          </select>
        </div>

        <div>
          <label className="block text-xs text-muted-foreground mb-1">Макс. команд</label>
          <input
            type="number"
            value={form.maxTeams}
            onChange={(e) => set("maxTeams", parseInt(e.target.value) || 16)}
            min={2}
            max={128}
            className="w-full bg-input border border-border rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {[
          { label: "Початок", field: "startDate" as const },
          { label: "Кінець", field: "endDate" as const },
          { label: "Дедлайн реєстрації", field: "registrationDeadline" as const },
        ].map((f) => (
          <div key={f.field}>
            <label className="block text-xs text-muted-foreground mb-1">{f.label}</label>
            <input
              type="datetime-local"
              value={form[f.field] as string}
              onChange={(e) => set(f.field, e.target.value)}
              className="w-full bg-input border border-border rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        ))}
      </div>

      <div>
        <label className="block text-xs text-muted-foreground mb-1">Опис</label>
        <textarea
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          rows={3}
          placeholder="Опис турніру..."
          className="w-full bg-input border border-border rounded px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors resize-none"
        />
      </div>

      <div>
        <label className="block text-xs text-muted-foreground mb-1">Правила</label>
        <textarea
          value={form.rules}
          onChange={(e) => set("rules", e.target.value)}
          rows={4}
          placeholder="Правила турніру..."
          className="w-full bg-input border border-border rounded px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors resize-none"
        />
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => onSave(form)}
          disabled={isLoading}
          className="cyber-btn-primary text-sm py-2 px-5"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
          Зберегти
        </button>
        <button onClick={onCancel} className="cyber-btn-outline text-sm py-2 px-5">
          Скасувати
        </button>
      </div>
    </div>
  );
}

// ─── News Form ────────────────────────────────────────────────────────────────
interface NewsFormData {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  imageUrl: string;
  published: boolean;
}

const emptyNewsForm = (): NewsFormData => ({
  slug: "",
  title: "",
  excerpt: "",
  content: "",
  imageUrl: "",
  published: false,
});

// ─── Admin Panel ──────────────────────────────────────────────────────────────
type AdminTab = "tournaments" | "teams" | "news";

export default function Admin() {
  const { user, isAuthenticated, loading } = useAuth();
  const utils = trpc.useUtils();
  const [activeTab, setActiveTab] = useState<AdminTab>("tournaments");

  // Tournament state
  const [showTournamentForm, setShowTournamentForm] = useState(false);
  const [editingTournamentId, setEditingTournamentId] = useState<number | null>(null);
  const [tournamentForm, setTournamentForm] = useState(emptyTournamentForm());
  const [expandedTournament, setExpandedTournament] = useState<number | null>(null);

  // News state
  const [showNewsForm, setShowNewsForm] = useState(false);
  const [editingNewsId, setEditingNewsId] = useState<number | null>(null);
  const [newsForm, setNewsForm] = useState(emptyNewsForm());

  // Match score state
  const [matchScores, setMatchScores] = useState<Record<number, { score1: number; score2: number; winnerId: number | null }>>({});

  // Data
  const { data: tournaments = [], isLoading: tournamentsLoading } = trpc.admin.listTournaments.useQuery(undefined, { enabled: isAuthenticated && user?.role === "admin" });
  const { data: allTeams = [], isLoading: teamsLoading } = trpc.admin.listTeams.useQuery(undefined, { enabled: isAuthenticated && user?.role === "admin" });
  const { data: allNews = [], isLoading: newsLoading } = trpc.admin.listNews.useQuery(undefined, { enabled: isAuthenticated && user?.role === "admin" });

  // Registrations for expanded tournament
  const { data: registrations = [] } = trpc.admin.listRegistrations.useQuery(
    { tournamentId: expandedTournament ?? 0 },
    { enabled: !!expandedTournament }
  );

  // Matches for expanded tournament
  const { data: matches = [] } = trpc.tournaments.matches.useQuery(
    { tournamentId: expandedTournament ?? 0 },
    { enabled: !!expandedTournament }
  );

  // Mutations
  const createTournamentMutation = trpc.admin.createTournament.useMutation({
    onSuccess: () => { toast.success("Турнір створено!"); utils.admin.listTournaments.invalidate(); setShowTournamentForm(false); },
    onError: (e) => toast.error(e.message),
  });

  const updateTournamentMutation = trpc.admin.updateTournament.useMutation({
    onSuccess: () => { toast.success("Турнір оновлено!"); utils.admin.listTournaments.invalidate(); setEditingTournamentId(null); },
    onError: (e) => toast.error(e.message),
  });

  const generateBracketMutation = trpc.admin.generateBracket.useMutation({
    onSuccess: (data) => {
      toast.success(`Сітку згенеровано! ${data.matchCount} матчів`);
      utils.tournaments.matches.invalidate({ tournamentId: expandedTournament ?? 0 });
    },
    onError: (e) => toast.error(e.message),
  });

  const updateRegistrationMutation = trpc.admin.updateRegistration.useMutation({
    onSuccess: () => { toast.success("Статус оновлено"); utils.admin.listRegistrations.invalidate({ tournamentId: expandedTournament ?? 0 }); },
    onError: (e) => toast.error(e.message),
  });

  const updateMatchMutation = trpc.admin.updateMatch.useMutation({
    onSuccess: () => { toast.success("Результат збережено"); utils.tournaments.matches.invalidate({ tournamentId: expandedTournament ?? 0 }); },
    onError: (e) => toast.error(e.message),
  });

  const createNewsMutation = trpc.admin.createNews.useMutation({
    onSuccess: () => { toast.success("Новину створено!"); utils.admin.listNews.invalidate(); setShowNewsForm(false); setNewsForm(emptyNewsForm()); },
    onError: (e) => toast.error(e.message),
  });

  const updateNewsMutation = trpc.admin.updateNews.useMutation({
    onSuccess: () => { toast.success("Новину оновлено!"); utils.admin.listNews.invalidate(); setEditingNewsId(null); },
    onError: (e) => toast.error(e.message),
  });

  const deleteNewsMutation = trpc.admin.deleteNews.useMutation({
    onSuccess: () => { toast.success("Новину видалено"); utils.admin.listNews.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  const updateTeamMutation = trpc.admin.updateTeamAdmin.useMutation({
    onSuccess: () => { toast.success("Команду оновлено"); utils.admin.listTeams.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  if (loading) return <div className="container py-20 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  if (!isAuthenticated) {
    return (
      <div className="container py-20 text-center max-w-md mx-auto">
        <Shield className="w-16 h-16 text-primary mx-auto mb-4" />
        <h2 className="font-display text-2xl font-bold text-foreground mb-3">Потрібна авторизація</h2>
        <Link href="/login" className="cyber-btn-primary"><Zap className="w-4 h-4" />Увійти</Link>
      </div>
    );
  }

  if (user?.role !== "admin") {
    return (
      <div className="container py-20 text-center max-w-md mx-auto">
        <Shield className="w-16 h-16 text-destructive mx-auto mb-4" />
        <h2 className="font-display text-2xl font-bold text-foreground mb-3">Доступ заборонено</h2>
        <p className="text-muted-foreground mb-6">Ця сторінка доступна тільки адміністраторам</p>
        <Link href="/" className="cyber-btn-outline">На головну</Link>
      </div>
    );
  }

  const tabs: { key: AdminTab; label: string; icon: React.ReactNode; count?: number }[] = [
    { key: "tournaments", label: "Турніри", icon: <Trophy className="w-4 h-4" />, count: tournaments.length },
    { key: "teams", label: "Команди", icon: <Users className="w-4 h-4" />, count: allTeams.length },
    { key: "news", label: "Новини", icon: <FileText className="w-4 h-4" />, count: allNews.length },
  ];

  return (
    <div className="container py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-px w-6 bg-accent" />
          <span className="text-xs font-semibold uppercase tracking-widest text-accent">Адміністрування</span>
        </div>
        <h1 className="font-display text-3xl font-black uppercase text-foreground flex items-center gap-3">
          <Shield className="w-8 h-8 text-accent" />
          Адмін Панель
        </h1>
        <p className="text-muted-foreground mt-1">Управління турнірами, командами та контентом</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-border/50">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px",
              activeTab === tab.key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.icon}
            {tab.label}
            {tab.count !== undefined && (
              <span className="bg-muted text-muted-foreground text-xs px-1.5 py-0.5 rounded-full">{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Tournaments Tab ──────────────────────────────────────────────────── */}
      {activeTab === "tournaments" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => { setShowTournamentForm(true); setTournamentForm(emptyTournamentForm()); setEditingTournamentId(null); }}
              className="cyber-btn-primary text-sm py-2 px-4"
            >
              <Plus className="w-4 h-4" />
              Новий турнір
            </button>
          </div>

          {showTournamentForm && editingTournamentId === null && (
            <TournamentForm
              initial={tournamentForm}
              onSave={(data) => createTournamentMutation.mutate({
                ...data,
                streamPlatform: data.streamPlatform || undefined,
                startDate: data.startDate || undefined,
                endDate: data.endDate || undefined,
                registrationDeadline: data.registrationDeadline || undefined,
              })}
              onCancel={() => setShowTournamentForm(false)}
              isLoading={createTournamentMutation.isPending}
            />
          )}

          {tournamentsLoading ? (
            <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 bg-muted/30 rounded animate-pulse" />)}</div>
          ) : tournaments.length === 0 ? (
            <div className="cyber-card p-12 text-center">
              <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Турнірів поки немає</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tournaments.map((t) => (
                <div key={t.id} className="cyber-card overflow-hidden">
                  {/* Tournament row */}
                  <div className="flex items-center justify-between p-4 gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        onClick={() => setExpandedTournament(expandedTournament === t.id ? null : t.id)}
                        className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                      >
                        {expandedTournament === t.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-foreground truncate">{t.title}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`status-${t.status}`}>{t.status}</span>
                          <span className="text-xs text-muted-foreground">{t.format.replace("_", " ")}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          setEditingTournamentId(t.id);
                          setShowTournamentForm(false);
                          setTournamentForm({
                            slug: t.slug,
                            title: t.title,
                            description: t.description ?? "",
                            format: t.format,
                            status: t.status,
                            prizePool: t.prizePool ?? "",
                            maxTeams: t.maxTeams,
                            startDate: t.startDate ? new Date(t.startDate).toISOString().slice(0, 16) : "",
                            endDate: t.endDate ? new Date(t.endDate).toISOString().slice(0, 16) : "",
                            registrationDeadline: t.registrationDeadline ? new Date(t.registrationDeadline).toISOString().slice(0, 16) : "",
                            streamUrl: t.streamUrl ?? "",
                            streamPlatform: (t.streamPlatform ?? "") as any,
                            bannerUrl: t.bannerUrl ?? "",
                            rules: t.rules ?? "",
                          });
                        }}
                        className="p-1.5 text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <Link href={`/tournaments/${t.slug}`} className="p-1.5 text-muted-foreground hover:text-primary transition-colors">
                        <Settings className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>

                  {/* Edit form */}
                  {editingTournamentId === t.id && (
                    <div className="border-t border-border/50 p-4">
                      <TournamentForm
                        initial={tournamentForm}
                        onSave={(data) => updateTournamentMutation.mutate({
                          id: t.id,
                          ...data,
                          streamPlatform: data.streamPlatform || null,
                          startDate: data.startDate || undefined,
                          endDate: data.endDate || undefined,
                          registrationDeadline: data.registrationDeadline || undefined,
                        })}
                        onCancel={() => setEditingTournamentId(null)}
                        isLoading={updateTournamentMutation.isPending}
                      />
                    </div>
                  )}

                  {/* Expanded: registrations + bracket + matches */}
                  {expandedTournament === t.id && (
                    <div className="border-t border-border/50 p-4 space-y-5">
                      {/* Generate bracket */}
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-foreground">Управління турніром</h4>
                        <button
                          onClick={() => generateBracketMutation.mutate({ tournamentId: t.id })}
                          disabled={generateBracketMutation.isPending}
                          className="cyber-btn-accent text-xs py-1.5 px-3"
                        >
                          {generateBracketMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                          Згенерувати сітку
                        </button>
                      </div>

                      {/* Registrations */}
                      <div>
                        <h4 className="text-sm font-semibold text-foreground mb-2">Заявки команд ({registrations.length})</h4>
                        {registrations.length === 0 ? (
                          <p className="text-xs text-muted-foreground">Заявок немає</p>
                        ) : (
                          <div className="space-y-1.5">
                            {registrations.map((reg) => (
                              <div key={reg.id} className="flex items-center justify-between bg-muted/20 rounded px-3 py-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-foreground">{reg.team?.name ?? "—"}</span>
                                  <span className={cn(
                                    "text-xs px-2 py-0.5 rounded",
                                    reg.status === "approved" ? "bg-green-500/20 text-green-400" :
                                    reg.status === "rejected" ? "bg-red-500/20 text-red-400" :
                                    "bg-yellow-500/20 text-yellow-400"
                                  )}>
                                    {reg.status === "approved" ? "Підтверджено" : reg.status === "rejected" ? "Відхилено" : "На розгляді"}
                                  </span>
                                </div>
                                <div className="flex gap-1.5">
                                  <button
                                    onClick={() => updateRegistrationMutation.mutate({ id: reg.id, status: "approved" })}
                                    disabled={reg.status === "approved"}
                                    className="p-1 text-green-400 hover:text-green-300 disabled:opacity-30 transition-colors"
                                    title="Підтвердити"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => updateRegistrationMutation.mutate({ id: reg.id, status: "rejected" })}
                                    disabled={reg.status === "rejected"}
                                    className="p-1 text-red-400 hover:text-red-300 disabled:opacity-30 transition-colors"
                                    title="Відхилити"
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Matches */}
                      {matches.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-foreground mb-2">Результати матчів ({matches.length})</h4>
                          <div className="space-y-2 max-h-80 overflow-y-auto">
                            {matches.filter((m) => m.status !== "bye").map((match) => {
                              const ms = matchScores[match.id] ?? { score1: match.score1 ?? 0, score2: match.score2 ?? 0, winnerId: match.winnerId };
                              return (
                                <div key={match.id} className="bg-muted/20 rounded p-3 border border-border/40">
                                  <div className="text-xs text-muted-foreground mb-2">
                                    R{match.round} M{match.matchNumber} — {match.bracketType}
                                  </div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-xs text-foreground w-28 truncate">{match.team1?.name ?? "TBD"}</span>
                                    <input
                                      type="number"
                                      min={0}
                                      value={ms.score1}
                                      onChange={(e) => setMatchScores((prev) => ({ ...prev, [match.id]: { ...ms, score1: parseInt(e.target.value) || 0 } }))}
                                      className="w-12 bg-input border border-border rounded px-2 py-1 text-xs text-center text-foreground focus:outline-none focus:border-primary"
                                    />
                                    <span className="text-xs text-muted-foreground">vs</span>
                                    <input
                                      type="number"
                                      min={0}
                                      value={ms.score2}
                                      onChange={(e) => setMatchScores((prev) => ({ ...prev, [match.id]: { ...ms, score2: parseInt(e.target.value) || 0 } }))}
                                      className="w-12 bg-input border border-border rounded px-2 py-1 text-xs text-center text-foreground focus:outline-none focus:border-primary"
                                    />
                                    <span className="text-xs text-foreground w-28 truncate">{match.team2?.name ?? "TBD"}</span>
                                    <select
                                      value={ms.winnerId ?? ""}
                                      onChange={(e) => setMatchScores((prev) => ({ ...prev, [match.id]: { ...ms, winnerId: e.target.value ? parseInt(e.target.value) : null } }))}
                                      className="bg-input border border-border rounded px-2 py-1 text-xs text-foreground focus:outline-none focus:border-primary"
                                    >
                                      <option value="">Переможець</option>
                                      {match.team1 && <option value={match.team1.id}>{match.team1.name}</option>}
                                      {match.team2 && <option value={match.team2.id}>{match.team2.name}</option>}
                                    </select>
                                    <button
                                      onClick={() => updateMatchMutation.mutate({
                                        matchId: match.id,
                                        score1: ms.score1,
                                        score2: ms.score2,
                                        winnerId: ms.winnerId ?? undefined,
                                        status: ms.winnerId ? "completed" : "ongoing",
                                      })}
                                      className="cyber-btn-primary text-xs py-1 px-2"
                                    >
                                      {updateMatchMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Teams Tab ────────────────────────────────────────────────────────── */}
      {activeTab === "teams" && (
        <div>
          {teamsLoading ? (
            <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-14 bg-muted/30 rounded animate-pulse" />)}</div>
          ) : allTeams.length === 0 ? (
            <div className="cyber-card p-12 text-center">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Команд поки немає</p>
            </div>
          ) : (
            <div className="cyber-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50 bg-muted/30">
                      <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Команда</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Капітан</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">W</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">L</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Очки</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Дії</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allTeams.map((team) => (
                      <AdminTeamRow key={team.id} team={team} onUpdate={(data) => updateTeamMutation.mutate({ id: team.id, ...data })} />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── News Tab ─────────────────────────────────────────────────────────── */}
      {activeTab === "news" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => { setShowNewsForm(true); setNewsForm(emptyNewsForm()); setEditingNewsId(null); }}
              className="cyber-btn-primary text-sm py-2 px-4"
            >
              <Plus className="w-4 h-4" />
              Нова новина
            </button>
          </div>

          {showNewsForm && editingNewsId === null && (
            <NewsFormComponent
              initial={newsForm}
              onSave={(data) => createNewsMutation.mutate(data)}
              onCancel={() => setShowNewsForm(false)}
              isLoading={createNewsMutation.isPending}
            />
          )}

          {newsLoading ? (
            <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-14 bg-muted/30 rounded animate-pulse" />)}</div>
          ) : allNews.length === 0 ? (
            <div className="cyber-card p-12 text-center">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Новин поки немає</p>
            </div>
          ) : (
            <div className="space-y-2">
              {allNews.map((article) => (
                <div key={article.id} className="cyber-card overflow-hidden">
                  <div className="flex items-center justify-between p-4 gap-3">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-foreground truncate">{article.title}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={cn("text-xs px-2 py-0.5 rounded", article.published ? "bg-green-500/20 text-green-400" : "bg-muted text-muted-foreground")}>
                          {article.published ? "Опубліковано" : "Чернетка"}
                        </span>
                        <span className="text-xs text-muted-foreground">{article.slug}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          setEditingNewsId(article.id);
                          setShowNewsForm(false);
                          setNewsForm({
                            slug: article.slug,
                            title: article.title,
                            excerpt: article.excerpt ?? "",
                            content: article.content,
                            imageUrl: article.imageUrl ?? "",
                            published: article.published,
                          });
                        }}
                        className="p-1.5 text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => { if (confirm("Видалити новину?")) deleteNewsMutation.mutate({ id: article.id }); }}
                        className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {editingNewsId === article.id && (
                    <div className="border-t border-border/50 p-4">
                      <NewsFormComponent
                        initial={newsForm}
                        onSave={(data) => updateNewsMutation.mutate({ id: article.id, ...data })}
                        onCancel={() => setEditingNewsId(null)}
                        isLoading={updateNewsMutation.isPending}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Admin Team Row ───────────────────────────────────────────────────────────
function AdminTeamRow({ team, onUpdate }: { team: any; onUpdate: (data: { wins?: number; losses?: number; points?: number }) => void }) {
  const [editing, setEditing] = useState(false);
  const [wins, setWins] = useState(team.wins);
  const [losses, setLosses] = useState(team.losses);
  const [points, setPoints] = useState(team.points);

  return (
    <tr className="border-b border-border/30 hover:bg-muted/20 transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          {team.logoUrl && <img src={team.logoUrl} alt={team.name} className="w-7 h-7 rounded object-cover border border-border" />}
          <span className="font-medium text-foreground">{team.name}</span>
        </div>
      </td>
      <td className="px-4 py-3 text-muted-foreground">{team.captainNick}</td>
      <td className="px-4 py-3 text-center">
        {editing ? (
          <input type="number" value={wins} onChange={(e) => setWins(parseInt(e.target.value) || 0)} className="w-12 bg-input border border-border rounded px-1 py-0.5 text-xs text-center text-foreground focus:outline-none focus:border-primary" />
        ) : (
          <span className="text-green-400 font-semibold">{team.wins}</span>
        )}
      </td>
      <td className="px-4 py-3 text-center">
        {editing ? (
          <input type="number" value={losses} onChange={(e) => setLosses(parseInt(e.target.value) || 0)} className="w-12 bg-input border border-border rounded px-1 py-0.5 text-xs text-center text-foreground focus:outline-none focus:border-primary" />
        ) : (
          <span className="text-red-400 font-semibold">{team.losses}</span>
        )}
      </td>
      <td className="px-4 py-3 text-center">
        {editing ? (
          <input type="number" value={points} onChange={(e) => setPoints(parseInt(e.target.value) || 0)} className="w-16 bg-input border border-border rounded px-1 py-0.5 text-xs text-center text-foreground focus:outline-none focus:border-primary" />
        ) : (
          <span className="text-accent font-bold">{team.points}</span>
        )}
      </td>
      <td className="px-4 py-3 text-center">
        {editing ? (
          <div className="flex items-center justify-center gap-1">
            <button onClick={() => { onUpdate({ wins, losses, points }); setEditing(false); }} className="p-1 text-green-400 hover:text-green-300"><CheckCircle className="w-4 h-4" /></button>
            <button onClick={() => setEditing(false)} className="p-1 text-muted-foreground hover:text-foreground"><XCircle className="w-4 h-4" /></button>
          </div>
        ) : (
          <button onClick={() => setEditing(true)} className="p-1 text-muted-foreground hover:text-primary transition-colors"><Edit className="w-4 h-4" /></button>
        )}
      </td>
    </tr>
  );
}

// ─── News Form Component ──────────────────────────────────────────────────────
function NewsFormComponent({ initial, onSave, onCancel, isLoading }: {
  initial: NewsFormData;
  onSave: (data: NewsFormData) => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const [form, setForm] = useState(initial);
  const set = (field: keyof NewsFormData, value: string | boolean) =>
    setForm((f) => ({ ...f, [field]: value }));

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          { label: "Заголовок *", field: "title" as const, placeholder: "Заголовок новини" },
          { label: "Slug *", field: "slug" as const, placeholder: "news-slug" },
          { label: "URL зображення", field: "imageUrl" as const, placeholder: "https://..." },
        ].map((f) => (
          <div key={f.field}>
            <label className="block text-xs text-muted-foreground mb-1">{f.label}</label>
            <input
              type="text"
              value={form[f.field] as string}
              onChange={(e) => set(f.field, e.target.value)}
              placeholder={f.placeholder}
              className="w-full bg-input border border-border rounded px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        ))}
      </div>
      <div>
        <label className="block text-xs text-muted-foreground mb-1">Короткий опис</label>
        <textarea value={form.excerpt} onChange={(e) => set("excerpt", e.target.value)} rows={2} placeholder="Короткий опис..." className="w-full bg-input border border-border rounded px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors resize-none" />
      </div>
      <div>
        <label className="block text-xs text-muted-foreground mb-1">Зміст *</label>
        <textarea value={form.content} onChange={(e) => set("content", e.target.value)} rows={6} placeholder="Текст новини..." className="w-full bg-input border border-border rounded px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors resize-none" />
      </div>
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={form.published} onChange={(e) => set("published", e.target.checked)} className="w-4 h-4 accent-primary" />
        <span className="text-sm text-foreground">Опублікувати</span>
      </label>
      <div className="flex gap-3">
        <button onClick={() => onSave(form)} disabled={isLoading} className="cyber-btn-primary text-sm py-2 px-5">
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
          Зберегти
        </button>
        <button onClick={onCancel} className="cyber-btn-outline text-sm py-2 px-5">Скасувати</button>
      </div>
    </div>
  );
}
