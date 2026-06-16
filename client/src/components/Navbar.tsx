import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { cn } from "@/lib/utils";
import { Menu, Shield, Trophy, X, Zap } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";

const navLinks = [
  { href: "/", label: "Головна" },
  { href: "/tournaments", label: "Турніри" },
  { href: "/leaderboard", label: "Рейтинг" },
  { href: "/news", label: "Новини" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [location] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/90 backdrop-blur-md">
      {/* Top accent line */}
      <div className="h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent" />

      <nav className="container flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative">
            <div className="w-9 h-9 bg-primary/20 border border-primary/50 rounded flex items-center justify-center group-hover:bg-primary/30 transition-colors">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div className="absolute inset-0 rounded animate-glow-pulse opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-display text-base font-bold text-primary tracking-widest uppercase">TaVi</span>
            <span className="text-[10px] text-muted-foreground tracking-[0.2em] uppercase">Esports</span>
          </div>
        </Link>

        {/* Desktop nav */}
        <ul className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={cn(
                  "px-4 py-2 text-sm font-medium uppercase tracking-wider transition-all duration-200 rounded relative",
                  location === link.href
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {location === link.href && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-primary rounded-full" />
                )}
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right actions */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <>
              {user?.role === "admin" && (
                <Link href="/admin" className="flex items-center gap-1.5 text-xs text-yellow-400 hover:text-yellow-300 transition-colors">
                  <Shield className="w-3.5 h-3.5" />
                  Адмін
                </Link>
              )}
              <Link href="/dashboard" className="flex items-center gap-2 px-3 py-1.5 rounded border border-border hover:border-primary/50 transition-colors text-sm">
                <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-xs text-primary font-bold">
                  {user?.name?.[0]?.toUpperCase() ?? "?"}
                </div>
                <span className="text-foreground text-xs font-medium max-w-24 truncate">{user?.name ?? "Кабінет"}</span>
              </Link>
              <button
                onClick={() => logout()}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Вийти
              </button>
            </>
          ) : (
            <>
              <Link href="/register-team" className="cyber-btn-outline text-xs py-2 px-4">
                <Trophy className="w-3.5 h-3.5" />
                Реєстрація
              </Link>
              <a href={getLoginUrl()} className="cyber-btn-primary text-xs py-2 px-4">
                Увійти
              </a>
            </>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-md">
          <div className="container py-4 flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "px-4 py-3 text-sm font-medium uppercase tracking-wider rounded transition-colors",
                  location === link.href
                    ? "bg-primary/10 text-primary border border-primary/30"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-border/50 pt-3 mt-2 flex flex-col gap-2">
              {isAuthenticated ? (
                <>
                  <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="cyber-btn-outline text-sm py-2.5">
                    Мій кабінет
                  </Link>
                  {user?.role === "admin" && (
                    <Link href="/admin" onClick={() => setMobileOpen(false)} className="cyber-btn-accent text-sm py-2.5">
                      <Shield className="w-4 h-4" />
                      Адмін панель
                    </Link>
                  )}
                  <button onClick={() => { logout(); setMobileOpen(false); }} className="text-sm text-muted-foreground py-2">
                    Вийти
                  </button>
                </>
              ) : (
                <>
                  <Link href="/register-team" onClick={() => setMobileOpen(false)} className="cyber-btn-outline text-sm py-2.5 text-center">
                    Реєстрація команди
                  </Link>
                  <a href={getLoginUrl()} className="cyber-btn-primary text-sm py-2.5 text-center">
                    Увійти
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
