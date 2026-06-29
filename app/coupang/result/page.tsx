"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { PageLayout, PageHeader, Card } from "@/components/ui"
import {
  assembleCoupangPosts,
  THREADS_MAX,
  type CoupangResult,
  type CoupangProduct,
} from "@/lib/coupangFormat"

type StoredCoupang = CoupangResult & {
  products?: CoupangProduct[]
  photos?: string[]
  memo?: string
}

export default function CoupangResultPage() {
  const router = useRouter()
  const [data, setData] = useState<StoredCoupang | null>(null)
  const [copied, setCopied] = useState<number | "all" | "tags" | "err" | null>(null)

  useEffect(() => {
    const raw = sessionStorage.getItem("generatedCoupang")
    if (!raw) {
      router.replace("/coupang")
      return
    }
    try {
      setData(JSON.parse(raw))
    } catch {
      router.replace("/coupang")
    }
  }, [router])

  const posts = useMemo(
    () => (data ? assembleCoupangPosts(data, data.products || []) : []),
    [data]
  )

  if (!data) return null

  const hashtagLine = data.hashtags.map((t) => `#${t.replace(/^#/, "")}`).join(" ")

  const copy = async (key: number | "all" | "tags", text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(key)
    } catch {
      setCopied("err")
    }
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <PageLayout>
      <PageHeader title="쿠팡 파트너스 스레드" onBack={() => router.push("/coupang")} />

      <p className="text-sm text-gray-500 text-center mb-2">
        게시물을 하나씩 복사해서 쓰레드에 순서대로 올리면 돼요 🧵
      </p>
      {copied && (
        <p className="text-center text-sm text-green-600 mb-2">
          {copied === "err" ? "복사에 실패했어요" : "복사됐어요!"}
        </p>
      )}

      <div className="space-y-4">
        {posts.map((post, i) => {
          const over = post.length > THREADS_MAX
          return (
            <Card key={i}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full">
                  {i + 1}번째 게시물
                </span>
                <span className={`text-xs ${over ? "text-red-500" : "text-gray-400"}`}>
                  {post.length}/{THREADS_MAX}자
                </span>
              </div>
              <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{post}</p>
              <button
                onClick={() => copy(i, post)}
                className="mt-3 w-full py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
              >
                이 게시물 복사
              </button>
            </Card>
          )
        })}

        {hashtagLine && (
          <Card>
            <p className="text-xs font-semibold text-gray-400 mb-1">해시태그</p>
            <p className="text-sm text-blue-500 break-words">{hashtagLine}</p>
            <button
              onClick={() => copy("tags", hashtagLine)}
              className="mt-3 w-full py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
            >
              해시태그 복사
            </button>
          </Card>
        )}

        <button
          onClick={() => copy("all", posts.join("\n\n— — —\n\n"))}
          className="w-full py-3 bg-yellow-400 text-gray-900 font-medium rounded-xl hover:bg-yellow-500 active:bg-yellow-600 transition-colors"
        >
          전체 복사 (구분선 포함)
        </button>

        <p className="text-xs text-gray-400 text-center leading-relaxed">
          마지막 게시물에 대가성 고지가 자동으로 들어가 있어요. 링크를 비워뒀다면
          (여기에 쿠팡 파트너스 링크) 자리에 발급한 링크를 붙여넣으세요.
        </p>
      </div>
    </PageLayout>
  )
}
