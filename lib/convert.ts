import { GoogleGenerativeAI } from "@google/generative-ai"
import { callWithRetry } from "./retry"
import { stripMarkdown } from "./markdown"

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
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      maxOutputTokens: 8192,
    },
  })

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
- **마크다운 문법 절대 사용 금지**: \`**굵게**\`, \`### 제목\`, \`*기울임*\`, \`\\\`코드\\\`\`, \`[링크](url)\`, \`- 리스트\` 등 모든 마크다운 기호 사용 X
- 강조하고 싶어도 \`**\`나 \`##\` 없이 자연스러운 문장으로 표현
- 표 대신 "· 항목: 내용" 불릿으로 정리
- 해시태그 마지막에 추가

## 중요
- 원본 글의 핵심 내용을 빠뜨리지 마세요
- 원본에 없는 내용을 추가하지 마세요
- 구조와 흐름을 최대한 유지하면서 말투와 형식만 변환
- **본문에 따옴표 금지**: 단어나 구문을 강조하려고 작은따옴표('단어')나 큰따옴표("단어")로 감싸지 마세요. 대화 인용이 아닌 한 따옴표 일체 사용 X. 강조가 필요하면 <b>태그(네이버) 또는 자연스러운 문장 흐름(티스토리)으로 표현하세요.
- 해시태그 키워드는 띄어쓰기 없이 한 단어로 출력 (예: "강남 카페" X → "강남카페" O)
- **제목 맨 앞에 이모지/이모티콘 절대 사용 금지** (☕📍🍽️ 같은 것 X). 대신 카테고리 대괄호 태그 사용 (예: \`[강남 맛집] 파스타 맛집에서 만난 특별한 메뉴\`, \`[개발 회고록] 타로 앱 만들면서 배운 것\`)
- **소제목/섹션 헤더는 대괄호 태그 형식으로**: 이모지(📍💬🍝💡⚠️✅👉📌✨) X, 대신 \`[매장 정보]\`, \`[메뉴 후기]\`, \`[솔직 후기]\` 형식 사용. 원본에 이모지 + 소제목 형식이 있어도 변환 시 대괄호 형식으로 바꾸기
- **입력 출처를 본문에 드러내지 마세요**: "원본에 ~라고 적혀있어요", "메모에 따르면", "AI가 작성", "제공된 정보로는" 같은 메타 표현 일체 금지. 글쓴이가 직접 쓴 것처럼 자연스럽게 표현

반드시 아래 JSON 형식으로만 응답해주세요 (다른 텍스트 없이):
{
  "title": "네이버 블로그 제목",
  "content": "HTML 형식의 네이버 블로그 본문",
  "tistoryTitle": "티스토리 제목",
  "tistoryContent": "순수 텍스트 형식의 티스토리 본문 (줄바꿈은 \\n)",
  "keywords": ["키워드1", "키워드2", ...]
}`

  const result = await callWithRetry(() => model.generateContent(prompt))
  const text = result.response.text()

  const jsonMatch = text.match(/\{[\s\S]*"title"[\s\S]*"content"[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error("AI 응답을 파싱할 수 없습니다.")
  }

  const parsed = JSON.parse(jsonMatch[0])
  return {
    title: parsed.title,
    content: parsed.content,
    tistoryTitle: stripMarkdown(parsed.tistoryTitle || parsed.title),
    tistoryContent: stripMarkdown(parsed.tistoryContent || ""),
    keywords: parsed.keywords || [],
  }
}
