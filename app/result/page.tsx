"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import BlogPreview from "@/components/BlogPreview"
import CopyAndOpen from "@/components/CopyAndOpen"
import KeywordPanel from "@/components/KeywordPanel"

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
      <main className="max-w-lg mx-auto px-4 py-6 text-center">
        <p className="text-gray-500">로딩 중...</p>
      </main>
    )
  }

  return (
    <main className="max-w-lg mx-auto px-4 py-6">
      <header className="flex items-center justify-between mb-6">
        <button
          onClick={() => router.push("/")}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          &larr; 다시 작성
        </button>
        <h1 className="text-lg font-bold text-gray-900">미리보기</h1>
        <div className="w-16" />
      </header>

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
    </main>
  )
}
