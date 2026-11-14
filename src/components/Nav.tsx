import Link from "next/link";
import { getUser } from "@/lib/auth";
import LogoutButton from "./LogoutButton";

export default async function Nav() {
  const user = await getUser();
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#05050f]/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
        <Link href="/" className="flex items-center gap-2 font-black tracking-tight">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-cyan-400 to-pink-500 text-lg text-black">
            J
          </span>
          <span className="text-lg">
            JStick <span className="blood-text">Studios</span>
          </span>
        </Link>
        <nav className="flex items-center gap-2 text-sm font-semibold">
          <Link href="/#games" className="hidden px-3 py-2 opacity-80 hover:opacity-100 sm:block">
            Games
          </Link>
          <Link href="/#how" className="hidden px-3 py-2 opacity-80 hover:opacity-100 sm:block">
            How to play
          </Link>
          {user ? (
            <>
              <span className="hidden items-center gap-2 rounded-full border border-white/15 px-3 py-1.5 sm:flex">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                {user.username}
                {user.isFounder && (
                  <span className="rounded bg-pink-500/20 px-1.5 text-[10px] font-black uppercase tracking-wider text-pink-300">
                    Founder
                  </span>
                )}
              </span>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="btn-ghost rounded-lg px-4 py-2">
                Log in
              </Link>
              <Link href="/signup" className="btn-primary rounded-lg px-4 py-2 font-bold text-white">
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
