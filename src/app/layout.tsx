import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "JStick Studios — Gory Stickman Games",
  description:
    "JStick Studios makes gory stickman games. Download Neon Stickman — Rooftop Parkour. 18+.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
