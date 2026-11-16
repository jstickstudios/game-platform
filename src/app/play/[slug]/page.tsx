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

  const downloadUrl = `/api/download/${slug}`;
  const user = await getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(downloadUrl)}`);
  if (game.priceCents > 0 && !(await hasAccess(user, slug))) {
    redirect(`/checkout/${slug}`);
  }

  // Legacy /play links now download the game instead of embedding it in the website.
  redirect(downloadUrl);
}
