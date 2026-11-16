import Image from "next/image";
import type { Game } from "@/lib/games";
import GameActions from "@/components/GameActions";
import { hasAccess, getUser } from "@/lib/auth";
import { formatPrice } from "@/lib/games";
import Stickman from "./Stickman";

const ratingClass = (rating: Game["rating"]) =>
  rating === "E" ? "border-emerald-300/30 bg-emerald-400/15 text-emerald-200" :
  rating === "A" ? "border-sky-300/30 bg-sky-400/15 text-sky-100" :
  "border-red-300/30 bg-red-400/15 text-red-100";

const ratingLabel = (rating: Game["rating"]) =>
  rating === "E" ? "E · Everyone" : rating === "A" ? "A · Action" : "18+ · Gore";

export default async function GameCard({ game }: { game: Game }) {
  const user = await getUser();
  const owned = await hasAccess(user, game.slug);
  const mode = !user ? "guest" : user.isFounder ? "founder" :
    user.username.toLowerCase() === "friendchi" ? "friend" : owned ? "owner" : "buyer";

  return (
    <article className="store-game-card group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.09] bg-[#111722] shadow-[0_12px_38px_rgba(0,0,0,.24)] transition-all duration-500 hover:-translate-y-2 hover:border-brand-2/45 hover:shadow-[0_28px_75px_rgba(0,120,242,.17)]">
      <div className="pointer-events-none absolute inset-0 z-10 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ background: "radial-gradient(420px circle at var(--mx,50%) var(--my,50%),rgba(38,187,255,.10),transparent 58%)" }} />
      <div className="relative aspect-video overflow-hidden bg-[#080d17]">
        <Image
          src={`/images/${game.image}`}
          alt={`${game.title} key art`}
          fill
          sizes="(max-width: 768px) 100vw, 560px"
          className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.045]"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#111722] via-transparent to-black/15" />
        <span className={`absolute left-3 top-3 rounded-md border px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.17em] backdrop-blur-xl ${ratingClass(game.rating)}`}>
          {ratingLabel(game.rating)}
        </span>
        <span className="absolute right-3 top-3 rounded-md border border-white/15 bg-black/55 px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.17em] text-white/75 backdrop-blur-xl">
          <span className="jstick-desktop-action">Free download</span>
          <span className="jstick-mobile-action">Free to play</span>
        </span>
        <div className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-brand-2/70 to-transparent" />
      </div>

      <div className="relative z-20 flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="mb-1.5 flex items-center gap-2 text-[8px] font-black uppercase tracking-[0.25em] text-brand-2">
              <Stickman pose="run" className="h-4 w-3" stroke={10} />
              JStick original
            </div>
            <h3 className="text-base font-black leading-tight tracking-tight text-white">{game.title}</h3>
          </div>
          <span className="shrink-0 rounded-lg border border-white/10 bg-white/[0.045] px-2.5 py-1.5 text-xs font-black text-white">
            {formatPrice(game.priceCents)}
          </span>
        </div>
        <p className="mt-2 min-h-[40px] text-xs leading-relaxed text-white/50">{game.tagline}</p>
        <div className="mt-4 flex items-center justify-between gap-2 border-t border-white/[0.08] pt-3">
          <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-white/35">Instant access</span>
          <GameActions
            slug={game.slug}
            price={formatPrice(game.priceCents)}
            mode={mode}
            downloadName={game.downloadName}
            username={user ? user.username : "guest"}
          />
        </div>
      </div>
    </article>
  );
}
