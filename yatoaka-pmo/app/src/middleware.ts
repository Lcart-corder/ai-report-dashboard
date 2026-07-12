import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

/**
 * ルート保護。
 * AUTH_ENABLED=true のときのみ認証を要求する（未ログインは /login へ）。
 * 既定（未設定）では認証をバイパスし、資格情報なしでも試作アプリが動作する。
 */
const AUTH_ENABLED = process.env.AUTH_ENABLED === "true";

export default async function middleware(req: NextRequest) {
  if (!AUTH_ENABLED) return NextResponse.next();

  const { pathname } = req.nextUrl;
  const isPublic =
    pathname.startsWith("/login") || pathname.startsWith("/api/auth");
  if (isPublic) return NextResponse.next();

  const session = await auth();
  if (!session) {
    const url = new URL("/login", req.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
