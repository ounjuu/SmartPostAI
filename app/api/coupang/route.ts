import { NextRequest, NextResponse } from "next/server"
import { generateCoupangThread, type CoupangTone } from "@/lib/coupang"
import type { CoupangProduct } from "@/lib/coupangFormat"
import { GenerationError } from "@/lib/gemini"
import { isOverloadedError } from "@/lib/retry"

export async function POST(request: NextRequest) {
  try {
    const { photos, memo, products, tone } = await request.json()

    const productList: CoupangProduct[] = Array.isArray(products)
      ? products
          .map((p) => ({ name: String(p?.name || ""), link: String(p?.link || "") }))
          .filter((p) => p.name.trim() || p.link.trim())
      : []

    if (!photos?.length && !memo?.trim() && !productList.length) {
      return NextResponse.json(
        { error: "사진, 메모, 제품 중 하나는 입력해주세요." },
        { status: 400 }
      )
    }

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "your_gemini_api_key_here") {
      return NextResponse.json(
        { error: "Gemini API 키가 설정되지 않았습니다. .env.local 파일을 확인해주세요." },
        { status: 500 }
      )
    }

    const targetTone: CoupangTone = tone === "polite" ? "polite" : "casual"

    const result = await generateCoupangThread(
      photos || [],
      memo || "",
      productList,
      targetTone
    )

    return NextResponse.json({ ...result, products: productList })
  } catch (error) {
    console.error("Coupang thread generation error:", error)

    if (error instanceof GenerationError) {
      return NextResponse.json({ error: error.message }, { status: 502 })
    }

    if (isOverloadedError(error)) {
      return NextResponse.json(
        { error: "Gemini 서버가 잠시 혼잡해요. 30초 후 다시 시도해주세요." },
        { status: 503 }
      )
    }

    const status = (error as { status?: number })?.status
    const rawMessage =
      error instanceof Error ? error.message : typeof error === "string" ? error : ""

    let message = "쿠팡 파트너스 글 생성 중 오류가 발생했습니다. 다시 시도해주세요."
    if (status === 400 && /API key|API_KEY/i.test(rawMessage)) {
      message = "Gemini API 키가 올바르지 않아요. .env.local의 GEMINI_API_KEY를 확인해주세요."
    } else if (status === 403) {
      message = "Gemini API 접근이 거부됐어요 (403). API 키 권한·결제 설정을 확인해주세요."
    } else if (status === 404) {
      message = "요청한 Gemini 모델을 찾을 수 없어요 (404). 모델 이름을 확인해주세요."
    } else if (rawMessage) {
      message = `쿠팡 파트너스 글 생성 중 오류가 발생했습니다: ${rawMessage}`
    }

    return NextResponse.json({ error: message }, { status: status || 500 })
  }
}
