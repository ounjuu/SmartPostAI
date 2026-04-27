"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import PhotoUploader from "@/components/PhotoUploader"
import MemoInput from "@/components/MemoInput"
import StyleSelector from "@/components/StyleSelector"
import { getCustomStyles, STYLE_PRESETS } from "@/lib/styles"

export default function Home() {
  const router = useRouter()
  const [photos, setPhotos] = useState<string[]>([])
  const [memo, setMemo] = useState("")
  const [styleId, setStyleId] = useState("restaurant")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const selectedPreset = STYLE_PRESETS.find((p) => p.id === styleId)
  const memoGuide = selectedPreset?.memoGuide

  const canGenerate = photos.length > 0 || memo.trim().length > 0

  const handleGenerate = async () => {
    if (!canGenerate) return

    setLoading(true)
    setError("")

    try {
      // 커스텀 스타일인 경우 샘플 데이터 가져오기
      let customSamples: string[] | undefined
      if (styleId.startsWith("custom:")) {
        const customId = styleId.replace("custom:", "")
        const styles = getCustomStyles()
        const style = styles.find((s) => s.id === customId)
        customSamples = style?.samples
      }

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photos, memo, styleId, customSamples }),
      })

      if (!response.ok) {
        throw new Error("글 생성에 실패했습니다. 다시 시도해주세요.")
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
          photos,
          memo,
          styleId,
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
    <main className="max-w-lg mx-auto px-4 py-6">
      <header className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">SmartPostAI</h1>
        <p className="text-sm text-gray-500 mt-1">
          사진만 올려도 한톨 말투로 블로그 글이 완성돼요 🌾
        </p>
      </header>

      <div className="space-y-6">
        <PhotoUploader photos={photos} onPhotosChange={setPhotos} />
        <MemoInput memo={memo} onMemoChange={setMemo} placeholder={memoGuide} />
        <StyleSelector selectedStyle={styleId} onStyleChange={setStyleId} />

        {error && (
          <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl">
            {error}
          </div>
        )}

        <div className="flex justify-center gap-4">
          <Link
            href="/convert"
            className="text-sm text-blue-400 hover:text-blue-500 transition-colors"
          >
            기존 글 변환 &rarr;
          </Link>
          <Link
            href="/history"
            className="text-sm text-gray-400 hover:text-green-500 transition-colors"
          >
            이전 글 보기 &rarr;
          </Link>
        </div>

        <button
          onClick={handleGenerate}
          disabled={!canGenerate || loading}
          className="w-full py-4 bg-green-500 text-white font-semibold rounded-xl disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-green-600 active:bg-green-700 transition-colors"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              AI가 글을 쓰고 있어요...
            </span>
          ) : (
            "블로그 글 생성하기"
          )}
        </button>
      </div>
    </main>
  )
}
