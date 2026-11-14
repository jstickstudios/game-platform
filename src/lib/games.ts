export type Game = {
  slug: string;
  title: string;
  tagline: string;
  priceCents: number;
  currency: "eur";
  file: string; // file inside /private
  downloadName: string;
  gory: boolean;
};

export const GAMES: Game[] = [
  {
    slug: "neon-stickman-parkour",
    title: "Neon Stickman — Rooftop Parkour",
    tagline:
      "Run it yourself. Slide, wall-jump and sprint across endless rooftops — and die in new, bloody ways on a brand-new map every time.",
    priceCents: 0,
    currency: "eur",
    file: "neon-stickman-parkour.html",
    downloadName: "Neon-Stickman-Parkour.html",
    gory: true,
  },
];

export const getGame = (slug: string) => GAMES.find((g) => g.slug === slug);

export const formatPrice = (cents: number) => (cents === 0 ? "FREE" :
  new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" }).format(
    cents / 100,
  ));
