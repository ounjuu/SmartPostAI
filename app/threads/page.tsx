"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import PhotoUploader from "@/components/PhotoUploader"
import MemoInput from "@/components/MemoInput"
import { PageLayout, PageHeader, Label, Card } from "@/components/ui"
import {
  THREADS_CATEGORIES,
  type ThreadsCategory,
  type ThreadsVariation,
} from "@/lib/threadspost"

export default function ThreadsPage() {
  const router = useRouter()
  const [photos, setPhotos] = useState<string[]>([])
  const [memo, setMemo] = useState("")
  const [category, setCategory] = useState<ThreadsCategory>("food")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [variations, setVariations] = useState<ThreadsVariation[]>([])
  const [copied, setCopied] = useState<number | null>(null)

  const canGenerate = photos.length > 0 || memo.trim().length > 0

  const handleGenerate = async () => {
    if (!canGenerate) return

    setLoading(true)
    setError("")
    setVariations([])

    try {
      const response = await fetch("/api/threads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photos, memo, category }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.error || "쓰레드 글 생성에 실패했습니다. 다시 시도해주세요.")
      }

      const data = await response.json()
      setVariations(data.variations || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.")
    } finally {
      setLoading(false)
    }
  }

  const buildText = (v: ThreadsVariation) => {
    const tags = v.hashtags.map((t) => `#${t.replace(/^#/, "")}`).join(" ")
    return tags ? `${v.text.trim()}\n\n${tags}` : v.text.trim()
  }

  const copy = async (i: number, v: ThreadsVariation) => {
    try {
      await navigator.clipboard.writeText(buildText(v))
      setCopied(i)
    } catch {
      setCopied(-1)
    }
    setTimeout(() => setCopied(null), 2000)
  }

  const chipClass = (active: boolean) =>
    `px-3 py-2 rounded-full text-sm font-medium transition-colors ${
      active
        ? "bg-gray-900 text-white"
        : "bg-white border border-gray-200 text-gray-600 hover:border-gray-400"
    }`

  return (
    <PageLayout>
      <PageHeader title="쓰레드 일상 글" onBack={() => router.push("/")} />

      <p className="text-sm text-gray-500 text-center mb-6">
        사진·메모로 댓글 부르는 캐주얼한 쓰레드 글을 만들어드려요 🧵
      </p>

      <div className="space-y-6">
        <PhotoUploader photos={photos} onPhotosChange={setPhotos} />
        <MemoInput
          memo={memo}
          onMemoChange={setMemo}
          placeholder={
            "올릴 내용을 간단히 적어주세요.\n\n예: 수원 이사온 지 얼마 안 됐는데 맛집 많음, 여기 진짜 맛있었음"
          }
        />

        <div className="space-y-3">
          <Label>카테고리</Label>
          <div className="flex flex-wrap gap-2">
            {THREADS_CATEGORIES.map((c) => (
              <button
                key={c.id}
                onClick={() => setCategory(c.id)}
                className={chipClass(category === c.id)}
              >
                {c.emoji} {c.name}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl">{error}</div>
        )}

        <button
          onClick={handleGenerate}
          disabled={!canGenerate || loading}
          className="w-full py-4 bg-gray-900 text-white font-semibold rounded-xl disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-black transition-colors"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              쓰레드 글 만드는 중...
            </span>
          ) : variations.length ? (
            "다시 생성하기"
          ) : (
            "쓰레드 글 생성하기"
          )}
        </button>

        {variations.length > 0 && (
          <div className="space-y-3">
            {copied !== null && (
              <p className="text-center text-sm text-green-600">
                {copied === -1 ? "복사에 실패했어요" : "복사됐어요!"}
              </p>
            )}
            {variations.map((v, i) => (
              <Card key={i}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                    버전 {i + 1}
                  </span>
                </div>
                <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                  {v.text.trim()}
                </p>
                {v.hashtags.length > 0 && (
                  <p className="mt-2 text-sm text-blue-500 break-words">
                    {v.hashtags.map((t) => `#${t.replace(/^#/, "")}`).join(" ")}
                  </p>
                )}
                <button
                  onClick={() => copy(i, v)}
                  className="mt-3 w-full py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                >
                  이 버전 복사
                </button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  )
}
