import Image from "next/image";
import Link from "next/link";
import { Logo } from "../../components/Logo";
import { ThemeToggle } from "../../components/ThemeToggle";
import sky from "../../public/images/apricot-sky.jpg";
import { LoginForm } from "./LoginForm";

export const metadata = { title: "Sign in" };

export default async function LoginPage(props: PageProps<"/login">) {
  const { next } = await props.searchParams;
  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      {/* The morning, on the left on wide screens and as a band on top on phones. */}
      <div className="relative h-44 overflow-hidden lg:sticky lg:top-0 lg:h-dvh">
        <div className="absolute inset-0">
          <Image src={sky} alt="Soft apricot and pale blue morning sky with thin clouds" fill priority placeholder="blur" sizes="(min-width: 1024px) 50vw, 100vw" className="photo-dim object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-bg/40 lg:bg-gradient-to-r lg:to-bg/10" />
        <p className="absolute bottom-5 left-5 font-serif text-[34px] italic leading-none tracking-[-0.02em] on-photo lg:bottom-10 lg:left-10 lg:text-[56px]">
          Bonjour.
        </p>
      </div>

      <div className="flex flex-col">
        <header className="flex h-16 items-center justify-between px-4 sm:px-8">
          <Link href="/" aria-label="Bonjour home">
            <Logo />
          </Link>
          <ThemeToggle />
        </header>
        <main className="flex flex-1 items-start justify-center px-4 pb-16 pt-6 lg:items-center lg:pt-0">
          <div className="w-full max-w-[400px] rounded-[24px] border border-line bg-surface p-6 shadow-float sm:p-8">
            <h1 className="font-serif text-[30px] font-normal leading-tight tracking-[-0.02em] text-ink">Sign in to the demo</h1>
            <p className="mt-2 text-sm leading-relaxed text-muted">A shared demo workspace with sample deals. Your approvals stay in this browser.</p>
            <LoginForm next={typeof next === "string" ? next : ""} />
          </div>
        </main>
      </div>
    </div>
  );
}
