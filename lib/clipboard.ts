// 미리보기에 렌더된 모양 그대로 평문 추출
// (<br>은 한 줄, 블록/헤딩/<hr>은 두 줄 띄움, 나머지 태그 제거, HTML entity 디코드)
export function htmlToPlainText(html: string): string {
  let text = html
    .replace(/\r\n/g, "\n")
    .replace(/<br\s*\/?\s*>/gi, "\n")
    .replace(/<\/(p|div|li|h[1-6]|tr|blockquote)>/gi, "\n\n")
    .replace(/<hr\s*\/?\s*>/gi, "\n\n")
    .replace(/<[^>]*>/g, "")

  text = text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)))

  return text
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+\n/g, "\n")
    .trim()
}

export async function copyHtmlToClipboard(html: string, plainText: string): Promise<boolean> {
  try {
    const htmlBlob = new Blob([html], { type: "text/html" })
    const textBlob = new Blob([plainText], { type: "text/plain" })

    await navigator.clipboard.write([
      new ClipboardItem({
        "text/html": htmlBlob,
        "text/plain": textBlob,
      }),
    ])
    return true
  } catch {
    try {
      await navigator.clipboard.writeText(plainText)
      return true
    } catch {
      return false
    }
  }
}

export function openNaverBlog() {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

  if (isMobile) {
    const deepLink = "naverblog://post"
    const webFallback = "https://blog.naver.com"

    window.location.href = deepLink

    setTimeout(() => {
      window.location.href = webFallback
    }, 2000)
  } else {
    window.open("https://blog.naver.com", "_blank")
  }
}
