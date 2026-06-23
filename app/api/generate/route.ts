import { NextRequest, NextResponse } from "next/server"
import { generateBlogPost, GenerationError, type Platform } from "@/lib/gemini"
import { isOverloadedError } from "@/lib/retry"

export async function POST(request: NextRequest) {
  try {
    const { photos, memo, styleId, customSamples, platform } = await request.json()

    if (!photos?.length && !memo?.trim()) {
      return NextResponse.json(
        { error: "사진 또는 메모를 입력해주세요." },
        { status: 400 }
      )
    }

    const targetPlatform: Platform = platform === "tistory" ? "tistory" : "naver"

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
      customSamples,
      targetPlatform
    )

    return NextResponse.json({ ...result, platform: targetPlatform })
  } catch (error) {
    console.error("Blog generation error:", error)

    // 원인이 명확한 생성 실패는 메시지를 그대로 전달
    if (error instanceof GenerationError) {
      return NextResponse.json({ error: error.message }, { status: 502 })
    }

    if (isOverloadedError(error)) {
      return NextResponse.json(
        { error: "Gemini 서버가 잠시 혼잡해요. 30초 후 다시 시도해주세요." },
        { status: 503 }
      )
    }

    // Gemini SDK가 던지는 오류의 상태 코드·메시지를 최대한 노출
    const status = (error as { status?: number })?.status
    const rawMessage =
      error instanceof Error ? error.message : typeof error === "string" ? error : ""

    let message = "블로그 글 생성 중 오류가 발생했습니다. 다시 시도해주세요."
    if (status === 400 && /API key|API_KEY/i.test(rawMessage)) {
      message = "Gemini API 키가 올바르지 않아요. .env.local의 GEMINI_API_KEY를 확인해주세요."
    } else if (status === 403) {
      message = "Gemini API 접근이 거부됐어요 (403). API 키 권한·결제 설정을 확인해주세요."
    } else if (status === 404) {
      message = "요청한 Gemini 모델을 찾을 수 없어요 (404). 모델 이름을 확인해주세요."
    } else if (rawMessage) {
      // 그 외에는 원본 오류 메시지를 덧붙여 원인 파악을 돕는다
      message = `블로그 글 생성 중 오류가 발생했습니다: ${rawMessage}`
    }

    return NextResponse.json({ error: message }, { status: status || 500 })
  }
}
