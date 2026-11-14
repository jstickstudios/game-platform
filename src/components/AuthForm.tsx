"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AuthForm({
  mode,
  next,
}: {
  mode: "login" | "signup";
  next?: string;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const signup = mode === "signup";

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const f = new FormData(e.currentTarget);
    const payload: Record<string, unknown> = {
      username: f.get("username"),
      password: f.get("password"),
    };
    if (signup) {
      if (f.get("password") !== f.get("password2")) {
        setError("Passwords don't match.");
        return;
      }
      payload.email = f.get("email");
      payload.agree = f.get("agree") === "on";
      payload.adult = f.get("adult") === "on";
    }
    setBusy(true);
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        setBusy(false);
        return;
      }
      router.push(next && next.startsWith("/") ? next : "/");
      router.refresh();
    } catch {
      setError("Network error. Try again.");
      setBusy(false);
    }
  }

  const q = next ? `?next=${encodeURIComponent(next)}` : "";

  return (
    <form onSubmit={submit} className="glass rise w-full max-w-md space-y-4 rounded-2xl p-7">
      <div>
        <h1 className="text-3xl font-black">{signup ? "Create account" : "Welcome back"}</h1>
        <p className="mt-1 text-sm opacity-70">
          {signup
            ? "Sign up to buy and download our gory stickman games."
            : "Log in to download your games."}
        </p>
      </div>

      <label className="block text-sm font-semibold">
        Username
        <input name="username" required autoComplete="username" className="input mt-1" />
      </label>
      {signup && (
        <label className="block text-sm font-semibold">
          Email
          <input name="email" type="email" required autoComplete="email" className="input mt-1" />
        </label>
      )}
      <label className="block text-sm font-semibold">
        Password
        <input
          name="password"
          type="password"
          required
          minLength={signup ? 8 : undefined}
          autoComplete={signup ? "new-password" : "current-password"}
          className="input mt-1"
        />
      </label>
      {signup && (
        <>
          <label className="block text-sm font-semibold">
            Repeat password
            <input name="password2" type="password" required autoComplete="new-password" className="input mt-1" />
          </label>
          <label className="flex items-start gap-3 text-sm">
            <input type="checkbox" name="adult" className="mt-1 h-4 w-4 accent-pink-500" />
            <span>I am 18 or older and I understand these games contain extreme gore.</span>
          </label>
          <label className="flex items-start gap-3 text-sm">
            <input type="checkbox" name="agree" className="mt-1 h-4 w-4 accent-pink-500" />
            <span>I accept the terms of use and privacy policy.</span>
          </label>
        </>
      )}

      {error && (
        <div role="alert" className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {error}
        </div>
      )}

      <button disabled={busy} className="btn-primary w-full rounded-xl py-3 text-base font-extrabold uppercase tracking-wider text-white">
        {busy ? "Please wait…" : signup ? "Create account" : "Log in"}
      </button>

      <p className="text-center text-sm opacity-80">
        {signup ? (
          <>
            Already have an account?{" "}
            <Link href={`/login${q}`} className="font-bold text-cyan-300 underline">
              Log in
            </Link>
          </>
        ) : (
          <>
            New here?{" "}
            <Link href={`/signup${q}`} className="font-bold text-cyan-300 underline">
              Sign up
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
