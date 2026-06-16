import { trpc } from "@/lib/trpc";
import { Calendar, ChevronRight, Zap } from "lucide-react";
import { Link } from "wouter";

function formatDate(date: Date | string | null | undefined) {
  if (!date) return "";
  return new Date(date).toLocaleDateString("uk-UA", { day: "2-digit", month: "long", year: "numeric" });
}

export default function News() {
  const { data: articles = [], isLoading } = trpc.news.list.useQuery({ limit: 20 });

  return (
    <div className="container py-10">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-px w-6 bg-accent" />
          <span className="text-xs font-semibold uppercase tracking-widest text-accent">Платформа</span>
        </div>
        <h1 className="font-display text-3xl md:text-4xl font-black uppercase text-foreground mb-2">
          Новини
        </h1>
        <p className="text-muted-foreground">Останні новини та анонси TaVi Esports</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="cyber-card p-5 animate-pulse">
              <div className="h-36 bg-muted rounded mb-4" />
              <div className="h-4 bg-muted rounded w-3/4 mb-2" />
              <div className="h-3 bg-muted rounded w-full mb-1" />
              <div className="h-3 bg-muted rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : articles.length === 0 ? (
        <div className="cyber-card p-16 text-center">
          <Zap className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Новин поки немає</h3>
          <p className="text-muted-foreground">Слідкуйте за оновленнями</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {articles.map((article) => (
            <Link key={article.id} href={`/news/${article.slug}`}>
              <div className="cyber-card hover:border-primary/40 transition-all duration-200 group cursor-pointer h-full flex flex-col overflow-hidden">
                {article.imageUrl ? (
                  <div className="h-44 overflow-hidden">
                    <img
                      src={article.imageUrl}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="h-32 bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                    <Zap className="w-10 h-10 text-primary/40" />
                  </div>
                )}
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-heading text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2 flex-1">
                    {article.title}
                  </h3>
                  {article.excerpt && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{article.excerpt}</p>
                  )}
                  <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto pt-3 border-t border-border/50">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(article.createdAt)}
                    </div>
                    <div className="flex items-center gap-1 text-primary font-semibold">
                      Читати <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
