"use client"

import { useState } from "react"
import { copyHtmlToClipboard, openNaverBlog } from "@/lib/clipboard"

interface CopyAndOpenProps {
  title: string
  content: string
}

export default function CopyAndOpen({ title, content }: CopyAndOpenProps) {
  const [copiedTarget, setCopiedTarget] = useState<string | null>(null)

  const fullHtml = `<h2>${title}</h2>${content}`
  const plainText = `${title}\n\n${content.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ")}`

  const handleCopy = async () => {
    const success = await copyHtmlToClipboard(fullHtml, plainText)
    if (success) {
      setCopiedTarget("copy")
      setTimeout(() => setCopiedTarget(null), 3000)
    }
  }

  const handleCopyAndOpenNaver = async () => {
    await copyHtmlToClipboard(fullHtml, plainText)
    setCopiedTarget("naver")
    setTimeout(() => {
      openNaverBlog()
    }, 500)
  }

  const handleCopyAndOpenTistory = async () => {
    await copyHtmlToClipboard(fullHtml, plainText)
    setCopiedTarget("tistory")
    setTimeout(() => {
      window.open("https://www.tistory.com/auth/login?redirectUrl=https://www.tistory.com/entry/post", "_blank")
    }, 500)
  }

  return (
    <div className="space-y-3">
      <button
        onClick={handleCopyAndOpenNaver}
        className="w-full py-4 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600 active:bg-green-700 transition-colors"
      >
        {copiedTarget === "naver" ? "복사 완료! 네이버 블로그 열기..." : "복사하고 네이버 블로그 열기"}
      </button>

      <button
        onClick={handleCopyAndOpenTistory}
        className="w-full py-4 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 active:bg-orange-700 transition-colors"
      >
        {copiedTarget === "tistory" ? "복사 완료! 티스토리 열기..." : "복사하고 티스토리 열기"}
      </button>

      <button
        onClick={handleCopy}
        className="w-full py-3 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
      >
        {copiedTarget === "copy" ? "복사 완료!" : "내용만 복사하기"}
      </button>

      <p className="text-xs text-gray-400 text-center leading-relaxed">
        복사된 내용을 블로그 글쓰기에서<br />
        붙여넣기(Ctrl+V)하면 서식이 유지돼요
      </p>
    </div>
  )
}
