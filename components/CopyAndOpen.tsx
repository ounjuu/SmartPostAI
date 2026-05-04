"use client"

import { useState } from "react"
import { copyHtmlToClipboard, htmlToPlainText, openNaverBlog } from "@/lib/clipboard"

interface CopyAndOpenProps {
  naverTitle: string
  naverContent: string
  tistoryTitle: string
  tistoryContent: string
  keywords?: string[]
  disabled?: boolean
}

export default function CopyAndOpen({ naverTitle, naverContent, tistoryTitle, tistoryContent, keywords = [], disabled = false }: CopyAndOpenProps) {
  const [copiedTarget, setCopiedTarget] = useState<string | null>(null)

  const hasNaver = naverContent.length > 0
  const hasTistory = tistoryContent.length > 0
  const hasKeywords = keywords.length > 0

  const naverHtml = `<h2>${naverTitle}</h2>${naverContent}`
  const naverPlain = `${naverTitle}\n\n${htmlToPlainText(naverContent)}`

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

  const handleCopyHashtags = async () => {
    const text = keywords.map((k) => `#${k}`).join(" ")
    await navigator.clipboard.writeText(text)
    setCopiedFeedback("copyHashtags")
  }

  return (
    <div className="space-y-3">
      {hasNaver && (
        <button
          onClick={handleCopyAndOpenNaver}
          disabled={disabled}
          className="w-full py-4 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600 active:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {copiedTarget === "naver" ? "복사 완료! 네이버 블로그 열기..." : "서식 복사 → 네이버 블로그 열기"}
        </button>
      )}

      {hasTistory && (
        <button
          onClick={handleCopyAndOpenTistory}
          disabled={disabled}
          className="w-full py-4 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 active:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {copiedTarget === "tistory" ? "복사 완료! 티스토리 열기..." : "텍스트 복사 → 티스토리 열기"}
        </button>
      )}

      {(hasNaver || hasTistory) && (
        <div className="flex gap-2">
          {hasNaver && (
            <button
              onClick={handleCopyNaver}
              disabled={disabled}
              className="flex-1 py-3 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {copiedTarget === "copyNaver" ? "복사 완료!" : "네이버용 복사"}
            </button>
          )}
          {hasTistory && (
            <button
              onClick={handleCopyTistory}
              disabled={disabled}
              className="flex-1 py-3 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {copiedTarget === "copyTistory" ? "복사 완료!" : "티스토리용 복사"}
            </button>
          )}
        </div>
      )}

      {hasKeywords && (
        <button
          onClick={handleCopyHashtags}
          disabled={disabled}
          className="w-full py-3 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {copiedTarget === "copyHashtags" ? "해시태그 복사 완료!" : `해시태그 복사 (#${keywords.length}개)`}
        </button>
      )}
    </div>
  )
}
