import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getUser, hasAccess } from "@/lib/auth";
import { getGame } from "@/lib/games";

export const dynamic = "force-dynamic";

export default async function PlayPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const game = getGame(slug);
  if (!game) notFound();

  const user = await getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(`/play/${slug}`)}`);
  if (game.priceCents > 0 && !(await hasAccess(user, slug))) {
    redirect(`/checkout/${slug}`);
  }

  return (
    <main className="fixed inset-0 z-50 flex flex-col bg-[#05050f] text-white">
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-white/10 bg-black/80 px-4">
        <div className="truncate text-sm font-bold">{game.title} <span className="ml-2 text-xs text-emerald-300">ONLINE MODE</span></div>
        <Link href="/" className="rounded-lg border border-white/15 px-3 py-1.5 text-xs font-bold hover:bg-white/10">
          Exit game
        </Link>
      </header>
      <iframe
        title={game.title}
        src={`/api/play/${slug}`}
        className="min-h-0 flex-1 border-0"
        allow="fullscreen; autoplay"
        allowFullScreen
      />
    </main>
  );
}
