"use client"

import { useState } from "react"
import { copyHtmlToClipboard, openNaverBlog } from "@/lib/clipboard"

interface CopyAndOpenProps {
  title: string
  content: string
}

function htmlToPlainText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/?(h[1-6]|p|div|li|tr)>/gi, "\n")
    .replace(/<hr\s*\/?>/gi, "\n────────────────\n")
    .replace(/<b>(.*?)<\/b>/gi, "$1")
    .replace(/<table[\s\S]*?<\/table>/gi, (table) => {
      const rows = table.match(/<tr[\s\S]*?<\/tr>/gi) || []
      return rows
        .map((row) => {
          const cells = row.match(/<t[hd][\s\S]*?<\/t[hd]>/gi) || []
          return cells
            .map((cell) => cell.replace(/<[^>]+>/g, "").trim())
            .join(" · ")
        })
        .join("\n")
    })
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

export default function CopyAndOpen({ title, content }: CopyAndOpenProps) {
  const [copiedTarget, setCopiedTarget] = useState<string | null>(null)

  const fullHtml = `<h2>${title}</h2>${content}`
  const plainText = htmlToPlainText(content)

  const setCopiedFeedback = (target: string) => {
    setCopiedTarget(target)
    setTimeout(() => setCopiedTarget(null), 3000)
  }

  const handleCopyAndOpenNaver = async () => {
    await copyHtmlToClipboard(fullHtml, plainText)
    setCopiedFeedback("naver")
    setTimeout(() => openNaverBlog(), 500)
  }

  const handleCopyAndOpenTistory = async () => {
    await navigator.clipboard.writeText(`${title}\n\n${plainText}`)
    setCopiedFeedback("tistory")
    setTimeout(() => {
      window.open("https://www.tistory.com/auth/login?redirectUrl=https://www.tistory.com/entry/post", "_blank")
    }, 500)
  }

  const handleCopy = async () => {
    const success = await copyHtmlToClipboard(fullHtml, plainText)
    if (success) setCopiedFeedback("copy")
  }

  return (
    <div className="space-y-3">
      <button
        onClick={handleCopyAndOpenNaver}
        className="w-full py-4 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600 active:bg-green-700 transition-colors"
      >
        {copiedTarget === "naver" ? "복사 완료! 네이버 블로그 열기..." : "서식 복사 → 네이버 블로그 열기"}
      </button>

      <button
        onClick={handleCopyAndOpenTistory}
        className="w-full py-4 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 active:bg-orange-700 transition-colors"
      >
        {copiedTarget === "tistory" ? "복사 완료! ��스토리 열기..." : "텍스트 복사 → ���스토리 열기"}
      </button>

      <button
        onClick={handleCopy}
        className="w-full py-3 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
      >
        {copiedTarget === "copy" ? "복사 완료!" : "서식 포함 복사하기"}
      </button>

      <p className="text-xs text-gray-400 text-center leading-relaxed">
        네이버: 서식(굵기·줄바꿈) 유지 / 티스토리: 기본 모드 텍스트
      </p>
    </div>
  )
}
