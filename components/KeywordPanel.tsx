"use client"

import { useState } from "react"
import { Card } from "./ui"

interface KeywordPanelProps {
  keywords: string[]
  onKeywordsChange: (keywords: string[]) => void
}

export default function KeywordPanel({ keywords, onKeywordsChange }: KeywordPanelProps) {
  const [newKeyword, setNewKeyword] = useState("")

  if (keywords.length === 0) return null

  const addKeyword = () => {
    const trimmed = newKeyword.trim()
    if (!trimmed || keywords.includes(trimmed)) return
    onKeywordsChange([...keywords, trimmed])
    setNewKeyword("")
  }

  const removeKeyword = (index: number) => {
    onKeywordsChange(keywords.filter((_, i) => i !== index))
  }

  return (
    <Card className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-700">SEO 추천 키워드</h3>

      <div className="flex flex-wrap gap-2">
        {keywords.map((keyword, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-700 text-xs rounded-full border border-green-200"
          >
            #{keyword}
            <button
              onClick={() => removeKeyword(index)}
              className="text-green-400 hover:text-red-500 ml-0.5"
            >
              x
            </button>
          </span>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={newKeyword}
          onChange={(e) => setNewKeyword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addKeyword()}
          placeholder="키워드 추가"
          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-green-400"
        />
        <button
          onClick={addKeyword}
          className="px-3 py-2 bg-green-500 text-white text-xs rounded-lg hover:bg-green-600"
        >
          추가
        </button>
      </div>

      <p className="text-xs text-gray-400">
        네이버 검색 노출에 유리한 키워드입니다. 본문 마지막 해시태그를 참고용으로 보여드려요.
      </p>
    </Card>
  )
}
