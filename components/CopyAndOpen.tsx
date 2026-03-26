"use client"

import { useState } from "react"
import { copyHtmlToClipboard, openNaverBlog } from "@/lib/clipboard"

interface CopyAndOpenProps {
  title: string
  content: string
}

export default function CopyAndOpen({ title, content }: CopyAndOpenProps) {
  const [copied, setCopied] = useState(false)

  const fullHtml = `<h2>${title}</h2>${content}`
  const plainText = `${title}\n\n${content.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ")}`

  const handleCopy = async () => {
    const success = await copyHtmlToClipboard(fullHtml, plainText)
    if (success) {
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    }
  }

  const handleCopyAndOpen = async () => {
    await copyHtmlToClipboard(fullHtml, plainText)
    setCopied(true)
    setTimeout(() => {
      openNaverBlog()
    }, 500)
  }

  return (
    <div className="space-y-3">
      <button
        onClick={handleCopyAndOpen}
        className="w-full py-4 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600 active:bg-green-700 transition-colors"
      >
        복사하고 네이버 블로그 열기
      </button>

      <button
        onClick={handleCopy}
        className="w-full py-3 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
      >
        {copied ? "복사 완료!" : "내용만 복사하기"}
      </button>

      <p className="text-xs text-gray-400 text-center leading-relaxed">
        복사된 내용을 네이버 블로그 글쓰기에서<br />
        붙여넣기(Ctrl+V)하면 서식이 유지돼요
      </p>
    </div>
  )
}
