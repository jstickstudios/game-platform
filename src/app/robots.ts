import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/games/", "/store", "/studio"],
      disallow: ["/api/", "/play/", "/checkout/", "/login", "/signup"],
    },
    sitemap: "https://jstickstudios.com/sitemap.xml",
    host: "https://jstickstudios.com",
  };
}
