"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import BlogPreview from "@/components/BlogPreview"
import CopyAndOpen from "@/components/CopyAndOpen"
import KeywordPanel from "@/components/KeywordPanel"
import { PageLayout, PageHeader } from "@/components/ui"

interface GeneratedPost {
  title: string
  content: string
  tistoryTitle: string
  tistoryContent: string
  keywords: string[]
  photos: string[]
}

export default function ResultPage() {
  const router = useRouter()
  const [post, setPost] = useState<GeneratedPost | null>(null)
  const [previewTab, setPreviewTab] = useState<"naver" | "tistory">("naver")

  useEffect(() => {
    const stored = sessionStorage.getItem("generatedPost")
    if (!stored) {
      router.push("/")
      return
    }
    setPost(JSON.parse(stored))
  }, [router])

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
        {/* 탭 */}
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

        {/* 미리보기 */}
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

        <CopyAndOpen
          title={post.title}
          content={post.content}
          tistoryTitle={post.tistoryTitle}
          tistoryContent={post.tistoryContent}
        />
      </div>
    </PageLayout>
  )
}
