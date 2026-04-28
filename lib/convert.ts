import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

interface ConvertResult {
  title: string
  content: string
  tistoryTitle: string
  tistoryContent: string
  keywords: string[]
}

export async function convertBlogPost(
  originalText: string
): Promise<ConvertResult> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

  const prompt = `당신은 블로그 글 변환 전문가입니다.
아래 기존 블로그 글을 **네이버 블로그용**과 **티스토리용** 2가지 버전으로 변환해주세요.

## 원본 글
${originalText}

## 네이버 블로그용
- 원본 글의 내용과 구조를 유지하되, 네이버 블로그에 맞게 정리
- 친근한 톤 (~해요, ~거든요, ~더라고요)
- 이모지 적절히 사용
- HTML 서식 (줄바꿈은 <br>, 굵은 글씨는 <b>, 구분선은 <hr>)
- 표는 HTML <table> 사용
- 해시태그 글 마지막에 추가

## 티스토리용
- 원본 글의 내용과 구조를 유지하되, 개발 블로그 톤으로 변환
- ~합니다, ~입니다 정중한 톤
- 이모지 최소화 (소제목에만)
- HTML 태그 없이 순수 텍스트 (줄바꿈은 \\n)
- 표 대신 "· 항목: 내용" 불릿으로 정리
- 해시태그 마지막에 추가

## 중요
- 원본 글의 핵심 내용을 빠뜨리지 마세요
- 원본에 없는 내용을 추가하지 마세요
- 구조와 흐름을 최대한 유지하면서 말투와 형식만 변환

반드시 아래 JSON 형식으로만 응답해주세요 (다른 텍스트 없이):
{
  "title": "네이버 블로그 제목",
  "content": "HTML 형식의 네이버 블로그 본문",
  "tistoryTitle": "티스토리 제목",
  "tistoryContent": "순수 텍스트 형식의 티스토리 본문 (줄바꿈은 \\n)",
  "keywords": ["키워드1", "키워드2", ...]
}`

  let text: string
  try {
    const result = await model.generateContent(prompt)
    text = result.response.text()
  } catch {
    // 폴백: gemini-2.0-flash
    const fallback = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })
    const result = await fallback.generateContent(prompt)
    text = result.response.text()
  }

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
