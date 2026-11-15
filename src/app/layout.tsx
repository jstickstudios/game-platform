import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "JStick Studios — Gory Stickman Games",
  description:
    "JStick Studios makes gory stickman games. Download Neon Stickman — Rooftop Parkour. 18+.",
  icons: {
    icon: [
      {
        url: "/icons/jstick-brand.svg?v=2",
        type: "image/svg+xml",
      },
    ],
  },
};

export default function RootLayout({ children }: { ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
