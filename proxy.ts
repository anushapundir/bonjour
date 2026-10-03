import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "./lib/demo";

export function proxy(request: NextRequest) {
  if (request.cookies.get(SESSION_COOKIE)?.value === "1") return NextResponse.next();
  const login = new URL("/login", request.url);
  login.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(login);
}

export const config = { matcher: ["/app", "/app/:path*"] };
