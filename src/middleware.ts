import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED = ["/admin", "/tambah"];
const ADMIN_PREFIXES = ["/admin", "/tambah", "/login", "/api/auth", "/api/admin"];

function normalizeHost(rawHost: string) {
  return rawHost.split(":")[0].toLowerCase();
}

function isLocalHost(host: string) {
  return host === "localhost" || host === "127.0.0.1";
}

function buildTargetUrl(request: NextRequest, targetHost: string) {
  const target = request.nextUrl.clone();
  target.host = targetHost;
  return target;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const requestHost = normalizeHost(request.headers.get("host") || "");

  const publicHost = (process.env.PUBLIC_HOSTNAME || "silsilahsimangunsong.site").toLowerCase();
  const adminHost = (process.env.ADMIN_HOSTNAME || `admin.${publicHost}`).toLowerCase();

  // Host-based split only on non-local environments.
  if (!isLocalHost(requestHost)) {
    const isAdminPath = ADMIN_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(prefix + "/"));

    // Public domain -> route admin/auth pages to admin subdomain.
    if (requestHost === publicHost && isAdminPath) {
      return NextResponse.redirect(buildTargetUrl(request, adminHost));
    }

    // admin.domain root -> admin dashboard.
    if (requestHost === adminHost && pathname === "/") {
      const target = buildTargetUrl(request, adminHost);
      target.pathname = "/admin";
      return NextResponse.redirect(target);
    }
  }

  const isProtected = PROTECTED.some((r) => pathname === r || pathname.startsWith(r + "/"));

  if (isProtected) {
    const token = request.cookies.get("session_token")?.value;
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/admin/:path*",
    "/tambah/:path*",
    "/login",
    "/api/auth/:path*",
    "/api/admin/:path*",
  ],
};
