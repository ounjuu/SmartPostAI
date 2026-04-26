"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import BlogPreview from "@/components/BlogPreview"
import CopyAndOpen from "@/components/CopyAndOpen"
import KeywordPanel from "@/components/KeywordPanel"
import { PageLayout, PageHeader } from "@/components/ui"
import { getCustomStyles } from "@/lib/styles"
import { saveToHistory } from "@/lib/history"

interface GeneratedPost {
  title: string
  content: string
  tistoryTitle: string
  tistoryContent: string
  keywords: string[]
  photos: string[]
  memo?: string
  styleId?: string
}

export default function ResultPage() {
  const router = useRouter()
  const [post, setPost] = useState<GeneratedPost | null>(null)
  const [previewTab, setPreviewTab] = useState<"naver" | "tistory">("naver")
  const [regenerating, setRegenerating] = useState(false)
  const [regenError, setRegenError] = useState("")

  useEffect(() => {
    const stored = sessionStorage.getItem("generatedPost")
    if (!stored) {
      router.push("/")
      return
    }
    const parsed = JSON.parse(stored)
    setPost(parsed)

    // 히스토리에 자동 저장
    saveToHistory({
      title: parsed.title,
      content: parsed.content,
      tistoryTitle: parsed.tistoryTitle || parsed.title,
      tistoryContent: parsed.tistoryContent || "",
      keywords: parsed.keywords || [],
      styleId: parsed.styleId || "",
    })
  }, [router])

  const handleRegenerate = async () => {
    if (!post || regenerating) return

    setRegenerating(true)
    setRegenError("")

    try {
      const { photos, memo, styleId } = post

      let customSamples: string[] | undefined
      if (styleId?.startsWith("custom:")) {
        const customId = styleId.replace("custom:", "")
        const styles = getCustomStyles()
        const style = styles.find((s) => s.id === customId)
        customSamples = style?.samples
      }

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photos, memo: memo || "", styleId: styleId || "restaurant", customSamples }),
      })

      if (!response.ok) {
        throw new Error("글 생성에 실패했습니다. 다시 시도해주세요.")
      }

      const data = await response.json()

      const newPost: GeneratedPost = {
        title: data.title,
        content: data.content,
        tistoryTitle: data.tistoryTitle || data.title,
        tistoryContent: data.tistoryContent || "",
        keywords: data.keywords || [],
        photos,
        memo,
        styleId,
      }

      setPost(newPost)
      sessionStorage.setItem("generatedPost", JSON.stringify(newPost))

      // 히스토리에도 저장
      saveToHistory({
        title: newPost.title,
        content: newPost.content,
        tistoryTitle: newPost.tistoryTitle,
        tistoryContent: newPost.tistoryContent,
        keywords: newPost.keywords,
        styleId: newPost.styleId || "",
      })
    } catch (err) {
      setRegenError(err instanceof Error ? err.message : "오류가 발생했습니다.")
    } finally {
      setRegenerating(false)
    }
  }

  if (!post) {
    return (
      <PageLayout>
        <p className="text-gray-500 text-center">로딩 중...</p>
      </PageLayout>
    )
  }

  const isNaver = previewTab === "naver"

  return (
    <PageLayout>
      <PageHeader title="미리보기" onBack={() => router.push("/")} />

      <div className="space-y-6">
        <div className="flex rounded-xl bg-gray-100 p-1">
          <button
            onClick={() => setPreviewTab("naver")}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
              isNaver ? "bg-green-500 text-white" : "text-gray-500"
            }`}
          >
            네이버 블로그
          </button>
          <button
            onClick={() => setPreviewTab("tistory")}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
              !isNaver ? "bg-orange-500 text-white" : "text-gray-500"
            }`}
          >
            티스토리
          </button>
        </div>

        {isNaver ? (
          <BlogPreview
            title={post.title}
            content={post.content}
            onTitleChange={(title) => setPost({ ...post, title })}
            onContentChange={(content) => setPost({ ...post, content })}
          />
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">{post.tistoryTitle}</h2>
            </div>
            <div className="p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
              {post.tistoryContent}
            </div>
          </div>
        )}

        <KeywordPanel
          keywords={post.keywords}
          onKeywordsChange={(keywords) => setPost({ ...post, keywords })}
        />

        {regenError && (
          <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl">
            {regenError}
          </div>
        )}

        <button
          onClick={handleRegenerate}
          disabled={regenerating}
          className="w-full py-3 bg-gray-100 text-gray-600 font-medium rounded-xl hover:bg-gray-200 active:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {regenerating ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              AI가 다시 쓰고 있어요...
            </span>
          ) : (
            "다시 생성하기"
          )}
        </button>

        <CopyAndOpen
          title={post.title}
          content={post.content}
          tistoryTitle={post.tistoryTitle}
          tistoryContent={post.tistoryContent}
          disabled={regenerating}
        />
      </div>
    </PageLayout>
  )
}
