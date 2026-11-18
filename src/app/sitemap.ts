import type { MetadataRoute } from "next";
import { GAMES } from "@/lib/games";

const siteUrl = "https://jstickstudios.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages: MetadataRoute.Sitemap = [
    { url: siteUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/store`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteUrl}/studio`, changeFrequency: "monthly", priority: 0.7 },
  ];

  const gamePages: MetadataRoute.Sitemap = GAMES.map((game) => ({
    url: `${siteUrl}/games/${game.slug}`,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...pages, ...gamePages];
}
