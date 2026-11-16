import { notFound, redirect } from "next/navigation";
import { getUser, hasAccess } from "@/lib/auth";
import { getGame } from "@/lib/games";
import GamePlayer from "@/components/GamePlayer";

export const dynamic = "force-dynamic";

export default async function PlayPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const game = getGame(slug);
  if (!game) notFound();

  // Free games can be played instantly in the browser. Paid games keep their
  // existing account and ownership checks.
  if (game.priceCents > 0) {
    const user = await getUser();
    if (!user) redirect(`/login?next=${encodeURIComponent("/play/" + slug)}`);
    if (!(await hasAccess(user, slug))) redirect(`/checkout/${slug}`);
  }

  return <GamePlayer slug={game.slug} title={game.title} />;
}
