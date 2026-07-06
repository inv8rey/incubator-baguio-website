import { NextRequest, NextResponse } from "next/server";

// The beta domain is a temporary pre-launch alias: its homepage should show
// the coming-soon landing page instead of the real site homepage, without
// affecting incubator-baguio.vercel.app or any other host.
const BETA_HOST = "beta-incubator-baguio.vercel.app";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";
  if (host === BETA_HOST && request.nextUrl.pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/coming-soon/";
    return NextResponse.rewrite(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: "/",
};
