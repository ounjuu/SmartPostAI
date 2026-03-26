"use client"

interface MemoInputProps {
  memo: string
  onMemoChange: (memo: string) => void
}

export default function MemoInput({ memo, onMemoChange }: MemoInputProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-700">
        메모 / 키워드
      </label>
      <textarea
        value={memo}
        onChange={(e) => onMemoChange(e.target.value)}
        placeholder="어떤 내용으로 블로그 글을 쓸까요? 간단한 메모나 키워드를 입력해주세요.&#10;&#10;예: 강남 맛집 방문, 파스타가 맛있었음, 분위기 좋았고 가격은 2만원대"
        className="w-full h-32 p-4 border border-gray-200 rounded-xl resize-none text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent placeholder:text-gray-400"
      />
      <p className="text-xs text-gray-400 text-right">{memo.length}/500</p>
    </div>
  )
}
