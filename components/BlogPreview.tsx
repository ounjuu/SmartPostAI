"use client"

import { useState } from "react"
import { Card, Label, inputClass, textareaClass, btnSecondary } from "./ui"

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
          <Label>제목</Label>
          <input
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            className={inputClass + " mt-1"}
          />
        </div>
        <div>
          <Label>본문 (HTML)</Label>
          <textarea
            value={content}
            onChange={(e) => onContentChange(e.target.value)}
            className={textareaClass("h-64") + " mt-1 text-xs font-mono"}
          />
        </div>
        <button onClick={() => setIsEditing(false)} className={btnSecondary}>
          미리보기로 돌아가기
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden !p-0">
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        </div>
        <div
          className="p-4 prose prose-sm max-w-none text-gray-700 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </Card>
      <button onClick={() => setIsEditing(true)} className={btnSecondary}>
        직접 수정하기
      </button>
    </div>
  )
}
