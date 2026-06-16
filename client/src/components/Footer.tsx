import { ExternalLink, Zap } from "lucide-react";
import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="border-t border-border/50 bg-card/30 mt-auto">
      <div className="container py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 bg-primary/20 border border-primary/50 rounded flex items-center justify-center">
                <Zap className="w-4 h-4 text-primary" />
              </div>
              <span className="font-display text-lg font-bold text-primary tracking-widest uppercase">TaVi Esports</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Офіційна турнірна платформа Mobile Legends: Bang Bang для українських гравців.
              Змагайтесь, перемагайте, ставайте легендами.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Навігація</h4>
            <ul className="space-y-2">
              {[
                { href: "/", label: "Головна" },
                { href: "/tournaments", label: "Турніри" },
                { href: "/leaderboard", label: "Рейтинг" },
                { href: "/news", label: "Новини" },
                { href: "/register-team", label: "Реєстрація" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Спільнота</h4>
            <ul className="space-y-2">
              {[
                { href: "https://t.me/tavi_esports", label: "Telegram" },
                { href: "https://discord.gg/tavi", label: "Discord" },
                { href: "https://youtube.com/@tavi", label: "YouTube" },
                { href: "https://twitch.tv/tavi", label: "Twitch" },
              ].map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-border/50 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} TaVi Esports. Всі права захищені.
          </p>
          <p className="text-xs text-muted-foreground">
            Не є офіційним партнером Moonton / Mobile Legends: Bang Bang
          </p>
        </div>
      </div>
    </footer>
  );
}
