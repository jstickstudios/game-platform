import { redirect } from "next/navigation";
import Nav from "@/components/Nav";
import AuthForm from "@/components/AuthForm";
import { getUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  if (await getUser()) redirect(next && next.startsWith("/") ? next : "/");
  return (
    <div className="grid-bg min-h-screen">
      <Nav />
      <main className="flex justify-center px-5 py-16">
        <AuthForm mode="signup" next={next} />
      </main>
    </div>
  );
}
