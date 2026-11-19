import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

const siteUrl = "https://jstickstudios.com";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#080a12",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "JStick Studios — Independent Games. Big Energy.",
    template: "%s | JStick Studios",
  },
  description:
    "Discover original indie games from JStick Studios. Explore action, racing, parkour and more — find your next favourite game.",
  applicationName: "JStick Studios",
  category: "games",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "JStick Studios",
    title: "JStick Studios — Independent Games. Big Energy.",
    description:
      "Original games. Big ideas. Discover the latest releases from JStick Studios.",
    images: [
      {
        url: "/images/neon-stickman-poster.jpg",
        width: 1200,
        height: 630,
        alt: "JStick Studios game artwork",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "JStick Studios — Independent Games. Big Energy.",
    description:
      "Original games. Big ideas. Discover the latest releases from JStick Studios.",
    images: ["/images/neon-stickman-poster.jpg"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "JStick Studios",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [{ url: "/icons/jstick-brand.svg?v=2", type: "image/svg+xml" }],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "JStick Studios",
    url: siteUrl,
    logo: `${siteUrl}/icons/jstick-brand.svg`,
    description:
      "Independent game studio creating original action, racing and adventure games.",
  };
  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "JStick Studios",
    url: siteUrl,
  };

  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }}
        />
        {children}
      </body>
    </html>
  );
}
