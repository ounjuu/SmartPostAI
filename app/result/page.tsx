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
      </div>
    </PageLayout>
  )
}
