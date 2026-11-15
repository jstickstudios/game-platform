import { getUser, hasAccess } from "@/lib/auth";
import { getGame } from "@/lib/games";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const user = await getUser();
  if (!user) return Response.json({ error: "Log in to use online multiplayer." }, { status: 401 });

  const slug = new URL(req.url).searchParams.get("game") ?? "";
  const game = getGame(slug);
  if (!game) return Response.json({ error: "Game not found." }, { status: 404 });
  if (game.priceCents > 0 && !(await hasAccess(user, slug))) {
    return Response.json({ error: "Purchase this game to play online." }, { status: 403 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !publishableKey) {
    return Response.json({ error: "Online multiplayer is not configured on the website yet." }, { status: 503 });
  }

  return Response.json(
    { url, publishableKey, username: user.username, game: slug },
    { headers: { "Cache-Control": "no-store" } },
  );
}
