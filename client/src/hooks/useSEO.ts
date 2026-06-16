import { useEffect } from "react";

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: "website" | "article";
  structuredData?: object;
}

const SITE_NAME = "TaVi Esports Tournament Platform";
const DEFAULT_DESCRIPTION = "Платформа для проведення турнірів Mobile Legends: Bang Bang в Україні. Реєстрація команд, турнірні сітки, результати матчів.";
const DEFAULT_IMAGE = "https://tavi-esports.manus.space/og-image.png";

function setMeta(name: string, content: string, isProperty = false) {
  const attr = isProperty ? "property" : "name";
  let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function removeStructuredData() {
  const existing = document.querySelector('script[type="application/ld+json"][data-seo]');
  if (existing) existing.remove();
}

function injectStructuredData(data: object) {
  removeStructuredData();
  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.setAttribute("data-seo", "true");
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
}

export function useSEO({ title, description, image, url, type = "website", structuredData }: SEOProps) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
    const desc = description ?? DEFAULT_DESCRIPTION;
    const img = image ?? DEFAULT_IMAGE;
    const pageUrl = url ?? window.location.href;

    // Basic
    document.title = fullTitle;
    setMeta("description", desc);

    // Open Graph
    setMeta("og:title", fullTitle, true);
    setMeta("og:description", desc, true);
    setMeta("og:image", img, true);
    setMeta("og:url", pageUrl, true);
    setMeta("og:type", type, true);
    setMeta("og:site_name", SITE_NAME, true);
    setMeta("og:locale", "uk_UA", true);

    // Twitter
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", fullTitle);
    setMeta("twitter:description", desc);
    setMeta("twitter:image", img);

    // Structured data
    if (structuredData) {
      injectStructuredData(structuredData);
    } else {
      removeStructuredData();
    }

    return () => {
      removeStructuredData();
    };
  }, [title, description, image, url, type, structuredData]);
}

export function buildTournamentStructuredData(tournament: {
  title: string;
  description?: string | null;
  startDate?: Date | string | null;
  endDate?: Date | string | null;
  prizePool?: string | null;
  slug: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    name: tournament.title,
    description: tournament.description ?? DEFAULT_DESCRIPTION,
    sport: "Mobile Legends: Bang Bang",
    startDate: tournament.startDate ? new Date(tournament.startDate).toISOString() : undefined,
    endDate: tournament.endDate ? new Date(tournament.endDate).toISOString() : undefined,
    url: `${window.location.origin}/tournaments/${tournament.slug}`,
    organizer: {
      "@type": "Organization",
      name: SITE_NAME,
      url: window.location.origin,
    },
    ...(tournament.prizePool && {
      prize: tournament.prizePool,
    }),
  };
}
