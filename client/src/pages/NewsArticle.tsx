import { trpc } from "@/lib/trpc";
import { ArrowLeft, Calendar, Zap } from "lucide-react";
import { Link } from "wouter";

function formatDate(date: Date | string | null | undefined) {
  if (!date) return "";
  return new Date(date).toLocaleDateString("uk-UA", { day: "2-digit", month: "long", year: "numeric" });
}

export default function NewsArticle({ params }: { params: { slug: string } }) {
  const { data: article, isLoading, error } = trpc.news.bySlug.useQuery({ slug: params.slug });

  if (isLoading) {
    return (
      <div className="container py-10 max-w-3xl">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/4" />
          <div className="h-8 bg-muted rounded w-3/4" />
          <div className="h-64 bg-muted rounded" />
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded" />
            <div className="h-4 bg-muted rounded w-5/6" />
            <div className="h-4 bg-muted rounded w-4/6" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="container py-10 text-center">
        <Zap className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-foreground mb-2">Статтю не знайдено</h2>
        <Link href="/news" className="text-primary hover:underline">← Повернутись до новин</Link>
      </div>
    );
  }

  return (
    <div className="container py-10 max-w-3xl">
      <Link href="/news" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" />
        Всі новини
      </Link>

      {article.imageUrl && (
        <div className="rounded-lg overflow-hidden mb-6 border border-border/50">
          <img src={article.imageUrl} alt={article.title} className="w-full h-64 object-cover" />
        </div>
      )}

      <div className="flex items-center gap-3 mb-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-4 h-4" />
          {formatDate(article.createdAt)}
        </div>
      </div>

      <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-4">
        {article.title}
      </h1>

      {article.excerpt && (
        <p className="text-base text-muted-foreground border-l-2 border-primary pl-4 mb-6 italic">
          {article.excerpt}
        </p>
      )}

      <div className="prose prose-invert prose-sm max-w-none text-foreground/90 leading-relaxed whitespace-pre-wrap">
        {article.content}
      </div>
    </div>
  );
}
