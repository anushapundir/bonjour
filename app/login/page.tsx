import Link from "next/link";
import { Logo } from "../../components/Logo";
import { ThemeToggle } from "../../components/ThemeToggle";
import { LoginForm } from "./LoginForm";

export const metadata = { title: "Sign in" };

export default async function LoginPage(props: PageProps<"/login">) {
  const { next } = await props.searchParams;
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex h-16 items-center justify-between px-4 sm:px-6">
        <Link href="/" aria-label="Bonjour home">
          <Logo />
        </Link>
        <ThemeToggle />
      </header>
      <main className="flex flex-1 items-start justify-center px-4 pb-16 pt-[8vh]">
        <div className="w-full max-w-[380px]">
          <h1 className="text-2xl font-semibold tracking-tight text-ink">Sign in to the demo</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            A shared demo workspace with sample deals. Your approvals stay in this browser.
          </p>
          <LoginForm next={typeof next === "string" ? next : ""} />
        </div>
      </main>
    </div>
  );
}
