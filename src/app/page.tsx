import Nav from "@/components/Nav";
import IntroScreen from "@/components/IntroScreen";

export default async function Home() {
  return (
    <main className="min-h-screen">
      <Nav />
      <IntroScreen />
    </main>
  );
}
