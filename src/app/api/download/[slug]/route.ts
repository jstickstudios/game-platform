import { readFile } from "node:fs/promises";
import path from "node:path";
import { getUser, hasAccess } from "@/lib/auth";
import { getGame } from "@/lib/games";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ slug: string }> },
) {
  const { slug } = await ctx.params;
  const game = getGame(slug);
  if (!game) return Response.json({ error: "Game not found." }, { status: 404 });

  const user = await getUser();
  if (!user) return Response.json({ error: "Log in to download." }, { status: 401 });
  if (game.priceCents !== 0 && !(await hasAccess(user, slug)))
    return Response.json({ error: "Buy this game to download it." }, { status: 403 });

  const file = path.join(process.cwd(), "private", game.file);
  const data = await readFile(file);
  return new Response(new Uint8Array(data), {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `attachment; filename="${game.downloadName}"`,
      "Cache-Control": "no-store",
    },
  });
}
