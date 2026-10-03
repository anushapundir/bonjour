"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DEMO_EMAIL, DEMO_PASSWORD, SESSION_COOKIE } from "../../lib/demo";

export async function signIn(_prev: string | null, form: FormData): Promise<string | null> {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  if (email !== DEMO_EMAIL || password !== DEMO_PASSWORD) {
    return "That email and password don't match the demo account. Use the credentials shown on this page.";
  }
  (await cookies()).set(SESSION_COOKIE, "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  redirect("/app");
}

export async function signOut() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/login");
}
