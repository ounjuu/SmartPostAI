import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai"
import { callWithRetry } from "./retry"
import { GenerationError } from "./gemini"
import type { CoupangResult, CoupangProduct } from "./coupangFormat"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

export type CoupangTone = "casual" | "polite"

const TONE_RULES: Record<CoupangTone, string> = {
  casual: `반말 + 진짜 사람 말투로 써주세요 (예: "~줘", "~먹어!!!", "존맛", "살안쪄", "ㄷㄷ", "ㅠㅠ", ";;").
과장된 감정 표현 OK ("와...나 진짜 사랑한다ㅠㅠㅠ", "개고생했는데"). 광고티 나는 정중한 말투 금지.`,
  polite: `친근한 존댓말로 써주세요 (~했어요, ~거든요, ~더라고요). 너무 딱딱하지 않게, 공감되는 톤 유지.`,
}

export async function generateCoupangThread(
  photos: string[],
  memo: string,
  products: CoupangProduct[],
  tone: CoupangTone = "casual"
): Promise<CoupangResult> {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      maxOutputTokens: 8192,
      // thinking이 출력 토큰 예산을 잠식해 중첩 스키마 본문이 비는 문제 방지
      // (SDK 타입에 thinkingConfig가 없어 스프레드로 주입 — 런타임에는 전달됨)
      ...({ thinkingConfig: { thinkingBudget: 0 } } as Record<string, unknown>),
      responseMimeType: "application/json",
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          hookPost: { type: SchemaType.STRING },
          bodyIntro: { type: SchemaType.STRING },
          prepLabel: { type: SchemaType.STRING },
          prepItems: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
          productPitches: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                headline: { type: SchemaType.STRING },
                reason: { type: SchemaType.STRING },
              },
              required: ["headline", "reason"],
            },
          },
          stepsLabel: { type: SchemaType.STRING },
          steps: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
          hashtags: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        },
        required: ["hookPost", "bodyIntro", "productPitches", "hashtags"],
      },
    },
  })

  const productList = products.length
    ? products.map((p, i) => `${i + 1}. ${p.name || "(이름 미입력)"}`).join("\n")
    : "(입력된 제품 없음)"

  const prompt = `당신은 쓰레드(Threads)에서 바이럴 나는 쿠팡 파트너스 글을 쓰는 인플루언서입니다.
사용자가 제공한 사진/메모/제품을 바탕으로 **쓰레드용 쿠팡 파트너스 연쇄 글(스레드)**을 작성해주세요.

## 글의 구조 (이 구조가 핵심)
1. **훅 게시물(hookPost)**: 첫 게시물. **제품·광고 언급 절대 금지.** 순수하게 본인 경험·감정만 강하게 터뜨려서 공감과 궁금증 유발.
   - 예시 톤: "와...나 진짜 OO 사랑한다ㅠㅠㅠ / 아이스크림 못 끊어서 개고생했는데 이거 먹고 끊었음 ㄷㄷ / 오설록 말차 저리가라야 존맛임;;"
   - 결과/변화/감정 위주 (왜 좋았는지 결과부터). 사진 내용과 자연스럽게 연결.
2. **본론(bodyIntro + 준비물 + 제품추천 + 레시피)**: 두 번째 게시물부터. 정보를 알차게.
   - bodyIntro: 본론 시작 한 줄 (예: "피티쌤이 알려줬으니까 죄책감 따윈 없다 맘껏먹어!!!"). **"[광고]" 표기는 시스템이 자동으로 붙이니 넣지 마세요.**
   - prepLabel/prepItems: 준비물이나 핵심 포인트 (예: 라벨 "🛒 준비물", 항목 "다크 초콜릿 50g (75퍼 넘는걸로 먹어야 살안쪄)"). 레시피가 아니면 "✅ 체크포인트" 등으로.
   - productPitches: **입력된 제품 순서와 1:1로** 각 제품 추천. headline은 "내가 사용한 OO은 이거!" 같은 한 줄, reason은 왜 이걸 골랐는지 솔직한 이유. **링크는 절대 쓰지 마세요(시스템이 자동 삽입).**
   - stepsLabel/steps: 레시피나 사용법 단계 (예: 라벨 "👨‍🍳 레시피", 단계 "짤주머니에 녹인 다크 초콜릿을 넣고 냉동실 10분간 얼려줘"). 번호는 시스템이 붙이니 넣지 마세요.

## 말투
${TONE_RULES[tone]}

## 중요 규칙
- **링크·URL 직접 쓰지 않기** (지어내기 금지, 시스템이 실제 링크 삽입)
- **"[광고]" 표기와 대가성 고지 문구는 직접 쓰지 않기** (시스템이 자동 처리)
- 제품을 직접 써본 것처럼 자연스럽게, 광고 같은 과장 자제하되 진정성 있게
- 이모지는 적당히 (🛒👇👨‍🍳 등 구조용 위주), 남발 금지
- hashtags: 쓰레드용 해시태그 5~10개 (띄어쓰기 없이)

## 입력 제품 목록 (productPitches를 이 순서·개수에 맞춰 작성)
${productList}

사용자 메모: ${memo || "(메모 없음 - 사진을 보고 적절히 작성해주세요)"}
사진 수: ${photos.length}장`

  const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [
    { text: prompt },
  ]

  for (const photo of photos) {
    const match = photo.match(/^data:(image\/\w+);base64,(.+)$/)
    if (match) {
      parts.push({ inlineData: { mimeType: match[1], data: match[2] } })
    }
  }

  const result = await callWithRetry(() => model.generateContent(parts))
  const response = result.response

  const blockReason = response.promptFeedback?.blockReason
  if (blockReason) {
    throw new GenerationError(
      `Gemini가 입력을 안전성 정책으로 차단했어요 (사유: ${blockReason}). 사진이나 메모 내용을 바꿔서 다시 시도해주세요.`
    )
  }

  const finishReason = response.candidates?.[0]?.finishReason
  if (finishReason && finishReason !== "STOP") {
    const reasonMap: Record<string, string> = {
      SAFETY: "Gemini가 생성 결과를 안전성 정책으로 차단했어요. 사진이나 메모 내용을 바꿔서 다시 시도해주세요.",
      MAX_TOKENS: "생성된 글이 너무 길어 중간에 잘렸어요. 메모를 줄이거나 사진 수를 줄여서 다시 시도해주세요.",
      RECITATION: "Gemini가 저작권 보호 정책으로 응답을 중단했어요. 메모 내용을 바꿔서 다시 시도해주세요.",
    }
    throw new GenerationError(
      reasonMap[finishReason] || `Gemini 응답이 비정상 종료됐어요 (사유: ${finishReason}). 다시 시도해주세요.`
    )
  }

  let text: string
  try {
    text = response.text()
  } catch {
    throw new GenerationError("Gemini가 빈 응답을 반환했어요. 잠시 후 다시 시도해주세요.")
  }

  if (!text?.trim()) {
    throw new GenerationError("Gemini가 빈 응답을 반환했어요. 잠시 후 다시 시도해주세요.")
  }

  let parsed: Partial<CoupangResult>
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new GenerationError("Gemini 응답을 JSON으로 해석하지 못했어요. 다시 시도해주세요.")
  }

  return {
    hookPost: parsed.hookPost || "",
    bodyIntro: parsed.bodyIntro || "",
    prepLabel: parsed.prepLabel || "",
    prepItems: Array.isArray(parsed.prepItems) ? parsed.prepItems : [],
    productPitches: Array.isArray(parsed.productPitches) ? parsed.productPitches : [],
    stepsLabel: parsed.stepsLabel || "",
    steps: Array.isArray(parsed.steps) ? parsed.steps : [],
    hashtags: Array.isArray(parsed.hashtags) ? parsed.hashtags : [],
  }
}
