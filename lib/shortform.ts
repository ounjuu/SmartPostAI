import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai"
import { callWithRetry } from "./retry"
import { GenerationError } from "./gemini"
import { getShortformStyle } from "./shortformStyles"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

export type ShortformPlatform = "shorts" | "reels" | "tiktok"

export const SHORTFORM_PLATFORMS: { id: ShortformPlatform; name: string; emoji: string }[] = [
  { id: "shorts", name: "유튜브 숏츠", emoji: "▶️" },
  { id: "reels", name: "인스타 릴스", emoji: "📸" },
  { id: "tiktok", name: "틱톡", emoji: "🎵" },
]

/** 숏폼 한 컷(장면) 구성 */
export interface ShortformScene {
  /** 화면에 띄우는 자막 (짧고 임팩트 있게) */
  caption: string
  /** 나레이션/멘트 (말로 하는 대사) */
  narration: string
  /** 장면·연출 메모 (어떤 화면을 보여줄지) */
  shot: string
}

export interface ShortformResult {
  /** 타겟 플랫폼 */
  platform: ShortformPlatform
  /** 영상 제목 (검색 노출용) */
  title: string
  /** 3초 훅 (도입부에 띄우는 한 문장) */
  hook: string
  /** 추천 영상 길이 (예: "30초") */
  duration: string
  /** 컷별 구성 */
  scenes: ShortformScene[]
  /** 유튜브 설명란 캡션 */
  caption: string
  /** 해시태그 */
  hashtags: string[]
  /** 추천 BGM 분위기 */
  bgm: string
}

const COMMON_RULES = `
## 숏폼 공통 작성 규칙
- 세로 영상(9:16)
- **3초 훅이 가장 중요**: 첫 장면에서 시청자가 스크롤을 멈추게 만드는 강한 문장 (질문형/반전형/공감형)
- 자막(caption)은 한 화면에 들어가게 매우 짧게 (10~16자 권장), 핵심 단어만
- 나레이션(narration)은 말로 하는 자연스러운 구어체 (~했어요, ~거든요, ~더라고요)
- 장면 메모(shot)는 어떤 사진/화면을 보여줄지 구체적으로 (제공된 사진 순서를 활용)
- 마지막 컷은 행동 유도나 여운으로 마무리
- BGM은 곡명이 아니라 분위기로 추천 (예: "잔잔한 어쿠스틱", "신나는 시티팝")
- 자막·나레이션에 이모지 남발 금지, 광고 같은 과장 표현 자제`

const PLATFORM_RULES: Record<ShortformPlatform, string> = {
  shorts: `## 유튜브 숏츠(YouTube Shorts) 규칙
- 길이 15~60초, 컷 4~7개 (한 컷 3~6초)
- 검색 노출이 중요하니 제목에 검색 키워드를 자연스럽게 포함
- 설명란 캡션은 2~3줄, 해시태그는 #shorts 를 반드시 포함하고 5~10개
- 정보가치/완결성 있는 구성 (끝까지 보게)`,
  reels: `## 인스타그램 릴스(Reels) 규칙
- 길이 15~30초로 짧고 임팩트 있게, 컷 4~6개 (한 컷 2~5초)
- 감각적인 비주얼·분위기 중심, 저장(북마크) 유도
- 캡션은 첫 문장이 핵심 (인스타는 첫 줄만 보임), 친근한 말투
- 해시태그는 #릴스 #reels 포함 8~15개, 트렌디한 키워드 위주`,
  tiktok: `## 틱톡(TikTok) 규칙
- 길이 15~30초, 컷 5~8개로 빠른 전개 (한 컷 2~4초)
- 트렌드·챌린지 느낌, 첫 1초부터 강하게, 댓글 유도형 마무리
- 캡션은 짧고 캐주얼하게, 해시태그는 #fyp #추천 포함 6~12개
- 빠른 리듬과 반전, 루프(다시 보게) 되는 구성 선호`,
}

export async function generateShortform(
  photos: string[],
  memo: string,
  platform: ShortformPlatform = "shorts",
  styleId?: string
): Promise<ShortformResult> {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      maxOutputTokens: 8192,
      // thinking이 출력 토큰 예산을 잠식해 중첩 스키마(scenes) 본문이 비는 문제 방지
      ...({ thinkingConfig: { thinkingBudget: 0 } } as Record<string, unknown>),
      responseMimeType: "application/json",
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          title: { type: SchemaType.STRING },
          hook: { type: SchemaType.STRING },
          duration: { type: SchemaType.STRING },
          scenes: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                caption: { type: SchemaType.STRING },
                narration: { type: SchemaType.STRING },
                shot: { type: SchemaType.STRING },
              },
              required: ["caption", "narration", "shot"],
            },
          },
          caption: { type: SchemaType.STRING },
          hashtags: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING },
          },
          bgm: { type: SchemaType.STRING },
        },
        required: ["title", "hook", "duration", "scenes", "caption", "hashtags", "bgm"],
      },
    },
  })

  const style = getShortformStyle(styleId)
  const platformLabel = SHORTFORM_PLATFORMS.find((p) => p.id === platform)?.name || "숏폼"

  const prompt = `당신은 숏폼 영상 기획 전문가입니다.
사용자가 제공한 사진과 메모를 바탕으로 **${platformLabel}용 영상 구성안**을 작성해주세요.
${COMMON_RULES}

${PLATFORM_RULES[platform]}

## 스타일 (${style.name})
${style.promptInstruction}

## 출력 형식 (JSON)
{
  "title": "영상 제목 (검색 노출 잘 되게, 25자 내외)",
  "hook": "3초 훅 문장 (스크롤 멈추게 하는 한 줄)",
  "duration": "추천 길이 (예: 30초)",
  "scenes": [
    { "caption": "화면 자막 (짧게)", "narration": "나레이션 멘트", "shot": "보여줄 화면/사진 메모" }
  ],
  "caption": "유튜브 설명란 캡션 (2~3줄)",
  "hashtags": ["shorts", "키워드1", "키워드2"],
  "bgm": "추천 BGM 분위기"
}

사용자 메모: ${memo || "(메모 없음 - 사진을 보고 적절한 숏츠를 구성해주세요)"}
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
      MAX_TOKENS: "생성된 구성안이 너무 길어 중간에 잘렸어요. 메모를 줄이거나 사진 수를 줄여서 다시 시도해주세요.",
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

  let parsed: Partial<ShortformResult>
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new GenerationError("Gemini 응답을 JSON으로 해석하지 못했어요. 다시 시도해주세요.")
  }

  return {
    platform,
    title: parsed.title || "",
    hook: parsed.hook || "",
    duration: parsed.duration || "",
    scenes: Array.isArray(parsed.scenes) ? parsed.scenes : [],
    caption: parsed.caption || "",
    hashtags: Array.isArray(parsed.hashtags) ? parsed.hashtags : [],
    bgm: parsed.bgm || "",
  }
}
