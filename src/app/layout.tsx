import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#080a12" };

export const metadata: Metadata = {
  title: "JStick Studios — Gory Stickman Games",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "JStick Studios",
  },
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

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
