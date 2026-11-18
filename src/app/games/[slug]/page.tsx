import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Nav from "@/components/Nav";
import GameActions from "@/components/GameActions";
import { Footer } from "@/components/Sections";
import { getUser, hasAccess } from "@/lib/auth";
import { GAMES, formatPrice, getGame } from "@/lib/games";

const siteUrl = "https://jstickstudios.com";

export function generateStaticParams() {
  return GAMES.map((game) => ({ slug: game.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const game = getGame(slug);
  if (!game) return { title: "Game not found" };

  const description = `${game.tagline} Discover ${game.title}, an original game from JStick Studios.`;
  const image = `/images/${game.image}`;

  return {
    title: game.title,
    description,
    alternates: { canonical: `/games/${game.slug}` },
    openGraph: {
      type: "website",
      title: `${game.title} | JStick Studios`,
      description,
      url: `${siteUrl}/games/${game.slug}`,
      images: [{ url: image, alt: `${game.title} game artwork` }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${game.title} | JStick Studios`,
      description,
      images: [image],
    },
  };
}

export default async function GameDetails({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const game = getGame(slug);
  if (!game) notFound();

  const user = await getUser();
  const owned = await hasAccess(user, game.slug);
  const mode = !user
    ? "guest"
    : user.isFounder
      ? "founder"
      : user.username.toLowerCase() === "friendchi"
        ? "friend"
        : owned
          ? "owner"
          : "buyer";

  const structuredGame = {
    "@context": "https://schema.org",
    "@type": "VideoGame",
    name: game.title,
    description: game.tagline,
    image: `${siteUrl}/images/${game.image}`,
    genre: "Action",
    gamePlatform: "Web browser",
    url: `${siteUrl}/games/${game.slug}`,
    publisher: { "@type": "Organization", name: "JStick Studios", url: siteUrl },
    offers: {
      "@type": "Offer",
      price: (game.priceCents / 100).toFixed(2),
      priceCurrency: "EUR",
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <main className="min-h-screen overflow-hidden bg-ink text-white">
      <Nav />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredGame) }}
      />
      <div className="mx-auto max-w-[1180px] px-4 py-8 sm:px-6 sm:py-14">
        <Link href="/#games" className="text-xs font-bold uppercase tracking-[0.18em] text-white/45 transition hover:text-brand-2">
          ← All games
        </Link>
        <div className="mt-6 grid gap-8 lg:grid-cols-[1.25fr_.75fr] lg:items-center">
          <div className="relative aspect-video overflow-hidden rounded-[26px] border border-white/10 bg-black shadow-[0_28px_90px_rgba(0,0,0,.4)]">
            <Image
              src={`/images/${game.image}`}
              alt={`${game.title} game artwork`}
              fill
              priority
              sizes="(min-width:1024px) 760px, 100vw"
              className="object-cover"
            />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-2">JStick Studios original</p>
            <h1 className="mt-4 text-4xl font-black leading-[1.02] tracking-tight sm:text-5xl">{game.title}</h1>
            <p className="mt-5 text-sm leading-relaxed text-white/60 sm:text-base">{game.tagline}</p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <span className="rounded-lg border border-white/10 bg-white/[0.05] px-4 py-3 text-sm font-black">{formatPrice(game.priceCents)}</span>
              <GameActions
                slug={game.slug}
                price={formatPrice(game.priceCents)}
                mode={mode}
                downloadName={game.downloadName}
                username={user ? user.username : "guest"}
              />
            </div>
            <p className="mt-5 text-xs leading-relaxed text-white/35">
              A game from JStick Studios. Download on desktop or play in your browser on supported devices.
            </p>
          </div>
        </div>
        <section className="mt-16 border-t border-white/10 pt-8">
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-brand-2">More from the studio</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {GAMES.filter((item) => item.slug !== game.slug).map((item) => (
              <Link key={item.slug} href={`/games/${item.slug}`} className="rounded-xl border border-white/10 bg-white/[0.03] p-4 transition hover:-translate-y-1 hover:border-brand-2/40 hover:bg-white/[0.06]">
                <span className="block text-sm font-extrabold">{item.title}</span>
                <span className="mt-2 block text-[10px] font-bold uppercase tracking-wider text-brand-2">View game ↗</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
      <Footer />
    </main>
  );
}
