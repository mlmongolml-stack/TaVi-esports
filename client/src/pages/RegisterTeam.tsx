import { useAuth } from "@/_core/hooks/useAuth";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { Loader2, Plus, Trash2, Trophy, Upload, Users, Zap } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

const MLBB_ROLES = ["Jungler", "Gold Lane", "EXP Lane", "Mid Lane", "Roamer", "Hyper", "Flex"];

interface PlayerForm {
  nickname: string;
  mlbbPlayerId: string;
  role: string;
  isCaptain: boolean;
}

const emptyPlayer = (): PlayerForm => ({
  nickname: "",
  mlbbPlayerId: "",
  role: "",
  isCaptain: false,
});

export default function RegisterTeam() {
  const { isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();

  const [teamName, setTeamName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [captainNick, setCaptainNick] = useState("");
  const [captainTelegram, setCaptainTelegram] = useState("");
  const [captainDiscord, setCaptainDiscord] = useState("");
  const [mlbbPlayerId, setMlbbPlayerId] = useState("");
  const [players, setPlayers] = useState<PlayerForm[]>([{ ...emptyPlayer(), isCaptain: true }]);

  const registerMutation = trpc.teams.register.useMutation({
    onSuccess: () => {
      toast.success("Команду успішно зареєстровано!");
      utils.teams.myTeam.invalidate();
      navigate("/dashboard");
    },
    onError: (err) => {
      toast.error(err.message || "Помилка реєстрації команди");
    },
  });

  const addPlayer = () => {
    if (players.length < 7) setPlayers([...players, emptyPlayer()]);
  };

  const removePlayer = (i: number) => {
    if (players.length > 1) setPlayers(players.filter((_, idx) => idx !== i));
  };

  const updatePlayer = (i: number, field: keyof PlayerForm, value: string | boolean) => {
    setPlayers(players.map((p, idx) => (idx === i ? { ...p, [field]: value } : p)));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim()) { toast.error("Введіть назву команди"); return; }
    if (!captainNick.trim()) { toast.error("Введіть нік капітана"); return; }
    if (players.some((p) => !p.nickname.trim())) { toast.error("Заповніть нікнейми всіх гравців"); return; }

    registerMutation.mutate({
      name: teamName,
      logoUrl: logoUrl || undefined,
      captainNick,
      captainTelegram: captainTelegram || undefined,
      captainDiscord: captainDiscord || undefined,
      mlbbPlayerId: mlbbPlayerId || undefined,
      players: players.map((p) => ({
        nickname: p.nickname,
        mlbbPlayerId: p.mlbbPlayerId || undefined,
        role: p.role || undefined,
        isCaptain: p.isCaptain,
      })),
    });
  };

  if (loading) {
    return (
      <div className="container py-20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // If not authenticated, redirect to login with return URL
  if (!isAuthenticated) {
    return (
      <div className="container py-20 text-center max-w-md mx-auto">
        <Trophy className="w-16 h-16 text-primary mx-auto mb-4" />
        <h2 className="font-display text-2xl font-bold text-foreground mb-3">Потрібна авторизація</h2>
        <p className="text-muted-foreground mb-6">Увійдіть, щоб зареєструвати команду</p>
        <Link href="/login?redirect=/register-team" className="cyber-btn-primary">
          <Zap className="w-4 h-4" />
          Увійти та зареєструвати команду
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-10 max-w-2xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-px w-8 bg-primary" />
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
            Реєстрація
          </span>
        </div>
        <h1 className="font-display text-4xl font-black uppercase leading-none">
          <span className="block text-foreground">Зареєструвати</span>
          <span className="block neon-blue">Команду</span>
        </h1>
        <p className="text-muted-foreground mt-4 max-w-xl">
          Заповніть форму, щоб зареєструвати вашу команду на турнір Mobile Legends: Bang Bang
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Team Info */}
        <div className="cyber-card p-6">
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            Інформація про команду
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Назва команди *</label>
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="Назва вашої команди"
                className="w-full px-4 py-2 bg-background border border-primary/20 rounded text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Логотип команди (URL)</label>
              <input
                type="url"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://example.com/logo.png"
                className="w-full px-4 py-2 bg-background border border-primary/20 rounded text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>

        {/* Captain Info */}
        <div className="cyber-card p-6">
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-secondary" />
            Інформація про капітана
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Нік капітана *</label>
              <input
                type="text"
                value={captainNick}
                onChange={(e) => setCaptainNick(e.target.value)}
                placeholder="Ваш нік у грі"
                className="w-full px-4 py-2 bg-background border border-primary/20 rounded text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Telegram</label>
                <input
                  type="text"
                  value={captainTelegram}
                  onChange={(e) => setCaptainTelegram(e.target.value)}
                  placeholder="@username"
                  className="w-full px-4 py-2 bg-background border border-primary/20 rounded text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Discord</label>
                <input
                  type="text"
                  value={captainDiscord}
                  onChange={(e) => setCaptainDiscord(e.target.value)}
                  placeholder="username#1234"
                  className="w-full px-4 py-2 bg-background border border-primary/20 rounded text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">MLBB ID</label>
              <input
                type="text"
                value={mlbbPlayerId}
                onChange={(e) => setMlbbPlayerId(e.target.value)}
                placeholder="123456789"
                className="w-full px-4 py-2 bg-background border border-primary/20 rounded text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>

        {/* Players */}
        <div className="cyber-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Users className="w-5 h-5 text-accent" />
              Склад команди ({players.length}/7)
            </h2>
            {players.length < 7 && (
              <button
                type="button"
                onClick={addPlayer}
                className="cyber-btn-sm flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Додати гравця
              </button>
            )}
          </div>

          <div className="space-y-4">
            {players.map((player, idx) => (
              <div key={idx} className="p-4 border border-primary/20 rounded bg-background/50">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-primary">
                    Гравець {idx + 1} {player.isCaptain && "👑 (Капітан)"}
                  </span>
                  {idx > 0 && (
                    <button
                      type="button"
                      onClick={() => removePlayer(idx)}
                      className="text-destructive hover:text-destructive/80"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Нік *</label>
                    <input
                      type="text"
                      value={player.nickname}
                      onChange={(e) => updatePlayer(idx, "nickname", e.target.value)}
                      placeholder="Нік гравця"
                      className="w-full px-3 py-2 bg-background border border-primary/20 rounded text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">MLBB ID</label>
                    <input
                      type="text"
                      value={player.mlbbPlayerId}
                      onChange={(e) => updatePlayer(idx, "mlbbPlayerId", e.target.value)}
                      placeholder="ID"
                      className="w-full px-3 py-2 bg-background border border-primary/20 rounded text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Роль</label>
                    <select
                      value={player.role}
                      onChange={(e) => updatePlayer(idx, "role", e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-primary/20 rounded text-foreground focus:outline-none focus:border-primary text-sm"
                    >
                      <option value="">Виберіть роль</option>
                      {MLBB_ROLES.map((role) => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={registerMutation.isPending}
            className="cyber-btn-primary flex-1 flex items-center justify-center gap-2"
          >
            {registerMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Реєстрація...
              </>
            ) : (
              <>
                <Trophy className="w-4 h-4" />
                Зареєструвати команду
              </>
            )}
          </button>
          <Link href="/tournaments" className="cyber-btn-outline flex-1 text-center">
            Скасувати
          </Link>
        </div>
      </form>
    </div>
  );
}
