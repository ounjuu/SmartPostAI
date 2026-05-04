import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai"
import { STYLE_PRESETS } from "./styles"
import { callWithRetry } from "./retry"
import { stripMarkdown } from "./markdown"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

export type Platform = "naver" | "tistory"

export interface BlogResult {
  title: string
  content: string
  keywords: string[]
}

const NAVER_PLATFORM_RULES = `
## 네이버 블로그용 형식
- HTML 서식 사용 (줄바꿈은 <br>, 굵은 글씨는 <b>, 구분선은 <hr>)
- 표는 HTML <table border="1" style="border-collapse:collapse"> 사용
- 코드는 <pre><code> 태그`

const TISTORY_PLATFORM_RULES = `
## 티스토리용 톤·형식 (위 스타일 가이드의 한톨 톤 규칙은 무시하고 다음 규칙으로 작성)
- ~합니다, ~입니다 정중한 톤 (개발 블로그 느낌)
- 이모지 최소화 (소제목에만 간결하게)
- "안녕하세요 한톨입니다 😊" 시작 X → 바로 본론으로
- "오늘도 한 톨, 저장 완료입니다 🌾" 시그니처 X
- 정보 전달 위주, 구조적으로 정리
- HTML 태그 없이 순수 텍스트 (줄바꿈만 \\n 사용)
- **마크다운 문법 절대 사용 금지**: \`**굵게**\`, \`### 제목\`, \`*기울임*\`, \`\\\`코드\\\`\`, \`[링크](url)\`, \`- 리스트\` 등 모든 마크다운 기호 사용 X
- 강조하고 싶어도 \`**\`나 \`##\` 없이 자연스러운 문장으로 표현
- 표 대신 "항목: 내용" 또는 "· 항목" 불릿으로 정리
- 해시태그는 #태그 형태로 마지막에`

export async function generateBlogPost(
  photos: string[],
  memo: string,
  styleId: string | undefined,
  customSamples: string[] | undefined,
  platform: Platform
): Promise<BlogResult> {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      maxOutputTokens: 8192,
      responseMimeType: "application/json",
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          title: { type: SchemaType.STRING },
          content: { type: SchemaType.STRING },
          keywords: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING },
          },
        },
        required: ["title", "content", "keywords"],
      },
    },
  })

  let styleInstruction = ""
  let exampleSection = ""

  if (styleId?.startsWith("custom:") && customSamples?.length) {
    styleInstruction = `아래 제공된 "참고 글"의 말투, 문장 구조, 분위기, 이모지 사용 패턴을 분석하고 최대한 비슷한 스타일로 작성해주세요.`
    exampleSection = customSamples
      .map((s, i) => `[참고 글 ${i + 1}]\n${s}`)
      .join("\n\n")
  } else {
    const preset = STYLE_PRESETS.find((p) => p.id === styleId) || STYLE_PRESETS[0]
    styleInstruction = preset.promptInstruction
    exampleSection = `[예시 글]\n${preset.examplePost}`
  }

  const platformRules = platform === "naver" ? NAVER_PLATFORM_RULES : TISTORY_PLATFORM_RULES

  const prompt = `당신은 블로그 작성 전문가입니다.
사용자가 제공한 사진과 메모를 바탕으로 ${platform === "naver" ? "**네이버 블로그용**" : "**티스토리용**"} 글을 작성해주세요.

${platform === "naver"
  ? `**가장 중요한 원칙: 아래 "스타일"에 정의된 한톨 말투(친근한 ~했어요/~인 것 같아요 톤, 한톨 시그니처 인사·마무리, 자연스러운 이모지 사용)를 100% 유지하세요. 정보 전달 위주의 딱딱한 톤(~합니다/~입니다)으로 빠지지 마세요.**`
  : ""}

## ${platform === "naver" ? "네이버 블로그용 스타일 (한톨 톤)" : "스타일"}
${styleInstruction}

## 참고할 예시
${exampleSection}
${platformRules}

## 제목 규칙
- 호기심을 끄는 스타일로 작성하되, 다른 네이버 블로그 글과 겹치지 않게 차별화
- 사용자 메모/사진의 구체적인 디테일을 제목에 1개 이상 포함 (특정 메뉴명, 동네 이름, 시간대, 분위기 키워드, 가격대, 특이점 등)
- 다음 표현은 가급적 피하기 (꼭 필요한 맥락이면 1개까지는 OK): "신상 ○○", "○○의 모든 것", "솔직 후기", "내돈내산", "찐 후기", "여기 어때요?", "가성비 갑", "안 가면 후회", "○○ 핫플", "○○ 성지"
- 단순한 카테고리 + 일반명사 조합("[카페] 강남 카페 후기")은 피하고, 그 글만의 고유한 포인트가 드러나게
- 제목 길이는 25~40자, "최고/인생/대박" 같은 자극적 광고 표현 남발 자제

## 공통 규칙
- 사진이 있다면 각 사진에 대한 자연스러운 설명을 포함
- 해시태그를 글 마지막에 5~10개 추가
- 예시 글은 스타일 참고용이며, 내용을 그대로 복사하지 마세요

## SEO 키워드
- 네이버 검색 상위 노출에 유리한 키워드를 10~15개 추천
- 키워드는 제목과 본문에 자연스럽게 포함되어야 합니다

JSON 형식으로 응답하세요:
{
  "title": "블로그 제목",
  "content": "${platform === "naver" ? "HTML 형식의 본문" : "순수 텍스트 본문 (줄바꿈은 \\n)"}",
  "keywords": ["키워드1", "키워드2", ...]
}

사용자 메모: ${memo || "(메모 없음 - 사진을 보고 적절한 글을 작성해주세요)"}
사진 수: ${photos.length}장`

  const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [
    { text: prompt },
  ]

  for (const photo of photos) {
    const match = photo.match(/^data:(image\/\w+);base64,(.+)$/)
    if (match) {
      parts.push({
        inlineData: {
          mimeType: match[1],
          data: match[2],
        },
      })
    }
  }

  const result = await callWithRetry(() => model.generateContent(parts))
  const text = result.response.text()

  const parsed = JSON.parse(text)

  const title = parsed.title || ""
  const content = parsed.content || ""
  const keywords: string[] = parsed.keywords || []

  return {
    title: platform === "tistory" ? stripMarkdown(title) : title,
    content: platform === "tistory" ? stripMarkdown(content) : content,
    keywords,
  }
}
