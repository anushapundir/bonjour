import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "./lib/demo";

export function proxy(request: NextRequest) {
  if (request.cookies.get(SESSION_COOKIE)?.value === "1") return NextResponse.next();
  return NextResponse.redirect(new URL("/login", request.url));
}

export const config = { matcher: ["/app", "/app/:path*"] };
