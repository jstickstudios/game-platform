import type { Metadata } from "next";
import Nav from "@/components/Nav";
import ParticleField from "@/components/studio-redesign/components/ParticleField";
import OurStudio from "@/components/studio-redesign/OurStudio";
import { Footer } from "@/components/Sections";
import "@/components/studio-redesign/studio-redesign.css";

export const metadata: Metadata = {
  title: "About the Studio",
  description: "Meet JStick Studios, an independent game studio creating original games and memorable experiences.",
  alternates: { canonical: "/studio" },
};

export default function StudioPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <ParticleField />
      <div className="relative z-10">
        <Nav />
        <OurStudio />
        <Footer />
      </div>
    </main>
  );
}