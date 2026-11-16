"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CheckoutForm({
  slug,
  price,
  live,
}: {
  slug: string;
  price: string;
  live: boolean;
}) {
  const router = useRouter();
  const [agree, setAgree] = useState(false);
  const [terms, setTerms] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function pay() {
    setError("");
    if (!agree || !terms) {
      setError("Please approve both agreements to continue.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, agree: true }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Payment could not be started.");
        setBusy(false);
        return;
      }
      if (data.url) {
        window.location.href = data.url; // Stripe-hosted page: card / bank / iDEAL
        return;
      }
      router.push(`/store?payment=success&game=${slug}`);
      router.refresh();
    } catch {
      setError("Network error. Try again.");
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <label className="flex items-start gap-3 text-sm">
        <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-1 h-4 w-4 accent-pink-500" />
        <span>I approve the purchase of this digital game for <b>{price}</b>, and I understand it is non-refundable once downloaded.</span>
      </label>
      <label className="flex items-start gap-3 text-sm">
        <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} className="mt-1 h-4 w-4 accent-pink-500" />
        <span>I agree to the terms &amp; privacy policy and confirm I am 18+.</span>
      </label>

      {error && (
        <div role="alert" className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {error}
        </div>
      )}

      <button
        onClick={pay}
        disabled={busy}
        className="btn-primary w-full rounded-xl py-4 text-lg font-extrabold uppercase tracking-wider text-white"
      >
        {busy ? "Opening secure payment…" : live ? `Pay ${price} securely` : `Complete test purchase · ${price}`}
      </button>
      <p className="text-center text-xs opacity-60">
        {live
          ? "You'll be taken to a secure page to pay by card or connect your bank (e.g. iDEAL). Your card and bank details never touch our servers and are never saved by JStick Studios."
          : "Test mode: no card needed, no money is taken."}
      </p>
    </div>
  );
}
