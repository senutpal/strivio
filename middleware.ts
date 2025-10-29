import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import arcjet, { createMiddleware, detectBot } from "@arcjet/next";
import { isSpoofedBot } from "@arcjet/inspect";
import { env } from "./lib/env";

const aj = arcjet({
  key: env.ARCJET_KEY!,
  rules: [
    detectBot({
      mode: "LIVE",
      allow: ["CATEGORY:SEARCH_ENGINE", "CATEGORY:MONITOR", "CATEGORY:PREVIEW"],
    }),
  ],
});

async function mainMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/health") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/public") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/robots.txt") ||
    pathname.match(/\.(png|jpg|jpeg|gif|ico|svg|css|js|map|txt)$/)
  ) {
    return NextResponse.next();
  }

  const decision = await aj.protect(request);

  if (decision.isDenied()) {
    const message = decision.reason.isBot() ? "No bots allowed" : "Forbidden";
    return NextResponse.json(
      { error: message, reason: decision.reason },
      { status: 403 }
    );
  }

  if (decision.results.some(isSpoofedBot)) {
    return NextResponse.json(
      { error: "Forbidden (spoofed bot)" },
      { status: 403 }
    );
  }

  if (pathname.startsWith("/admin")) {
    const sessionCookie = getSessionCookie(request);
    if (!sessionCookie) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export default createMiddleware(aj, mainMiddleware);

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|api/auth).*)"],
};
