"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import BlogPreview from "@/components/BlogPreview"
import CopyAndOpen from "@/components/CopyAndOpen"
import TistoryPublish from "@/components/TistoryPublish"
import KeywordPanel from "@/components/KeywordPanel"
import { PageLayout, PageHeader } from "@/components/ui"

interface GeneratedPost {
  title: string
  content: string
  keywords: string[]
  photos: string[]
}

export default function ResultPage() {
  const router = useRouter()
  const [post, setPost] = useState<GeneratedPost | null>(null)

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

  return (
    <PageLayout>
      <PageHeader title="미리보기" onBack={() => router.push("/")} />

      <div className="space-y-6">
        <BlogPreview
          title={post.title}
          content={post.content}
          onTitleChange={(title) => setPost({ ...post, title })}
          onContentChange={(content) => setPost({ ...post, content })}
        />

        <KeywordPanel
          keywords={post.keywords}
          onKeywordsChange={(keywords) => setPost({ ...post, keywords })}
        />

        <CopyAndOpen title={post.title} content={post.content} />

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-3 text-xs text-gray-400">또는</span>
          </div>
        </div>

        <TistoryPublish title={post.title} content={post.content} />
      </div>
    </PageLayout>
  )
}
