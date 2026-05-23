import { NextRequest, NextResponse } from "next/server"
import { createHash, timingSafeEqual } from "crypto"

const MAX_ATTEMPTS = 5
const WINDOW_MS = 15 * 60 * 1000 // 15분
const LOCKOUT_MS = 15 * 60 * 1000 // 15분 락
const FAIL_DELAY_MS = 800        // 실패 시 인위적 지연

type Attempt = { count: number; firstAt: number; lockedUntil: number }
const attempts = new Map<string, Attempt>()

function getClientIp(request: NextRequest): string {
  const nf = request.headers.get("x-nf-client-connection-ip")
  if (nf) return nf
  const xff = request.headers.get("x-forwarded-for")
  if (xff) return xff.split(",")[0].trim()
  return request.headers.get("x-real-ip") || "unknown"
}

function check(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now()
  const a = attempts.get(ip)
  if (!a) return { allowed: true }
  if (a.lockedUntil > now) {
    return { allowed: false, retryAfter: Math.ceil((a.lockedUntil - now) / 1000) }
  }
  if (now - a.firstAt > WINDOW_MS) {
    attempts.delete(ip)
    return { allowed: true }
  }
  return { allowed: true }
}

function recordFailure(ip: string) {
  const now = Date.now()
  const a = attempts.get(ip)
  if (!a || now - a.firstAt > WINDOW_MS) {
    attempts.set(ip, { count: 1, firstAt: now, lockedUntil: 0 })
    return
  }
  a.count += 1
  if (a.count >= MAX_ATTEMPTS) {
    a.lockedUntil = now + LOCKOUT_MS
  }
}

function safeEqual(a: string, b: string): boolean {
  const ah = createHash("sha256").update(a).digest()
  const bh = createHash("sha256").update(b).digest()
  return timingSafeEqual(ah, bh)
}

export async function POST(request: NextRequest) {
  const expected = process.env.SITE_PASSWORD
  if (!expected) {
    return NextResponse.json({ error: "서버 설정 오류" }, { status: 500 })
  }

  const ip = getClientIp(request)
  const gate = check(ip)
  if (!gate.allowed) {
    return NextResponse.json(
      { error: "시도 횟수를 초과했어요. 잠시 후 다시 시도해주세요." },
      { status: 429, headers: { "Retry-After": String(gate.retryAfter ?? 900) } }
    )
  }

  const { password } = await request.json().catch(() => ({ password: "" }))

  if (typeof password !== "string" || !safeEqual(password, expected)) {
    recordFailure(ip)
    await new Promise((r) => setTimeout(r, FAIL_DELAY_MS))
    return NextResponse.json({ error: "비밀번호가 틀려요" }, { status: 401 })
  }

  attempts.delete(ip)

  const response = NextResponse.json({ ok: true })
  response.cookies.set("site_auth", "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30일 (요청마다 슬라이딩 갱신됨)
  })
  return response
}
