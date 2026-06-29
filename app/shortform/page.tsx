"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import PhotoUploader from "@/components/PhotoUploader"
import MemoInput from "@/components/MemoInput"
import { PageLayout, PageHeader, Label } from "@/components/ui"
import { SHORTFORM_PLATFORMS, type ShortformPlatform } from "@/lib/shortform"
import { SHORTFORM_STYLES } from "@/lib/shortformStyles"

export default function ShortformPage() {
  const router = useRouter()
  const [photos, setPhotos] = useState<string[]>([])
  const [memo, setMemo] = useState("")
  const [platform, setPlatform] = useState<ShortformPlatform>("shorts")
  const [styleId, setStyleId] = useState("info")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const canGenerate = photos.length > 0 || memo.trim().length > 0
  const selectedStyle = SHORTFORM_STYLES.find((s) => s.id === styleId)

  const handleGenerate = async () => {
    if (!canGenerate) return

    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/shortform", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photos, memo, platform, styleId }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.error || "숏폼 구성안 생성에 실패했습니다. 다시 시도해주세요.")
      }

      const data = await response.json()

      sessionStorage.setItem(
        "generatedShortform",
        JSON.stringify({ ...data, photos, memo })
      )

      router.push("/shortform/result")
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.")
    } finally {
      setLoading(false)
    }
  }

  const chipClass = (active: boolean) =>
    `px-3 py-2 rounded-full text-sm font-medium transition-colors ${
      active
        ? "bg-red-500 text-white"
        : "bg-white border border-gray-200 text-gray-600 hover:border-red-400"
    }`

  return (
    <PageLayout>
      <PageHeader title="숏폼 구성안 만들기" onBack={() => router.push("/")} />

      <p className="text-sm text-gray-500 text-center mb-6">
        사진과 메모로 숏폼 대본·자막·캡션을 만들어드려요 🎬
      </p>

      <div className="space-y-6">
        <PhotoUploader photos={photos} onPhotosChange={setPhotos} />
        <MemoInput
          memo={memo}
          onMemoChange={setMemo}
          placeholder={
            "숏폼으로 만들 내용을 적어주세요.\n\n예: 강남 파스타 맛집 방문, 트러플 파스타 강추, 분위기 좋고 데이트 코스로 굿"
          }
        />

        <div>
          <Label>플랫폼</Label>
          <div className="flex rounded-xl bg-gray-100 p-1 mt-2">
            {SHORTFORM_PLATFORMS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPlatform(p.id)}
                className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  platform === p.id ? "bg-red-500 text-white" : "text-gray-500"
                }`}
              >
                {p.emoji} {p.name}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Label>스타일</Label>
          <div className="flex flex-wrap gap-2">
            {SHORTFORM_STYLES.map((s) => (
              <button
                key={s.id}
                onClick={() => setStyleId(s.id)}
                className={chipClass(styleId === s.id)}
              >
                {s.emoji} {s.name}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400">{selectedStyle?.description}</p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl">{error}</div>
        )}

        <button
          onClick={handleGenerate}
          disabled={!canGenerate || loading}
          className="w-full py-4 bg-red-500 text-white font-semibold rounded-xl disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-red-600 active:bg-red-700 transition-colors"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              AI가 숏폼을 구성하고 있어요...
            </span>
          ) : (
            "숏폼 구성안 생성하기"
          )}
        </button>
      </div>
    </PageLayout>
  )
}
