import { NextRequest, NextResponse } from "next/server"
import { generateBlogPost } from "@/lib/gemini"

export async function POST(request: NextRequest) {
  try {
    const { photos, memo, styleId, customSamples } = await request.json()

    if (!photos?.length && !memo?.trim()) {
      return NextResponse.json(
        { error: "사진 또는 메모를 입력해주세요." },
        { status: 400 }
      )
    }

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "your_gemini_api_key_here") {
      return NextResponse.json(
        { error: "Gemini API 키가 설정되지 않았습니다. .env.local 파일을 확인해주세요." },
        { status: 500 }
      )
    }

    const result = await generateBlogPost(
      photos || [],
      memo || "",
      styleId,
      customSamples
    )

    return NextResponse.json(result)
  } catch (error) {
    console.error("Blog generation error:", error)
    return NextResponse.json(
      { error: "블로그 글 생성 중 오류가 발생했습니다. 다시 시도해주세요." },
      { status: 500 }
    )
  }
}
