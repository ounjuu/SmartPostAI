"use client"

import { Label, textareaClass } from "./ui"

interface MemoInputProps {
  memo: string
  onMemoChange: (memo: string) => void
}

export default function MemoInput({ memo, onMemoChange }: MemoInputProps) {
  return (
    <div className="space-y-2">
      <Label>
        메모 / 키워드 <span className="text-gray-400 font-normal">(선택)</span>
      </Label>
      <textarea
        value={memo}
        onChange={(e) => onMemoChange(e.target.value)}
        placeholder="비워두면 사진만 보고 글을 써드려요.&#10;간단한 메모를 적으면 더 정확해져요.&#10;&#10;예: 강남 파스타 맛집, 가격 2만원대, 분위기 좋음"
        className={textareaClass("h-32") + " placeholder:text-gray-400"}
      />
      <p className="text-xs text-gray-400 text-right">{memo.length}/500</p>
    </div>
  )
}
