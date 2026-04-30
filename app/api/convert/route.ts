import { NextRequest, NextResponse } from "next/server"
import { convertBlogPost } from "@/lib/convert"
import { isOverloadedError } from "@/lib/retry"

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()

    if (!text?.trim()) {
      return NextResponse.json(
        { error: "변환할 글을 입력해주세요." },
        { status: 400 }
      )
    }

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "your_gemini_api_key_here") {
      return NextResponse.json(
        { error: "Gemini API 키가 설정되지 않았습니다." },
        { status: 500 }
      )
    }

    const result = await convertBlogPost(text)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Blog convert error:", error)
    if (isOverloadedError(error)) {
      return NextResponse.json(
        { error: "Gemini 서버가 잠시 혼잡해요. 30초 후 다시 시도해주세요." },
        { status: 503 }
      )
    }
    return NextResponse.json(
      { error: "글 변환 중 오류가 발생했습니다. 다시 시도해주세요." },
      { status: 500 }
    )
  }
}
