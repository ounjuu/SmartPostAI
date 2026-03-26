import { GoogleGenerativeAI } from "@google/generative-ai"
import { STYLE_PRESETS } from "./styles"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

export async function generateBlogPost(
  photos: string[],
  memo: string,
  styleId?: string,
  customSamples?: string[]
): Promise<{ title: string; content: string }> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

  // 스타일별 프롬프트 구성
  let styleInstruction = ""
  let exampleSection = ""

  if (styleId?.startsWith("custom:") && customSamples?.length) {
    // 사용자 커스텀 스타일
    styleInstruction = `아래 제공된 "참고 글"의 말투, 문장 구조, 분위기, 이모지 사용 패턴을 분석하고 최대한 비슷한 스타일로 작성해주세요.`
    exampleSection = customSamples
      .map((s, i) => `[참고 글 ${i + 1}]\n${s}`)
      .join("\n\n")
  } else {
    // 프리셋 스타일
    const preset = STYLE_PRESETS.find((p) => p.id === styleId) || STYLE_PRESETS[0]
    styleInstruction = preset.promptInstruction
    exampleSection = `[예시 글]\n${preset.examplePost}`
  }

  const prompt = `당신은 네이버 블로그 작성 전문가입니다.
사용자가 제공한 사진과 메모를 바탕으로 블로그 글을 작성해주세요.

## 글 스타일
${styleInstruction}

## 참고할 예시
${exampleSection}

## 공통 규칙
- 제목은 호기심을 끄는 스타일로 작성
- 사진이 있다면 각 사진에 대한 자연스러운 설명을 포함
- 네이버 블로그에 맞는 HTML 서식 사용 (줄바꿈은 <br>, 굵은 글씨는 <b>, 구분선은 <hr>)
- 문단 사이에 적절한 줄바꿈을 넣어 가독성 높이기
- 해시태그를 글 마지막에 5~10개 추가
- 예시 글은 스타일 참고용이며, 내용을 그대로 복사하지 마세요

반드시 아래 JSON 형식으로만 응답해주세요 (다른 텍스트 없이):
{
  "title": "블로그 제목",
  "content": "HTML 형식의 블로그 본문"
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
  const response = result.response
  const text = response.text()

  const jsonMatch = text.match(/\{[\s\S]*"title"[\s\S]*"content"[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error("AI 응답을 파싱할 수 없습니다.")
  }

  return JSON.parse(jsonMatch[0])
}
