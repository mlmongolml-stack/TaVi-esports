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

  if (!isAuthenticated) {
    return (
      <div className="container py-20 text-center max-w-md mx-auto">
        <Trophy className="w-16 h-16 text-primary mx-auto mb-4" />
        <h2 className="font-display text-2xl font-bold text-foreground mb-3">Потрібна авторизація</h2>
        <p className="text-muted-foreground mb-6">Увійдіть, щоб зареєструвати команду</p>
        <Link href="/login" className="cyber-btn-primary">
          <Zap className="w-4 h-4" />
          Увійти
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-10 max-w-2xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-px w-6 bg-primary" />
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">Команди</span>
        </div>
        <h1 className="font-display text-3xl font-black uppercase text-foreground mb-2">
          Реєстрація команди
        </h1>
        <p className="text-muted-foreground">Заповніть форму для участі у турнірах TaVi Esports</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Team Info */}
        <div className="cyber-card p-6 space-y-4">
          <h2 className="font-heading text-lg font-bold text-foreground flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            Інформація про команду
          </h2>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Назва команди <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="Введіть назву команди"
              maxLength={128}
              className="w-full bg-input border border-border rounded px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              <Upload className="w-4 h-4 inline mr-1" />
              URL логотипу команди
            </label>
            <input
              type="url"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://example.com/logo.png"
              className="w-full bg-input border border-border rounded px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
            />
            {logoUrl && (
              <div className="mt-2 flex items-center gap-3">
                <img src={logoUrl} alt="Logo preview" className="w-12 h-12 rounded object-cover border border-border" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                <span className="text-xs text-muted-foreground">Попередній перегляд</span>
              </div>
            )}
          </div>
        </div>

        {/* Captain Info */}
        <div className="cyber-card p-6 space-y-4">
          <h2 className="font-heading text-lg font-bold text-foreground flex items-center gap-2">
            <Zap className="w-5 h-5 text-accent" />
            Інформація про капітана
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Нік капітана <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={captainNick}
                onChange={(e) => setCaptainNick(e.target.value)}
                placeholder="GameNick123"
                maxLength={64}
                className="w-full bg-input border border-border rounded px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                MLBB Player ID
              </label>
              <input
                type="text"
                value={mlbbPlayerId}
                onChange={(e) => setMlbbPlayerId(e.target.value)}
                placeholder="123456789"
                maxLength={64}
                className="w-full bg-input border border-border rounded px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Telegram капітана
              </label>
              <input
                type="text"
                value={captainTelegram}
                onChange={(e) => setCaptainTelegram(e.target.value)}
                placeholder="@username"
                maxLength={64}
                className="w-full bg-input border border-border rounded px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Discord капітана
              </label>
              <input
                type="text"
                value={captainDiscord}
                onChange={(e) => setCaptainDiscord(e.target.value)}
                placeholder="username#0000"
                maxLength={64}
                className="w-full bg-input border border-border rounded px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Roster */}
        <div className="cyber-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-lg font-bold text-foreground flex items-center gap-2">
              <Users className="w-5 h-5 text-secondary" />
              Склад команди
              <span className="text-sm font-normal text-muted-foreground">({players.length}/7)</span>
            </h2>
            {players.length < 7 && (
              <button
                type="button"
                onClick={addPlayer}
                className="cyber-btn-outline text-xs py-1.5 px-3"
              >
                <Plus className="w-3.5 h-3.5" />
                Додати гравця
              </button>
            )}
          </div>

          <div className="space-y-3">
            {players.map((player, i) => (
              <div key={i} className="bg-muted/30 border border-border/60 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Гравець {i + 1}
                    {player.isCaptain && <span className="ml-2 text-accent">★ Капітан</span>}
                  </span>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
                      <input
                        type="checkbox"
                        checked={player.isCaptain}
                        onChange={(e) => {
                          // Only one captain
                          const updated = players.map((p, idx) => ({ ...p, isCaptain: idx === i ? e.target.checked : false }));
                          setPlayers(updated);
                        }}
                        className="w-3.5 h-3.5 accent-primary"
                      />
                      Капітан
                    </label>
                    {players.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePlayer(i)}
                        className="text-destructive hover:text-destructive/80 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">
                      Нікнейм <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="text"
                      value={player.nickname}
                      onChange={(e) => updatePlayer(i, "nickname", e.target.value)}
                      placeholder="GameNick"
                      maxLength={64}
                      className="w-full bg-input border border-border rounded px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">MLBB ID</label>
                    <input
                      type="text"
                      value={player.mlbbPlayerId}
                      onChange={(e) => updatePlayer(i, "mlbbPlayerId", e.target.value)}
                      placeholder="123456789"
                      maxLength={64}
                      className="w-full bg-input border border-border rounded px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Роль</label>
                    <select
                      value={player.role}
                      onChange={(e) => updatePlayer(i, "role", e.target.value)}
                      className="w-full bg-input border border-border rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                    >
                      <option value="">Оберіть роль</option>
                      {MLBB_ROLES.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={registerMutation.isPending}
          className={cn("cyber-btn-primary w-full py-3 text-base", registerMutation.isPending && "opacity-60 cursor-not-allowed")}
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
      </form>
    </div>
  );
}
