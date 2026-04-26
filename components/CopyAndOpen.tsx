"use client"

import { useState } from "react"
import { copyHtmlToClipboard, openNaverBlog } from "@/lib/clipboard"

interface CopyAndOpenProps {
  title: string
  content: string
  tistoryTitle: string
  tistoryContent: string
  disabled?: boolean
}

export default function CopyAndOpen({ title, content, tistoryTitle, tistoryContent, disabled = false }: CopyAndOpenProps) {
  const [copiedTarget, setCopiedTarget] = useState<string | null>(null)

  const naverHtml = `<h2>${title}</h2>${content}`
  const naverPlain = `${title}\n\n${content.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ")}`

  const setCopiedFeedback = (target: string) => {
    setCopiedTarget(target)
    setTimeout(() => setCopiedTarget(null), 3000)
  }

  const handleCopyAndOpenNaver = async () => {
    await copyHtmlToClipboard(naverHtml, naverPlain)
    setCopiedFeedback("naver")
    setTimeout(() => openNaverBlog(), 500)
  }

  const handleCopyAndOpenTistory = async () => {
    await navigator.clipboard.writeText(`${tistoryTitle}\n\n${tistoryContent}`)
    setCopiedFeedback("tistory")
    setTimeout(() => {
      window.open("https://www.tistory.com/auth/login?redirectUrl=https://www.tistory.com/entry/post", "_blank")
    }, 500)
  }

  const handleCopyNaver = async () => {
    const success = await copyHtmlToClipboard(naverHtml, naverPlain)
    if (success) setCopiedFeedback("copyNaver")
  }

  const handleCopyTistory = async () => {
    await navigator.clipboard.writeText(`${tistoryTitle}\n\n${tistoryContent}`)
    setCopiedFeedback("copyTistory")
  }

  return (
    <div className="space-y-3">
      <button
        onClick={handleCopyAndOpenNaver}
        disabled={disabled}
        className="w-full py-4 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600 active:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {copiedTarget === "naver" ? "복사 완료! 네이버 블로그 열기..." : "서식 복사 → 네이버 블로그 열기"}
      </button>

      <button
        onClick={handleCopyAndOpenTistory}
        disabled={disabled}
        className="w-full py-4 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 active:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {copiedTarget === "tistory" ? "복사 완료! 티스토리 열기..." : "텍스트 복사 → 티스토리 열기"}
      </button>

      <div className="flex gap-2">
        <button
          onClick={handleCopyNaver}
          disabled={disabled}
          className="flex-1 py-3 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {copiedTarget === "copyNaver" ? "복사 완료!" : "네이버용 복사"}
        </button>
        <button
          onClick={handleCopyTistory}
          disabled={disabled}
          className="flex-1 py-3 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {copiedTarget === "copyTistory" ? "복사 완료!" : "티스토리용 복사"}
        </button>
      </div>

      <p className="text-xs text-gray-400 text-center leading-relaxed">
        네이버: 친근한 톤 + HTML 서식 / 티스토리: 정보 전달 톤 + 텍스트
      </p>
    </div>
  )
}
