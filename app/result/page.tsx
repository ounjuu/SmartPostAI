"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import BlogPreview from "@/components/BlogPreview"
import CopyAndOpen from "@/components/CopyAndOpen"
import KeywordPanel from "@/components/KeywordPanel"
import { PageLayout, PageHeader } from "@/components/ui"
import { getCustomStyles } from "@/lib/styles"
import { saveToHistory } from "@/lib/history"

type Platform = "naver" | "tistory"

interface GeneratedPost {
  naverTitle: string
  naverContent: string
  tistoryTitle: string
  tistoryContent: string
  keywords: string[]
  photos: string[]
  memo?: string
  styleId?: string
  platforms: Platform[]
}

function migrate(raw: Record<string, unknown>): GeneratedPost {
  const naverTitle =
    (raw.naverTitle as string | undefined) ?? (raw.title as string | undefined) ?? ""
  const naverContent =
    (raw.naverContent as string | undefined) ?? (raw.content as string | undefined) ?? ""
  const tistoryTitle = (raw.tistoryTitle as string | undefined) ?? ""
  const tistoryContent = (raw.tistoryContent as string | undefined) ?? ""

  let platforms = (raw.platforms as Platform[] | undefined) ?? []
  if (!platforms.length) {
    if (naverContent) platforms.push("naver")
    if (tistoryContent) platforms.push("tistory")
  }

  return {
    naverTitle,
    naverContent,
    tistoryTitle,
    tistoryContent,
    keywords: (raw.keywords as string[] | undefined) ?? [],
    photos: (raw.photos as string[] | undefined) ?? [],
    memo: raw.memo as string | undefined,
    styleId: raw.styleId as string | undefined,
    platforms,
  }
}

function persist(post: GeneratedPost) {
  sessionStorage.setItem("generatedPost", JSON.stringify(post))
  saveToHistory({
    title: post.naverTitle,
    content: post.naverContent,
    tistoryTitle: post.tistoryTitle,
    tistoryContent: post.tistoryContent,
    keywords: post.keywords,
    styleId: post.styleId || "",
  })
}

export default function ResultPage() {
  const router = useRouter()
  const [post, setPost] = useState<GeneratedPost | null>(null)
  const [previewTab, setPreviewTab] = useState<Platform>("naver")
  const [busyPlatform, setBusyPlatform] = useState<Platform | "regen" | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    const stored = sessionStorage.getItem("generatedPost")
    if (!stored) {
      router.push("/")
      return
    }
    const parsed = migrate(JSON.parse(stored))
    setPost(parsed)
    setPreviewTab(parsed.platforms[0] || "naver")
    persist(parsed)
  }, [router])

  const callGenerate = async (target: Platform): Promise<{
    title: string
    content: string
    keywords: string[]
  } | null> => {
    if (!post) return null

    let customSamples: string[] | undefined
    if (post.styleId?.startsWith("custom:")) {
      const customId = post.styleId.replace("custom:", "")
      const styles = getCustomStyles()
      const style = styles.find((s) => s.id === customId)
      customSamples = style?.samples
    }

    const response = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        photos: post.photos,
        memo: post.memo || "",
        styleId: post.styleId || "restaurant",
        customSamples,
        platform: target,
      }),
    })

    if (!response.ok) {
      throw new Error("글 생성에 실패했습니다. 다시 시도해주세요.")
    }

    return await response.json()
  }

  const handleAddPlatform = async (target: Platform) => {
    if (!post || busyPlatform) return
    setBusyPlatform(target)
    setError("")

    try {
      const data = await callGenerate(target)
      if (!data) return

      const next: GeneratedPost = {
        ...post,
        ...(target === "naver"
          ? { naverTitle: data.title, naverContent: data.content }
          : { tistoryTitle: data.title, tistoryContent: data.content }),
        keywords: data.keywords?.length ? data.keywords : post.keywords,
        platforms: post.platforms.includes(target)
          ? post.platforms
          : [...post.platforms, target],
      }

      setPost(next)
      setPreviewTab(target)
      persist(next)
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.")
    } finally {
      setBusyPlatform(null)
    }
  }

  const handleRegenerate = async () => {
    if (!post || busyPlatform) return
    setBusyPlatform("regen")
    setError("")

    try {
      const data = await callGenerate(previewTab)
      if (!data) return

      const next: GeneratedPost = {
        ...post,
        ...(previewTab === "naver"
          ? { naverTitle: data.title, naverContent: data.content }
          : { tistoryTitle: data.title, tistoryContent: data.content }),
        keywords: data.keywords?.length ? data.keywords : post.keywords,
      }

      setPost(next)
      persist(next)
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.")
    } finally {
      setBusyPlatform(null)
    }
  }

  if (!post) {
    return (
      <PageLayout>
        <p className="text-gray-500 text-center">로딩 중...</p>
      </PageLayout>
    )
  }

  const hasNaver = post.platforms.includes("naver") && post.naverContent.length > 0
  const hasTistory = post.platforms.includes("tistory") && post.tistoryContent.length > 0
  const showTabs = hasNaver && hasTistory
  const isNaverTab = previewTab === "naver"
  const missingPlatform: Platform | null = !hasNaver ? "naver" : !hasTistory ? "tistory" : null

  return (
    <PageLayout>
      <PageHeader title="미리보기" onBack={() => router.push("/")} />

      <div className="space-y-6">
        {showTabs && (
          <div className="flex rounded-xl bg-gray-100 p-1">
            <button
              onClick={() => setPreviewTab("naver")}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                isNaverTab ? "bg-green-500 text-white" : "text-gray-500"
              }`}
            >
              네이버 블로그
            </button>
            <button
              onClick={() => setPreviewTab("tistory")}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                !isNaverTab ? "bg-orange-500 text-white" : "text-gray-500"
              }`}
            >
              티스토리
            </button>
          </div>
        )}

        {isNaverTab && hasNaver ? (
          <BlogPreview
            title={post.naverTitle}
            content={post.naverContent}
            onTitleChange={(naverTitle) => {
              const next = { ...post, naverTitle }
              setPost(next)
              persist(next)
            }}
            onContentChange={(naverContent) => {
              const next = { ...post, naverContent }
              setPost(next)
              persist(next)
            }}
          />
        ) : !isNaverTab && hasTistory ? (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">{post.tistoryTitle}</h2>
            </div>
            <div className="p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
              {post.tistoryContent}
            </div>
          </div>
        ) : null}

        {missingPlatform && (
          <button
            onClick={() => handleAddPlatform(missingPlatform)}
            disabled={busyPlatform !== null}
            className={`w-full py-3 text-sm font-medium rounded-xl border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              missingPlatform === "naver"
                ? "border-green-300 text-green-600 hover:bg-green-50"
                : "border-orange-300 text-orange-600 hover:bg-orange-50"
            }`}
          >
            {busyPlatform === missingPlatform
              ? `${missingPlatform === "naver" ? "네이버" : "티스토리"} 버전 생성 중...`
              : `+ ${missingPlatform === "naver" ? "네이버" : "티스토리"} 버전도 생성하기`}
          </button>
        )}

        <KeywordPanel
          keywords={post.keywords}
          onKeywordsChange={(keywords) => {
            const next = { ...post, keywords }
            setPost(next)
            persist(next)
          }}
        />

        {error && (
          <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl">
            {error}
          </div>
        )}

        <button
          onClick={handleRegenerate}
          disabled={busyPlatform !== null}
          className="w-full py-3 bg-gray-100 text-gray-600 font-medium rounded-xl hover:bg-gray-200 active:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {busyPlatform === "regen" ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              AI가 다시 쓰고 있어요...
            </span>
          ) : (
            `${isNaverTab ? "네이버" : "티스토리"} 다시 생성하기`
          )}
        </button>

        <CopyAndOpen
          naverTitle={hasNaver ? post.naverTitle : ""}
          naverContent={hasNaver ? post.naverContent : ""}
          tistoryTitle={hasTistory ? post.tistoryTitle : ""}
          tistoryContent={hasTistory ? post.tistoryContent : ""}
          disabled={busyPlatform !== null}
        />
      </div>
    </PageLayout>
  )
}
