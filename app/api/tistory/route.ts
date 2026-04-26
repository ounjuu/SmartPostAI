import { NextRequest, NextResponse } from "next/server"
import { getTistoryAuthUrl, publishToTistory } from "@/lib/tistory"

// GET: 인증 URL 반환
export async function GET() {
  try {
    const authUrl = getTistoryAuthUrl()
    return NextResponse.json({ authUrl })
  } catch (error) {
    const message = error instanceof Error ? error.message : "알 수 없는 오류"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// POST: 글 발행
export async function POST(request: NextRequest) {
  try {
    const { accessToken, title, content } = await request.json()

    if (!accessToken || !title || !content) {
      return NextResponse.json(
        { error: "accessToken, title, content는 필수입니다." },
        { status: 400 }
      )
    }

    const result = await publishToTistory(accessToken, title, content)
    return NextResponse.json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : "발행에 실패했습니다."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
