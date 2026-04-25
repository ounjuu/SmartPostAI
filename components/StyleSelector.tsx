"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { STYLE_PRESETS, getCustomStyles, type CustomStyle } from "@/lib/styles"
import { Label } from "./ui"

interface StyleSelectorProps {
  selectedStyle: string
  onStyleChange: (styleId: string) => void
}

export default function StyleSelector({ selectedStyle, onStyleChange }: StyleSelectorProps) {
  const [customStyles, setCustomStyles] = useState<CustomStyle[]>([])

  useEffect(() => {
    setCustomStyles(getCustomStyles())
  }, [])

  const chipClass = (active: boolean) =>
    `px-3 py-2 rounded-full text-sm font-medium transition-colors ${
      active
        ? "bg-green-500 text-white"
        : "bg-white border border-gray-200 text-gray-600 hover:border-green-400"
    }`

  const selectedPreset = STYLE_PRESETS.find((p) => p.id === selectedStyle)
  const selectedCustom = customStyles.find((s) => `custom:${s.id}` === selectedStyle)

  return (
    <div className="space-y-3">
      <Label rightSlot={
        <Link href="/styles" className="text-xs text-blue-500 hover:text-blue-600">
          내 스타일 관리 &rarr;
        </Link>
      }>
        글 스타일
      </Label>

      <div className="flex flex-wrap gap-2">
        {STYLE_PRESETS.map((preset) => (
          <button
            key={preset.id}
            onClick={() => onStyleChange(preset.id)}
            className={chipClass(selectedStyle === preset.id)}
          >
            {preset.emoji} {preset.name}
          </button>
        ))}

        {customStyles.map((style) => (
          <button
            key={style.id}
            onClick={() => onStyleChange(`custom:${style.id}`)}
            className={chipClass(selectedStyle === `custom:${style.id}`)}
          >
            ✏️ {style.name}
          </button>
        ))}
      </div>

      <p className="text-xs text-gray-400">
        {selectedPreset?.description || (selectedCustom ? "내가 등록한 글 스타일로 작성해요" : "")}
      </p>
    </div>
  )
}
