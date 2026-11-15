import { asc, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { gameScores, users } from "@/db/schema";
import { getUser, hasAccess } from "@/lib/auth";
import { getGame } from "@/lib/games";

export const dynamic = "force-dynamic";

async function authorizedGame(req: Request) {
  const user = await getUser();
  if (!user) return { error: Response.json({ error: "Log in to view rankings." }, { status: 401 }) };
  const slug = new URL(req.url).searchParams.get("game") ?? "";
  const game = getGame(slug);
  if (!game) return { error: Response.json({ error: "Game not found." }, { status: 404 }) };
  if (game.priceCents > 0 && !(await hasAccess(user, slug))) {
    return { error: Response.json({ error: "You do not own this game." }, { status: 403 }) };
  }
  return { user, slug };
}

export async function GET(req: Request) {
  const auth = await authorizedGame(req);
  if ("error" in auth) return auth.error;

  const rows = await db
    .select({
      username: users.username,
      score: gameScores.score,
      details: gameScores.details,
      updatedAt: gameScores.updatedAt,
    })
    .from(gameScores)
    .innerJoin(users, eq(gameScores.userId, users.id))
    .where(eq(gameScores.gameSlug, auth.slug))
    .orderBy(desc(gameScores.score), asc(gameScores.updatedAt))
    .limit(10);

  return Response.json({
    entries: rows.map((row, index) => ({
      rank: index + 1,
      username: row.username,
      score: Number(row.score),
      details: row.details,
      updatedAt: row.updatedAt,
    })),
  }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: Request) {
  const auth = await authorizedGame(req);
  if ("error" in auth) return auth.error;

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return Response.json({ error: "Invalid score submission." }, { status: 400 });
  }

  let score = 0;
  let details: Record<string, number> = {};

  if (auth.slug === "neon-stickman-parkour") {
    const distance = Number(body.distance);
    const maps = Number(body.maps);
    const timeMs = Number(body.timeMs);
    if (
      !Number.isSafeInteger(distance) || distance < 0 || distance > 100_000_000 ||
      !Number.isSafeInteger(maps) || maps < 0 || maps > 10_000 ||
      !Number.isSafeInteger(timeMs) || timeMs < 0 || timeMs > 86_400_000
    ) {
      return Response.json({ error: "Parkour score is outside the accepted range." }, { status: 400 });
    }
    score = distance;
    details = { distance, maps, timeMs };
  } else {
    const bestMap = Number(body.bestMap);
    const bestWave = Number(body.bestWave);
    const totalKills = Number(body.totalKills);
    if (
      !Number.isSafeInteger(bestMap) || bestMap < 1 || bestMap > 10_000 ||
      !Number.isSafeInteger(bestWave) || bestWave < 1 || bestWave > 10 ||
      !Number.isSafeInteger(totalKills) || totalKills < 0 || totalKills > 10_000_000
    ) {
      return Response.json({ error: "Ninja score is outside the accepted range." }, { status: 400 });
    }
    score = (bestMap - 1) * 10 + bestWave;
    details = { bestMap, bestWave, totalKills };
  }

  await db
    .insert(gameScores)
    .values({ userId: auth.user.id, gameSlug: auth.slug, score, details })
    .onConflictDoUpdate({
      target: [gameScores.userId, gameScores.gameSlug],
      set: {
        score: sql`greatest(${gameScores.score}, excluded.score)`,
        details: sql`case when excluded.score >= ${gameScores.score} then excluded.details else ${gameScores.details} end`,
        updatedAt: sql`case when excluded.score >= ${gameScores.score} then now() else ${gameScores.updatedAt} end`,
      },
    });

  return Response.json({ ok: true, score });
}
