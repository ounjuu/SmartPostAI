// 티스토리용 본문에서 마크다운 문법을 제거해 일반 텍스트로 만든다.
export function stripMarkdown(text: string): string {
  if (!text) return text
  let result = text

  // 코드 블록 ```...```
  result = result.replace(/```[\s\S]*?```/g, "")
  // 헤더 ### Title (줄 시작)
  result = result.replace(/^\s{0,3}#{1,6}\s+/gm, "")
  // 굵은 글씨 ***text***, **text**, __text__
  result = result.replace(/\*\*\*([^*\n]+?)\*\*\*/g, "$1")
  result = result.replace(/\*\*([^*\n]+?)\*\*/g, "$1")
  result = result.replace(/__([^_\n]+?)__/g, "$1")
  // 기울임 *text*, _text_
  result = result.replace(/(?<!\*)\*([^*\n]+?)\*(?!\*)/g, "$1")
  result = result.replace(/(?<![A-Za-z0-9_])_([^_\n]+?)_(?![A-Za-z0-9_])/g, "$1")
  // 취소선 ~~text~~
  result = result.replace(/~~([^~\n]+?)~~/g, "$1")
  // 인라인 코드 `text`
  result = result.replace(/`([^`\n]+?)`/g, "$1")
  // 이미지 ![alt](url)
  result = result.replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
  // 링크 [text](url)
  result = result.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
  // 인용문 > text
  result = result.replace(/^\s{0,3}>\s?/gm, "")
  // 가로선 ---, ***, ___
  result = result.replace(/^\s{0,3}[-*_]{3,}\s*$/gm, "")
  // 리스트 마커 - / * → · 로 변환
  result = result.replace(/^(\s*)[-*+]\s+/gm, "$1· ")

  return result
}
