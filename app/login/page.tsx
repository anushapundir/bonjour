import Link from "next/link";
import { Logo } from "../../components/Logo";
import { ThemeToggle } from "../../components/ThemeToggle";
import { LoginForm } from "./LoginForm";

export const metadata = { title: "Sign in" };

export default async function LoginPage(props: PageProps<"/login">) {
  const { next } = await props.searchParams;
  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      <header className="flex h-14 items-center justify-end px-4 sm:px-6">
        <ThemeToggle />
      </header>
      <main className="flex flex-1 flex-col items-center px-4 pb-16 pt-4 sm:pt-12">
        <Link href="/" aria-label="Bonjour home" className="mb-6">
          <Logo />
        </Link>
        <div className="w-full max-w-[380px] rounded-[14px] border border-line bg-surface p-6 shadow-window">
          <h1 className="text-[20px] font-medium tracking-[-0.025em] text-ink">Sign in to the demo</h1>
          <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted">A shared demo workspace with sample deals. Your approvals stay in this browser.</p>
          <LoginForm next={typeof next === "string" ? next : ""} />
        </div>
      </main>
    </div>
  );
}
