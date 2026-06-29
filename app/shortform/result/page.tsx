"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { PageLayout, PageHeader, Card } from "@/components/ui"
import ShortformVideo from "@/components/ShortformVideo"
import { SHORTFORM_PLATFORMS, type ShortformResult } from "@/lib/shortform"

type StoredShortform = ShortformResult & { photos?: string[]; memo?: string }

export default function ShortformResultPage() {
  const router = useRouter()
  const [data, setData] = useState<StoredShortform | null>(null)
  const [copied, setCopied] = useState<string>("")

  useEffect(() => {
    const raw = sessionStorage.getItem("generatedShortform")
    if (!raw) {
      router.replace("/shortform")
      return
    }
    try {
      setData(JSON.parse(raw))
    } catch {
      router.replace("/shortform")
    }
  }, [router])

  if (!data) return null

  const platformLabel = SHORTFORM_PLATFORMS.find((p) => p.id === data.platform)?.name || "숏폼"

  const buildScript = () => {
    const lines: string[] = []
    lines.push(`[제목] ${data.title}`)
    lines.push(`[길이] ${data.duration}`)
    lines.push(`[BGM] ${data.bgm}`)
    lines.push("")
    lines.push(`🎬 훅(0~3초): ${data.hook}`)
    lines.push("")
    data.scenes.forEach((s, i) => {
      lines.push(`#${i + 1}컷`)
      lines.push(`자막: ${s.caption}`)
      lines.push(`멘트: ${s.narration}`)
      lines.push(`화면: ${s.shot}`)
      lines.push("")
    })
    return lines.join("\n").trim()
  }

  const buildCaption = () => {
    const tags = data.hashtags.map((t) => `#${t.replace(/^#/, "")}`).join(" ")
    return `${data.caption}\n\n${tags}`.trim()
  }

  const copy = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(key)
      setTimeout(() => setCopied(""), 2000)
    } catch {
      setCopied("error")
      setTimeout(() => setCopied(""), 2000)
    }
  }

  return (
    <PageLayout>
      <PageHeader title={`${platformLabel} 구성안`} onBack={() => router.push("/shortform")} />

      <div className="space-y-4">
        <Card>
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-semibold text-gray-400">제목</p>
            <span className="text-xs font-medium text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
              {platformLabel}
            </span>
          </div>
          <p className="text-base font-bold text-gray-900">{data.title}</p>
          <div className="flex gap-3 mt-2 text-xs text-gray-500">
            <span>⏱ {data.duration}</span>
            <span>🎵 {data.bgm}</span>
          </div>
        </Card>

        <Card className="border-red-200 bg-red-50/40">
          <p className="text-xs font-semibold text-red-400 mb-1">3초 훅</p>
          <p className="text-base font-semibold text-gray-900">{data.hook}</p>
        </Card>

        <div className="space-y-3">
          <p className="text-sm font-semibold text-gray-700">컷별 구성 ({data.scenes.length}컷)</p>
          {data.scenes.map((s, i) => (
            <Card key={i}>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 flex items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold">
                  {i + 1}
                </span>
                <span className="text-sm font-bold text-gray-900">{s.caption}</span>
              </div>
              <p className="text-sm text-gray-700">🎙 {s.narration}</p>
              <p className="text-xs text-gray-400 mt-1">🎬 {s.shot}</p>
            </Card>
          ))}
        </div>

        <Card>
          <p className="text-xs font-semibold text-gray-400 mb-1">유튜브 설명란 캡션</p>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{data.caption}</p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {data.hashtags.map((t, i) => (
              <span key={i} className="text-xs text-blue-500">
                #{t.replace(/^#/, "")}
              </span>
            ))}
          </div>
        </Card>

        <Card>
          <p className="text-sm font-semibold text-gray-700 mb-3">슬라이드 영상</p>
          <ShortformVideo
            photos={data.photos || []}
            hook={data.hook}
            scenes={data.scenes}
          />
        </Card>

        {copied && (
          <p className="text-center text-sm text-green-600">
            {copied === "error" ? "복사에 실패했어요" : "복사됐어요!"}
          </p>
        )}

        <div className="space-y-2 pt-2">
          <button
            onClick={() => copy("script", buildScript())}
            className="w-full py-3 bg-red-500 text-white font-medium rounded-xl hover:bg-red-600 active:bg-red-700 transition-colors"
          >
            전체 대본 복사
          </button>
          <button
            onClick={() => copy("caption", buildCaption())}
            className="w-full py-3 bg-gray-100 text-gray-600 font-medium rounded-xl hover:bg-gray-200 transition-colors"
          >
            캡션 + 해시태그 복사
          </button>
        </div>
      </div>
    </PageLayout>
  )
}
