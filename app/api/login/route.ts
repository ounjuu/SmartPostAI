import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const { password } = await request.json()
  const expected = process.env.SITE_PASSWORD

  if (!expected) {
    return NextResponse.json({ error: "서버 설정 오류" }, { status: 500 })
  }

  if (password !== expected) {
    return NextResponse.json({ error: "비밀번호가 틀려요" }, { status: 401 })
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.set("site_auth", "1", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30일
  })
  return response
}
