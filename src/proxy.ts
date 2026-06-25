import { NextResponse } from "next/server";
import { auth } from "@/auth";

export const proxy = auth((req) => {
  const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");
  if (isAdminRoute && req.auth?.user?.role !== "admin") {
    const loginUrl = new URL("/login", req.nextUrl);
    loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }
});

export const config = {
  matcher: ["/admin/:path*"],
};
