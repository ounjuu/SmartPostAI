"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getHistory, deleteFromHistory, clearHistory, HistoryItem } from "@/lib/history"
import { PageLayout, PageHeader, Card } from "@/components/ui"
import { STYLE_PRESETS } from "@/lib/styles"

export default function HistoryPage() {
  const router = useRouter()
  const [items, setItems] = useState<HistoryItem[]>([])
  const [showConfirm, setShowConfirm] = useState(false)

  useEffect(() => {
    setItems(getHistory())
  }, [])

  const handleDelete = (id: string) => {
    deleteFromHistory(id)
    setItems(getHistory())
  }

  const handleClearAll = () => {
    clearHistory()
    setItems([])
    setShowConfirm(false)
  }

  const handleItemClick = (item: HistoryItem) => {
    sessionStorage.setItem(
      "generatedPost",
      JSON.stringify({
        title: item.title,
        content: item.content,
        tistoryTitle: item.tistoryTitle,
        tistoryContent: item.tistoryContent,
        keywords: item.keywords,
        photos: [],
      })
    )
    router.push("/result")
  }

  const getStyleName = (styleId: string) => {
    const preset = STYLE_PRESETS.find((p) => p.id === styleId)
    return preset ? `${preset.emoji} ${preset.name}` : styleId
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    const month = d.getMonth() + 1
    const day = d.getDate()
    const hours = d.getHours().toString().padStart(2, "0")
    const minutes = d.getMinutes().toString().padStart(2, "0")
    return `${month}/${day} ${hours}:${minutes}`
  }

  // content에서 HTML 태그를 제거하고 첫 2줄 추출
  const getPreviewText = (content: string) => {
    const plain = content.replace(/<[^>]*>/g, "").trim()
    const lines = plain.split("\n").filter((l) => l.trim())
    return lines.slice(0, 2).join("\n")
  }

  return (
    <PageLayout>
      <PageHeader title="이전 글 목록" onBack={() => router.push("/")} />

      {items.length > 0 && (
        <div className="flex justify-end mb-4">
          {showConfirm ? (
            <div className="flex gap-2">
              <button
                onClick={handleClearAll}
                className="text-xs px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                정말 삭제
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="text-xs px-3 py-1.5 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 transition-colors"
              >
                취소
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowConfirm(true)}
              className="text-xs text-red-400 hover:text-red-600 transition-colors"
            >
              전체 삭제
            </button>
          )}
        </div>
      )}

      {items.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 text-sm">아직 생성한 글이 없어요</p>
          <button
            onClick={() => router.push("/")}
            className="mt-4 text-sm text-green-500 hover:text-green-600 font-medium"
          >
            글 생성하러 가기
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <Card key={item.id} className="relative">
              <div
                onClick={() => handleItemClick(item)}
                className="cursor-pointer"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-bold text-gray-900 line-clamp-1 flex-1">
                    {item.title || item.tistoryTitle}
                  </h3>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(item.id)
                    }}
                    className="text-gray-300 hover:text-red-400 transition-colors shrink-0 text-lg leading-none"
                    aria-label="삭제"
                  >
                    &times;
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                  {getPreviewText(item.content || item.tistoryContent)}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-gray-400">
                    {getStyleName(item.styleId)}
                  </span>
                  <span className="text-xs text-gray-300">|</span>
                  <span className="text-xs text-gray-400">
                    {formatDate(item.createdAt)}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </PageLayout>
  )
}
