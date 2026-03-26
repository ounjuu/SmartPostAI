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
