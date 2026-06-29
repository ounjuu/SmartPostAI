import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai"
import { callWithRetry } from "./retry"
import { GenerationError } from "./gemini"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

export type ThreadsCategory = "food" | "travel" | "workout" | "daily"

export const THREADS_CATEGORIES: { id: ThreadsCategory; name: string; emoji: string }[] = [
  { id: "food", name: "맛집", emoji: "🍴" },
  { id: "travel", name: "여행", emoji: "✈️" },
  { id: "workout", name: "운동", emoji: "💪" },
  { id: "daily", name: "일상", emoji: "🌿" },
]

export interface ThreadsVariation {
  /** 게시물 본문 (짧고 캐주얼, 끝은 댓글 유도 질문) */
  text: string
  /** 해시태그 */
  hashtags: string[]
}

export interface ThreadsPostResult {
  variations: ThreadsVariation[]
}

const CATEGORY_HINT: Record<ThreadsCategory, string> = {
  food: "맛집·카페·음식 경험",
  travel: "여행·나들이·장소",
  workout: "운동·홈트·헬스 기록",
  daily: "소소한 일상",
}

export async function generateThreadsPost(
  photos: string[],
  memo: string,
  category: ThreadsCategory = "food"
): Promise<ThreadsPostResult> {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      maxOutputTokens: 4096,
      // thinking이 출력 토큰 예산을 잠식하는 문제 방지
      ...({ thinkingConfig: { thinkingBudget: 0 } } as Record<string, unknown>),
      responseMimeType: "application/json",
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          variations: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                text: { type: SchemaType.STRING },
                hashtags: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
              },
              required: ["text", "hashtags"],
            },
          },
        },
        required: ["variations"],
      },
    },
  })

  const prompt = `당신은 쓰레드(Threads)에서 사람들이 댓글 달고 싶어지는 일상 글을 잘 쓰는 사람입니다.
사용자의 사진/메모를 바탕으로 **${CATEGORY_HINT[category]}**에 대한 **짧은 쓰레드 게시물 3가지 버전**을 만들어주세요.

## 말투·형식 (가장 중요)
- **짧고 톡톡 튀게** (2~4줄, 한 게시물 500자 이내지만 보통 훨씬 짧게)
- 친근한 반말 또는 가벼운 ~요체 (예: "맛집이 너무 많아 ㅎㅎ", "여기 가본 사람??")
- **끝은 댓글 유도 질문으로** (예: "여기 말고 또 어디 맛있어요?!", "추천해줄 사람~!?")
- ㅎㅎ, ㅜㅜ, 진짜, 너무 같은 자연스러운 구어체 OK
- 이모지는 1~2개만 (👀🙋🥹 등), 남발 금지
- **광고·홍보·제품 추천·링크 절대 금지** (순수 일상 공유 글)
- 과장된 감탄사 남발이나 블로그처럼 긴 설명 금지, SNS답게 가볍게

## 출력
- variations: 3개. 같은 내용이지만 표현·길이·훅을 다르게 (하나는 더 짧게, 하나는 질문을 앞에 두는 식)
- 각 버전 hashtags: 2~4개, 띄어쓰기 없이 (예: "수원맛집")

사용자 메모: ${memo || "(메모 없음 - 사진을 보고 자연스럽게 작성)"}
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
      MAX_TOKENS: "생성된 글이 너무 길어 중간에 잘렸어요. 메모를 줄여서 다시 시도해주세요.",
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

  let parsed: Partial<ThreadsPostResult>
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new GenerationError("Gemini 응답을 JSON으로 해석하지 못했어요. 다시 시도해주세요.")
  }

  const variations = Array.isArray(parsed.variations)
    ? parsed.variations
        .map((v) => ({
          text: v?.text || "",
          hashtags: Array.isArray(v?.hashtags) ? v.hashtags : [],
        }))
        .filter((v) => v.text.trim())
    : []

  if (!variations.length) {
    throw new GenerationError("생성된 글이 비어있어요. 다시 시도해주세요.")
  }

  return { variations }
}
