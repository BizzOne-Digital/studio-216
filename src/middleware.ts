import { NextResponse, type NextRequest } from "next/server";

/**
 * Fast edge check: bounce visitors without a session cookie away from admin pages.
 * Real session validation happens server-side in the admin layout and in every admin API route.
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    if (!req.cookies.get("s216_admin")?.value) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      url.search = `?next=${encodeURIComponent(pathname)}`;
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*"] };
