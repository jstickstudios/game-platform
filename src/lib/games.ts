export type Game = {
  slug: string;
  title: string;
  tagline: string;
  image: string;
  imageAspect: "portrait" | "landscape";
  priceCents: number;
  currency: "eur";
  file: string; // file inside /private
  downloadName: string;
  gory: boolean;
  rating: "E" | "A" | "18+";
};

export const GAMES: Game[] = [
  {
    slug: "neon-stickman-parkour",
    title: "Neon Stickman - Rooftop Parkour",
    tagline:
      "Sprint, slide and wall-jump across five neon worlds. Master 50 levels and endless runs.",
    image: "neon-stickman-poster.jpg",
    imageAspect: "portrait",
    priceCents: 0,
    currency: "eur",
    file: "neon-stickman-parkour.html",
    downloadName: "Neon-Stickman-Parkour.html",
    gory: false,
    rating: "A",
  },
  {
    slug: "neon-stickman-ninja",
    title: "Neon Stickman Ninja: Neon Blade",
    tagline: "Master the neon blade, unlock skins and survive endless waves of enemies.",
    image: "neon-stickman-ninja-poster.jpg",
    imageAspect: "landscape",
    priceCents: 200,
    currency: "eur",
    file: "neon-stickman-ninja.html",
    downloadName: "Neon-Stickman-Ninja.html",
    gory: false,
    rating: "A",
  },
];
export const getGame = (slug: string) => GAMES.find((g) => g.slug === slug);

export const formatPrice = (cents: number) => (cents === 0 ? "FREE" :
  new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" }).format(
    cents / 100,
  ));
