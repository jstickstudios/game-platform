import Image from "next/image";
import type { Game } from "@/lib/games";
import GameActions from "@/components/GameActions";
import { hasAccess, getUser } from "@/lib/auth";
import { formatPrice } from "@/lib/games";
import Stickman from "./Stickman";

const ratingClass = (rating: Game["rating"]) =>
  rating === "E" ? "bg-emerald-600" : rating === "A" ? "bg-yellow-600" : "bg-red-600";

const ratingLabel = (rating: Game["rating"]) =>
  rating === "E" ? "E · Everyone" : rating === "A" ? "A · Action" : "18+ · Gore";

export default async function GameCard({ game }: { game: Game }) {
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

  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-3xl bg-panel ring-1 ring-white/10 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_60px_rgba(0,0,0,.6)]">
      <div className="relative aspect-[3/4] bg-black">
        <Image
          src={`/images/${game.image}`}
          alt={`${game.title} key art`}
          fill
          sizes="(max-width: 768px) 100vw, 300px"
          className="object-contain transition-transform duration-700 group-hover:scale-105"
        />
        <span className={`absolute left-3 top-3 rounded-md px-2 py-1 text-[10px] font-black uppercase tracking-widest ${ratingClass(game.rating)}`}>
          {ratingLabel(game.rating)}
        </span>
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent" />
        <span className="absolute bottom-3 right-3 rounded-full bg-black/70 px-3 py-1 text-sm font-black backdrop-blur">
          {formatPrice(game.priceCents)}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center gap-2">
          <Stickman pose="run" className="h-4 w-3 text-brand-2" stroke={10} />
          <h3 className="text-[15px] font-extrabold tracking-tight">{game.title}</h3>
        </div>
        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-white/50">{game.tagline}</p>

        <div className="mt-auto pt-4">
          <GameActions
            slug={game.slug}
            price={formatPrice(game.priceCents)}
            mode={mode}
            downloadName={game.downloadName}
            username={user ? user.username : "guest"}
          />
        </div>
      </div>
    </div>
  );
}
