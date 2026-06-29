"use client"

import { useRef, useState } from "react"
import type { ShortformScene } from "@/lib/shortform"

interface ShortformVideoProps {
  photos: string[]
  hook: string
  scenes: ShortformScene[]
}

// 9:16 세로 영상 규격
const W = 720
const H = 1280
const FPS = 30
const SLIDE_SEC = 3 // 컷당 노출 시간(초)

interface Slide {
  img: HTMLImageElement | null
  text: string
  dur: number
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

function pickMimeType(): string | null {
  if (typeof MediaRecorder === "undefined") return null
  const candidates = [
    "video/mp4;codecs=h264",
    "video/mp4",
    "video/webm;codecs=vp9",
    "video/webm;codecs=vp8",
    "video/webm",
  ]
  return candidates.find((t) => MediaRecorder.isTypeSupported(t)) || null
}

// 캔버스 폭에 맞춰 텍스트 줄바꿈
function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/)
  const lines: string[] = []
  let line = ""
  for (const word of words) {
    const test = line ? `${line} ${word}` : word
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line)
      line = word
    } else {
      line = test
    }
  }
  if (line) lines.push(line)
  return lines
}

function drawCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, zoom: number) {
  const scale = Math.max(W / img.width, H / img.height) * zoom
  const dw = img.width * scale
  const dh = img.height * scale
  ctx.drawImage(img, (W - dw) / 2, (H - dh) / 2, dw, dh)
}

function drawCaption(ctx: CanvasRenderingContext2D, text: string, big: boolean) {
  if (!text) return
  const fontSize = big ? 68 : 56
  ctx.font = `bold ${fontSize}px -apple-system, "Noto Sans KR", sans-serif`
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"

  const lines = wrapLines(ctx, text, W - 120)
  const lineH = fontSize * 1.3
  const baseY = big ? H / 2 : H - 220
  const startY = baseY - ((lines.length - 1) * lineH) / 2

  lines.forEach((ln, i) => {
    const y = startY + i * lineH
    ctx.lineWidth = 10
    ctx.strokeStyle = "rgba(0,0,0,0.85)"
    ctx.strokeText(ln, W / 2, y)
    ctx.fillStyle = "#ffffff"
    ctx.fillText(ln, W / 2, y)
  })
}

export default function ShortformVideo({ photos, hook, scenes }: ShortformVideoProps) {
  const [building, setBuilding] = useState(false)
  const [progress, setProgress] = useState(0)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [error, setError] = useState("")
  const cancelRef = useRef(false)

  const build = async () => {
    setError("")
    setVideoUrl(null)

    const mimeType = pickMimeType()
    if (!mimeType || typeof HTMLCanvasElement.prototype.captureStream !== "function") {
      setError("이 브라우저는 영상 만들기를 지원하지 않아요. 크롬(안드로이드/PC)에서 시도해주세요.")
      return
    }

    setBuilding(true)
    setProgress(0)
    cancelRef.current = false

    try {
      const imgs = await Promise.all(
        photos.map((p) => loadImage(p).catch(() => null))
      )
      const validImgs = imgs.filter((x): x is HTMLImageElement => !!x)

      // 슬라이드 구성: 훅 → 컷별 자막
      const slides: Slide[] = []
      slides.push({
        img: validImgs[0] || null,
        text: hook,
        dur: SLIDE_SEC,
      })
      scenes.forEach((s, i) => {
        slides.push({
          img: validImgs.length ? validImgs[i % validImgs.length] : null,
          text: s.caption,
          dur: SLIDE_SEC,
        })
      })

      const totalSec = slides.reduce((sum, s) => sum + s.dur, 0)

      const canvas = document.createElement("canvas")
      canvas.width = W
      canvas.height = H
      const ctx = canvas.getContext("2d")!

      const stream = canvas.captureStream(FPS)
      const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 6_000_000 })
      const chunks: BlobPart[] = []
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data)
      }

      const done = new Promise<Blob>((resolve) => {
        recorder.onstop = () => resolve(new Blob(chunks, { type: mimeType }))
      })

      recorder.start()
      const startT = performance.now()

      const renderFrame = () => {
        if (cancelRef.current) {
          recorder.stop()
          return
        }
        const elapsed = (performance.now() - startT) / 1000
        setProgress(Math.min(99, Math.round((elapsed / totalSec) * 100)))

        // 현재 슬라이드 찾기
        let acc = 0
        let slide = slides[slides.length - 1]
        let localT = 0
        for (const s of slides) {
          if (elapsed < acc + s.dur) {
            slide = s
            localT = elapsed - acc
            break
          }
          acc += s.dur
        }
        const isHook = slide === slides[0]

        // 배경
        ctx.fillStyle = "#111111"
        ctx.fillRect(0, 0, W, H)

        // 사진 (살짝 켄번스 줌)
        if (slide.img) {
          const zoom = 1.0 + 0.08 * (localT / slide.dur)
          drawCover(ctx, slide.img, zoom)
        }

        // 하단 그라데이션 (자막 가독성)
        const grad = ctx.createLinearGradient(0, H * 0.45, 0, H)
        grad.addColorStop(0, "rgba(0,0,0,0)")
        grad.addColorStop(1, "rgba(0,0,0,0.75)")
        ctx.fillStyle = grad
        ctx.fillRect(0, 0, W, H)

        // 페이드 인 (앞 0.35초)
        const fade = Math.min(1, localT / 0.35)
        ctx.globalAlpha = fade
        drawCaption(ctx, slide.text, isHook)
        ctx.globalAlpha = 1

        if (elapsed >= totalSec) {
          recorder.stop()
          return
        }
        requestAnimationFrame(renderFrame)
      }
      requestAnimationFrame(renderFrame)

      const blob = await done
      stream.getTracks().forEach((t) => t.stop())

      if (cancelRef.current) {
        setBuilding(false)
        return
      }

      setProgress(100)
      setVideoUrl(URL.createObjectURL(blob))
    } catch {
      setError("영상을 만드는 중 문제가 생겼어요. 사진을 줄이거나 다시 시도해주세요.")
    } finally {
      setBuilding(false)
    }
  }

  const ext = videoUrl && videoUrl.includes("mp4") ? "mp4" : "webm"

  return (
    <div className="space-y-3">
      {!videoUrl && (
        <button
          onClick={build}
          disabled={building}
          className="w-full py-3 bg-gray-900 text-white font-medium rounded-xl disabled:bg-gray-400 hover:bg-black transition-colors"
        >
          {building ? `영상 만드는 중... ${progress}%` : "🎞 슬라이드 영상 만들기"}
        </button>
      )}

      {building && (
        <button
          onClick={() => {
            cancelRef.current = true
          }}
          className="w-full py-2 text-sm text-gray-400 hover:text-gray-600"
        >
          취소
        </button>
      )}

      {error && (
        <p className="text-sm text-red-500 text-center">{error}</p>
      )}

      {videoUrl && (
        <div className="space-y-2">
          <video
            src={videoUrl}
            controls
            playsInline
            className="w-full rounded-xl bg-black aspect-[9/16] object-contain"
          />
          <a
            href={videoUrl}
            download={`shortform.${ext}`}
            className="block w-full py-3 bg-gray-900 text-white font-medium rounded-xl text-center hover:bg-black transition-colors"
          >
            영상 저장하기
          </a>
          <button
            onClick={() => setVideoUrl(null)}
            className="w-full py-2 text-sm text-gray-400 hover:text-gray-600"
          >
            다시 만들기
          </button>
        </div>
      )}

      <p className="text-xs text-gray-400 text-center leading-relaxed">
        사진과 자막으로 만든 무음 슬라이드 영상이에요. BGM·정밀 편집은 영상 앱에서 마무리하세요.
        <br />
        (iPhone Safari는 미지원일 수 있어요 · 크롬 권장)
      </p>
    </div>
  )
}
