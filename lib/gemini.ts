import { GoogleGenerativeAI } from "@google/generative-ai"
import { STYLE_PRESETS } from "./styles"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

interface BlogResult {
  title: string
  content: string
  tistoryTitle: string
  tistoryContent: string
  keywords: string[]
}

export async function generateBlogPost(
  photos: string[],
  memo: string,
  styleId?: string,
  customSamples?: string[]
): Promise<BlogResult> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

  // 스타일별 프롬프트 구성
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

  const prompt = `당신은 블로그 작성 전문가입니다.
사용자가 제공한 사진과 메모를 바탕으로 **네이버 블로그용**과 **티스토리용** 2가지 버전의 글을 동시에 작성해주세요.

## 네이버 블로그용 스타일
${styleInstruction}

## 참고할 예시 (네이버용)
${exampleSection}

## 티스토리용 스타일
네이버 버전과 같은 내용이지만 말투와 형식을 다르게 작성해주세요:
- ~합니다, ~입니다 정중한 톤 (개발 블로그 느낌)
- 이모지 최소화 (소제목에만 간결하게)
- "안녕하세요 한톨입니다 😊" 시작 X → 바로 본론으로
- "오늘도 한 톨, 저장 완료입니다 🌾" 시그니처 X
- 정보 전달 위주, 구조적으로 정리
- HTML 태그 없이 순수 텍스트 (줄바꿈만 \\n 사용)
- 표 대신 "항목: 내용" 또는 "· 항목" 불릿으로 정리
- 해시태그는 #태그 형태로 마지막에

## 공통 규칙
- 제목은 호기심을 끄는 스타일로 작성
- 사진이 있다면 각 사진에 대한 자연스러운 설명을 포함
- 네이버용: HTML 서식 사용 (줄바꿈은 <br>, 굵은 글씨는 <b>, 구분선은 <hr>)
- 티스토리용: HTML 태그 없이 순수 텍스트
- 해시태그를 글 마지막에 5~10개 추가
- 예시 글은 스타일 참고용이며, 내용을 그대로 복사하지 마세요

## SEO 키워드
- 네이버 검색 상위 노출에 유리한 키워드를 10~15개 추천해주세요
- 키워드는 제목과 본문에 자연스럽게 포함되어야 합니다

반드시 아래 JSON 형식으로만 응답해주세요 (다른 텍스트 없이):
{
  "title": "네이버 블로그 제목",
  "content": "HTML 형식의 네이버 블로그 본문",
  "tistoryTitle": "티스토리 제목",
  "tistoryContent": "순수 텍스트 형식의 티스토리 본문 (줄바꿈은 \\n)",
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

  const result = await model.generateContent(parts)
  const text = result.response.text()

  const jsonMatch = text.match(/\{[\s\S]*"title"[\s\S]*"content"[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error("AI 응답을 파싱할 수 없습니다.")
  }

  const parsed = JSON.parse(jsonMatch[0])
  return {
    title: parsed.title,
    content: parsed.content,
    tistoryTitle: parsed.tistoryTitle || parsed.title,
    tistoryContent: parsed.tistoryContent || "",
    keywords: parsed.keywords || [],
  }
}
