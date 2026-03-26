"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  getCustomStyles,
  saveCustomStyle,
  deleteCustomStyle,
  type CustomStyle,
} from "@/lib/styles"

export default function StylesPage() {
  const router = useRouter()
  const [styles, setStyles] = useState<CustomStyle[]>([])
  const [isAdding, setIsAdding] = useState(false)
  const [newName, setNewName] = useState("")
  const [newSample, setNewSample] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [additionalSample, setAdditionalSample] = useState("")

  useEffect(() => {
    setStyles(getCustomStyles())
  }, [])

  const handleAdd = () => {
    if (!newName.trim() || !newSample.trim()) return

    const style: CustomStyle = {
      id: Date.now().toString(),
      name: newName.trim(),
      samples: [newSample.trim()],
      createdAt: Date.now(),
    }

    saveCustomStyle(style)
    setStyles(getCustomStyles())
    setNewName("")
    setNewSample("")
    setIsAdding(false)
  }

  const handleAddSample = (styleId: string) => {
    if (!additionalSample.trim()) return

    const style = styles.find((s) => s.id === styleId)
    if (!style || style.samples.length >= 3) return

    style.samples.push(additionalSample.trim())
    saveCustomStyle(style)
    setStyles(getCustomStyles())
    setAdditionalSample("")
    setEditingId(null)
  }

  const handleDelete = (id: string) => {
    deleteCustomStyle(id)
    setStyles(getCustomStyles())
  }

  const handleDeleteSample = (styleId: string, sampleIndex: number) => {
    const style = styles.find((s) => s.id === styleId)
    if (!style) return

    style.samples = style.samples.filter((_, i) => i !== sampleIndex)
    if (style.samples.length === 0) {
      deleteCustomStyle(styleId)
    } else {
      saveCustomStyle(style)
    }
    setStyles(getCustomStyles())
  }

  return (
    <main className="max-w-lg mx-auto px-4 py-6">
      <header className="flex items-center justify-between mb-6">
        <button
          onClick={() => router.push("/")}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          &larr; 돌아가기
        </button>
        <h1 className="text-lg font-bold text-gray-900">내 스타일 관리</h1>
        <div className="w-16" />
      </header>

      <p className="text-sm text-gray-500 mb-6">
        기존에 쓴 블로그 글을 등록하면 AI가 내 말투와 구조를 학습해서 비슷한
        스타일로 글을 생성해줘요. 스타일당 최대 3개 샘플을 등록할 수 있어요.
      </p>

      {/* 등록된 스타일 목록 */}
      <div className="space-y-4 mb-6">
        {styles.map((style) => (
          <div
            key={style.id}
            className="bg-white rounded-2xl border border-gray-200 p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">
                ✏️ {style.name}
              </h3>
              <button
                onClick={() => handleDelete(style.id)}
                className="text-xs text-red-400 hover:text-red-600"
              >
                스타일 삭제
              </button>
            </div>

            {style.samples.map((sample, idx) => (
              <div key={idx} className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-400">
                    샘플 {idx + 1}
                  </span>
                  <button
                    onClick={() => handleDeleteSample(style.id, idx)}
                    className="text-xs text-gray-400 hover:text-red-500"
                  >
                    삭제
                  </button>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl text-xs text-gray-600 max-h-32 overflow-y-auto leading-relaxed">
                  {sample.slice(0, 200)}
                  {sample.length > 200 && "..."}
                </div>
              </div>
            ))}

            {style.samples.length < 3 && (
              <>
                {editingId === style.id ? (
                  <div className="space-y-2 mt-2">
                    <textarea
                      value={additionalSample}
                      onChange={(e) => setAdditionalSample(e.target.value)}
                      placeholder="추가할 블로그 글을 붙여넣기 해주세요"
                      className="w-full h-24 p-3 border border-gray-200 rounded-xl text-xs resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAddSample(style.id)}
                        className="flex-1 py-2 bg-green-500 text-white text-sm rounded-xl"
                      >
                        추가
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(null)
                          setAdditionalSample("")
                        }}
                        className="flex-1 py-2 bg-gray-100 text-gray-600 text-sm rounded-xl"
                      >
                        취소
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setEditingId(style.id)}
                    className="w-full py-2 mt-2 border border-dashed border-gray-300 text-gray-400 text-xs rounded-xl hover:border-green-400 hover:text-green-500"
                  >
                    + 샘플 추가 ({style.samples.length}/3)
                  </button>
                )}
              </>
            )}
          </div>
        ))}

        {styles.length === 0 && !isAdding && (
          <div className="text-center py-8 text-gray-400 text-sm">
            아직 등록된 스타일이 없어요
          </div>
        )}
      </div>

      {/* 새 스타일 추가 */}
      {isAdding ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-3">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="스타일 이름 (예: 내 맛집 리뷰)"
            className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <textarea
            value={newSample}
            onChange={(e) => setNewSample(e.target.value)}
            placeholder="기존에 쓴 블로그 글을 여기에 붙여넣기 해주세요. AI가 이 글의 말투, 구조, 분위기를 학습합니다."
            className="w-full h-40 p-3 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              disabled={!newName.trim() || !newSample.trim()}
              className="flex-1 py-3 bg-green-500 text-white font-medium rounded-xl disabled:bg-gray-300"
            >
              등록하기
            </button>
            <button
              onClick={() => {
                setIsAdding(false)
                setNewName("")
                setNewSample("")
              }}
              className="flex-1 py-3 bg-gray-100 text-gray-600 font-medium rounded-xl"
            >
              취소
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="w-full py-4 bg-white border-2 border-dashed border-gray-300 text-gray-500 font-medium rounded-xl hover:border-green-400 hover:text-green-500 transition-colors"
        >
          + 새 스타일 등록하기
        </button>
      )}
    </main>
  )
}
