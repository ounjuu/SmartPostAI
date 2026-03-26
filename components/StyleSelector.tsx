"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { STYLE_PRESETS, getCustomStyles, type CustomStyle } from "@/lib/styles"

interface StyleSelectorProps {
  selectedStyle: string
  onStyleChange: (styleId: string) => void
}

export default function StyleSelector({ selectedStyle, onStyleChange }: StyleSelectorProps) {
  const [customStyles, setCustomStyles] = useState<CustomStyle[]>([])

  useEffect(() => {
    setCustomStyles(getCustomStyles())
  }, [])

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-gray-700">
          글 스타일
        </label>
        <Link
          href="/styles"
          className="text-xs text-blue-500 hover:text-blue-600"
        >
          내 스타일 관리 &rarr;
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        {STYLE_PRESETS.map((preset) => (
          <button
            key={preset.id}
            onClick={() => onStyleChange(preset.id)}
            className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedStyle === preset.id
                ? "bg-green-500 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:border-green-400"
            }`}
          >
            {preset.emoji} {preset.name}
          </button>
        ))}

        {customStyles.map((style) => (
          <button
            key={style.id}
            onClick={() => onStyleChange(`custom:${style.id}`)}
            className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedStyle === `custom:${style.id}`
                ? "bg-green-500 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:border-green-400"
            }`}
          >
            ✏️ {style.name}
          </button>
        ))}
      </div>

      <p className="text-xs text-gray-400">
        {STYLE_PRESETS.find((p) => p.id === selectedStyle)?.description ||
          customStyles.find((s) => `custom:${s.id}` === selectedStyle)
            ? "내가 등록한 글 스타일로 작성해요"
            : ""}
      </p>
    </div>
  )
}
