import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const PUBLIC_PATHS = ["/login"]
const PUBLIC_API = ["/api/login"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (PUBLIC_PATHS.includes(pathname) || PUBLIC_API.includes(pathname)) {
    return NextResponse.next()
  }

  const authed = request.cookies.get("site_auth")?.value === "1"
  if (authed) {
    // 요청마다 만료를 30일 뒤로 갱신 (슬라이딩 세션)
    const response = NextResponse.next()
    response.cookies.set("site_auth", "1", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    })
    return response
  }

  const loginUrl = request.nextUrl.clone()
  loginUrl.pathname = "/login"
  loginUrl.searchParams.set("from", pathname)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt).*)"],
}
