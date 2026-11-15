"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

export default function AuthForm({
  mode,
  next,
}: {
  mode: "login" | "signup";
  next?: string;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [stage, setStage] = useState<"creds" | "code">("creds");
  const [sentToEmail, setSentToEmail] = useState("");
  const creds = useRef<{ username: string; password: string }>({
    username: "",
    password: "",
  });
  const signup = mode === "signup";

  // Login step 1: check password, then send the 6-digit email code.
  async function startChallenge(username: string, password: string) {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        setBusy(false);
        return;
      }
      creds.current = { username, password };
      setSentToEmail(typeof data.email === "string" ? data.email : "");
      setStage("code");
      setNotice(
        typeof data.devCode === "string" && data.devCode
          ? `Dev mode — your code is ${data.devCode}`
          : "We emailed you a 6-digit code. Enter it below.",
      );
      setBusy(false);
    } catch {
      setError("Network error. Try again.");
      setBusy(false);
    }
  }

  // Login step 2: verify the 6-digit code.
  async function verify(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const f = new FormData(e.currentTarget);
    const code = String(f.get("code") ?? "").trim();
    if (!/^\d{6}$/.test(code)) {
      setError("Enter the 6-digit code from your email.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/auth/login/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
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

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const f = new FormData(e.currentTarget);
    if (signup) {
      if (f.get("password") !== f.get("password2")) {
        setError("Passwords don't match.");
        return;
      }
      const payload: Record<string, unknown> = {
        username: f.get("username"),
        password: f.get("password"),
        email: f.get("email"),
        agree: f.get("agree") === "on",
        adult: f.get("adult") === "on",
      };
      setBusy(true);
      try {
        const res = await fetch("/api/auth/signup", {
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
      return;
    }
    // login mode: password first, code second
    await startChallenge(
      String(f.get("username") ?? ""),
      String(f.get("password") ?? ""),
    );
  }

  const q = next ? `?next=${encodeURIComponent(next)}` : "";

  // ---- Step 2 screen: enter the emailed code ----
  if (!signup && stage === "code") {
    return (
      <form onSubmit={verify} className="glass rise w-full max-w-md space-y-4 rounded-2xl p-7">
        <div>
          <h1 className="text-3xl font-black">Check your email 📬</h1>
          <p className="mt-1 text-sm opacity-70">
            We sent a 6-digit code to {sentToEmail || "your email"}. It expires in 10 minutes.
          </p>
        </div>

        {notice && (
          <div className="rounded-lg border border-cyan-400/40 bg-cyan-400/10 px-3 py-2 text-sm text-cyan-100">
            {notice}
          </div>
        )}

        <label className="block text-sm font-semibold">
          Login code
          <input
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]*"
            minLength={6}
            maxLength={6}
            required
            autoFocus
            placeholder="••••••"
            className="input mt-1 text-center text-2xl font-black tracking-[0.5em]"
          />
        </label>

        {error && (
          <div role="alert" className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {error}
          </div>
        )}

        <button disabled={busy} className="btn-primary w-full rounded-xl py-3 text-base font-extrabold uppercase tracking-wider text-white">
          {busy ? "Checking…" : "Log in"}
        </button>

        <div className="flex items-center justify-between text-sm">
          <button
            type="button"
            disabled={busy}
            onClick={() => startChallenge(creds.current.username, creds.current.password)}
            className="font-bold text-cyan-300 underline disabled:opacity-50"
          >
            Resend code
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              setStage("creds");
              setNotice("");
              setError("");
            }}
            className="font-bold text-cyan-300 underline disabled:opacity-50"
          >
            Use another account
          </button>
        </div>
      </form>
    );
  }

  // ---- Step 1 screen: username + password (or signup) ----
  return (
    <form onSubmit={submit} className="glass rise w-full max-w-md space-y-4 rounded-2xl p-7">
      <div>
        <h1 className="text-3xl font-black">{signup ? "Create account" : "Welcome back"}</h1>
        <p className="mt-1 text-sm opacity-70">
          {signup
            ? "Sign up to buy and download our stickman games."
            : "Log in with your password — we'll then email you a login code."}
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
            <span>I am 18 or older and I understand some games contain gore.</span>
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
        {busy ? "Please wait…" : signup ? "Create account" : "Send login code"}
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
