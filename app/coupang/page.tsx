"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import PhotoUploader from "@/components/PhotoUploader"
import MemoInput from "@/components/MemoInput"
import { PageLayout, PageHeader, Label, inputClass } from "@/components/ui"
import type { CoupangProduct } from "@/lib/coupangFormat"

type Tone = "casual" | "polite"

export default function CoupangPage() {
  const router = useRouter()
  const [photos, setPhotos] = useState<string[]>([])
  const [memo, setMemo] = useState("")
  const [tone, setTone] = useState<Tone>("casual")
  const [products, setProducts] = useState<CoupangProduct[]>([{ name: "", link: "" }])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const hasProduct = products.some((p) => p.name.trim() || p.link.trim())
  const canGenerate = photos.length > 0 || memo.trim().length > 0 || hasProduct

  const updateProduct = (i: number, field: keyof CoupangProduct, value: string) => {
    setProducts((prev) => prev.map((p, idx) => (idx === i ? { ...p, [field]: value } : p)))
  }
  const addProduct = () => setProducts((prev) => [...prev, { name: "", link: "" }])
  const removeProduct = (i: number) =>
    setProducts((prev) => (prev.length > 1 ? prev.filter((_, idx) => idx !== i) : prev))

  const handleGenerate = async () => {
    if (!canGenerate) return

    setLoading(true)
    setError("")

    try {
      const cleanProducts = products.filter((p) => p.name.trim() || p.link.trim())

      const response = await fetch("/api/coupang", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photos, memo, products: cleanProducts, tone }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.error || "쿠팡 파트너스 글 생성에 실패했습니다. 다시 시도해주세요.")
      }

      const data = await response.json()

      sessionStorage.setItem(
        "generatedCoupang",
        JSON.stringify({ ...data, photos, memo })
      )

      router.push("/coupang/result")
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageLayout>
      <PageHeader title="쿠팡 파트너스 글 (쓰레드)" onBack={() => router.push("/")} />

      <p className="text-sm text-gray-500 text-center mb-6">
        훅으로 궁금증 유발 → 본론에 제품·링크·고지가 들어가는 스레드를 만들어드려요 🧵
      </p>

      <div className="space-y-6">
        <PhotoUploader photos={photos} onPhotosChange={setPhotos} />
        <MemoInput
          memo={memo}
          onMemoChange={setMemo}
          placeholder={
            "뭘 만들었는지/경험·효과, 레시피나 사용법을 적어주세요.\n\n예: 다크초콜릿+그릭요거트+말차로 만든 다이어트 아이스크림, 아이스크림 끊는 데 성공, 살 안 찌고 존맛"
          }
        />

        <div className="space-y-3">
          <Label>제품 + 쿠팡 파트너스 링크</Label>
          {products.map((p, i) => (
            <div key={i} className="space-y-2 p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-400 w-10">#{i + 1}</span>
                <input
                  value={p.name}
                  onChange={(e) => updateProduct(i, "name", e.target.value)}
                  placeholder="제품명 (예: 다크초콜릿 75%)"
                  className={inputClass + " flex-1"}
                />
                {products.length > 1 && (
                  <button
                    onClick={() => removeProduct(i)}
                    className="w-7 h-7 shrink-0 rounded-full bg-gray-200 text-gray-500 text-sm"
                  >
                    ×
                  </button>
                )}
              </div>
              <input
                value={p.link}
                onChange={(e) => updateProduct(i, "link", e.target.value)}
                placeholder="https://link.coupang.com/a/..."
                className={inputClass + " text-blue-600"}
              />
            </div>
          ))}
          <button
            onClick={addProduct}
            className="w-full py-2.5 text-sm text-gray-500 border border-dashed border-gray-300 rounded-xl hover:border-gray-400"
          >
            + 제품 추가
          </button>
          <p className="text-xs text-gray-400">
            링크는 비워둬도 돼요. 글에 자리만 표시되고 나중에 직접 넣을 수 있어요.
          </p>
        </div>

        <div>
          <Label>말투</Label>
          <div className="flex rounded-xl bg-gray-100 p-1 mt-2">
            <button
              type="button"
              onClick={() => setTone("casual")}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                tone === "casual" ? "bg-yellow-400 text-gray-900" : "text-gray-500"
              }`}
            >
              반말 (바이럴형)
            </button>
            <button
              type="button"
              onClick={() => setTone("polite")}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                tone === "polite" ? "bg-yellow-400 text-gray-900" : "text-gray-500"
              }`}
            >
              존댓말
            </button>
          </div>
        </div>

        <div className="p-3 bg-amber-50 text-amber-700 text-xs rounded-xl leading-relaxed">
          ⚠️ 쿠팡 파트너스 글은 대가성 고지가 법적 필수예요. 본론 맨 앞 [광고] 표기와 마지막
          고지 문구는 자동으로 들어가니 지우지 마세요.
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl">{error}</div>
        )}

        <button
          onClick={handleGenerate}
          disabled={!canGenerate || loading}
          className="w-full py-4 bg-yellow-400 text-gray-900 font-semibold rounded-xl disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-yellow-500 active:bg-yellow-600 transition-colors"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              AI가 스레드를 쓰고 있어요...
            </span>
          ) : (
            "쿠팡 파트너스 글 생성하기"
          )}
        </button>
      </div>
    </PageLayout>
  )
}
