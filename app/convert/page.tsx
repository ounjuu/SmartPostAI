"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { PageLayout, PageHeader, textareaClass, btnPrimary } from "@/components/ui"

export default function ConvertPage() {
  const router = useRouter()
  const [text, setText] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleConvert = async () => {
    if (!text.trim()) return

    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/convert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      })

      if (!response.ok) {
        throw new Error("변환에 실패했습니다. 다시 시도해주세요.")
      }

      const data = await response.json()

      sessionStorage.setItem(
        "generatedPost",
        JSON.stringify({
          title: data.title,
          content: data.content,
          tistoryTitle: data.tistoryTitle || data.title,
          tistoryContent: data.tistoryContent || "",
          keywords: data.keywords || [],
          photos: [],
          memo: text.slice(0, 100),
          styleId: "convert",
        })
      )

      router.push("/result")
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageLayout>
      <PageHeader title="기존 글 변환" onBack={() => router.push("/")} />

      <p className="text-sm text-gray-500 mb-6">
        기존 블로그 글을 붙여넣으면 네이버용(친근 톤)과 티스토리용(정보 톤)으로 자동 변환해줘요.
      </p>

      <div className="space-y-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="기존 블로그 글을 여기에 붙여넣기 해주세요.&#10;&#10;제목과 본문을 함께 넣어주면 더 좋아요."
          className={textareaClass("h-64")}
        />

        <p className="text-xs text-gray-400 text-right">
          {text.length.toLocaleString()}자
        </p>

        {error && (
          <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl">
            {error}
          </div>
        )}

        <button
          onClick={handleConvert}
          disabled={!text.trim() || loading}
          className={btnPrimary + " py-4 font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed"}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              변환 중...
            </span>
          ) : (
            "네이버 + 티스토리 변환하기"
          )}
        </button>
      </div>
    </PageLayout>
  )
}
