"use client"

import { useState } from "react"

interface BlogPreviewProps {
  title: string
  content: string
  onTitleChange: (title: string) => void
  onContentChange: (content: string) => void
}

export default function BlogPreview({
  title,
  content,
  onTitleChange,
  onContentChange,
}: BlogPreviewProps) {
  const [isEditing, setIsEditing] = useState(false)

  if (isEditing) {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">제목</label>
          <input
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">본문 (HTML)</label>
          <textarea
            value={content}
            onChange={(e) => onContentChange(e.target.value)}
            className="w-full h-64 p-3 border border-gray-200 rounded-xl text-xs font-mono resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <button
          onClick={() => setIsEditing(false)}
          className="w-full py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
        >
          미리보기로 돌아가기
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        </div>
        <div
          className="p-4 prose prose-sm max-w-none text-gray-700 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
      <button
        onClick={() => setIsEditing(true)}
        className="w-full py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
      >
        직접 수정하기
      </button>
    </div>
  )
}
