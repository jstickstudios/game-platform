import { getGame } from "@/lib/games";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ slug: string }> },
) {
  const { slug } = await ctx.params;
  if (!getGame(slug)) {
    return Response.json({ error: "Game not found." }, { status: 404 });
  }

  return Response.json(
    { error: "Games are download-only. Use the Download button on the game page." },
    { status: 410 },
  );
}
