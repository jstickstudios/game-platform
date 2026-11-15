import Link from "next/link";
import { getUser } from "@/lib/auth";
import LogoutButton from "./LogoutButton";
import Stickman from "./Stickman";

export default async function Nav() {
  const user = await getUser();
  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-ink/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-4 py-3 sm:px-6 lg:px-10">
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-brand to-brand-2 transition-transform duration-300 group-hover:rotate-[-6deg]">
            <Stickman pose="run" className="h-6 w-5 text-white" stroke={9} />
          </span>
          <span className="text-lg font-black tracking-[0.14em]">
            JStick <span className="text-brand-2">Studios</span>
          </span>
        </Link>
        <nav className="flex items-center gap-2 text-sm font-semibold">
          <Link href="/#games" className="hidden rounded-full px-3 py-2 text-white/70 transition-colors hover:text-white sm:block">
            Games
          </Link>
          <Link href="/#how" className="hidden rounded-full px-3 py-2 text-white/70 transition-colors hover:text-white sm:block">
            How to play
          </Link>
          {user ? (
            <>
              <span className="hidden items-center gap-2 rounded-full bg-white/[0.07] px-3.5 py-2 sm:flex">
                <span className="h-2 w-2 rounded-full bg-emerald-400" style={{ animation: "ping-ring 2s ease-out infinite" }} />
                {user.username}
                {user.isFounder && (
                  <span className="rounded bg-brand-2/20 px-1.5 text-[10px] font-black uppercase tracking-wider text-brand-2">Founder</span>
                )}
              </span>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="rounded-full bg-white/[0.07] px-4 py-2 text-white/75 transition-all hover:bg-white/15 hover:text-white">
                Log in
  </Link>
              <Link href="/signup" className="btn-shine rounded-full bg-white px-4 py-2 font-extrabold text-black transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(38,187,255,.4)]">
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
