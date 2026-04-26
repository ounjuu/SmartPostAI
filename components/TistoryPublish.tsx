"use client"

import { useState, useEffect } from "react"

interface TistoryPublishProps {
  title: string
  content: string
}

type PublishStatus = "idle" | "publishing" | "success" | "error"

export default function TistoryPublish({ title, content }: TistoryPublishProps) {
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [status, setStatus] = useState<PublishStatus>("idle")
  const [message, setMessage] = useState("")
  const [postUrl, setPostUrl] = useState("")

  // 컴포넌트 마운트 시 localStorage에서 토큰 확인
  useEffect(() => {
    const token = localStorage.getItem("tistory_access_token")
    if (token) {
      setAccessToken(token)
    }
  }, [])

  // URL에서 OAuth 콜백 파라미터 처리
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get("tistory_token")
    const error = params.get("tistory_error")

    if (token) {
      localStorage.setItem("tistory_access_token", token)
      setAccessToken(token)
      // URL에서 토큰 파라미터 제거
      params.delete("tistory_token")
      const newUrl = params.toString()
        ? `${window.location.pathname}?${params.toString()}`
        : window.location.pathname
      window.history.replaceState({}, "", newUrl)
    }

    if (error) {
      setStatus("error")
      setMessage(`티스토리 인증 실패: ${error}`)
      params.delete("tistory_error")
      const newUrl = params.toString()
        ? `${window.location.pathname}?${params.toString()}`
        : window.location.pathname
      window.history.replaceState({}, "", newUrl)
    }
  }, [])

  // 티스토리 OAuth 인증 시작
  const handleAuth = async () => {
    try {
      const res = await fetch("/api/tistory")
      const data = await res.json()

      if (data.error) {
        setStatus("error")
        setMessage(data.error)
        return
      }

      // 현재 편집 중인 글 보존을 위해 sessionStorage 유지한 채 이동
      window.location.href = data.authUrl
    } catch {
      setStatus("error")
      setMessage("인증 URL을 가져오는데 실패했습니다.")
    }
  }

  // 티스토리에 글 발행
  const handlePublish = async () => {
    if (!accessToken) return

    setStatus("publishing")
    setMessage("")

    try {
      const res = await fetch("/api/tistory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken, title, content }),
      })

      const data = await res.json()

      if (data.error) {
        // 토큰 만료 등의 경우 연동 해제
        if (res.status === 500 && data.error.includes("토큰")) {
          localStorage.removeItem("tistory_access_token")
          setAccessToken(null)
        }
        setStatus("error")
        setMessage(data.error)
        return
      }

      setStatus("success")
      setPostUrl(data.url || "")
      setMessage("티스토리에 발행되었습니다!")
    } catch {
      setStatus("error")
      setMessage("발행 중 오류가 발생했습니다.")
    }
  }

  // 연동 해제
  const handleDisconnect = () => {
    localStorage.removeItem("tistory_access_token")
    setAccessToken(null)
    setStatus("idle")
    setMessage("")
    setPostUrl("")
  }

  return (
    <div className="space-y-3">
      {/* 미연동 상태 */}
      {!accessToken && (
        <button
          onClick={handleAuth}
          className="w-full py-4 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 active:bg-orange-700 transition-colors"
        >
          티스토리 연동하기
        </button>
      )}

      {/* 연동 상태 */}
      {accessToken && status !== "success" && (
        <div className="space-y-2">
          <button
            onClick={handlePublish}
            disabled={status === "publishing"}
            className="w-full py-4 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 active:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === "publishing" ? "발행 중..." : "티스토리에 발행하기"}
          </button>
          <button
            onClick={handleDisconnect}
            className="w-full py-2 text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            티스토리 연동 해제
          </button>
        </div>
      )}

      {/* 발행 성공 */}
      {status === "success" && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-center space-y-2">
          <p className="text-sm font-medium text-orange-700">{message}</p>
          {postUrl && (
            <a
              href={postUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-sm text-orange-500 underline hover:text-orange-600"
            >
              발행된 글 보기
            </a>
          )}
          <button
            onClick={handleDisconnect}
            className="block mx-auto text-xs text-gray-400 hover:text-gray-600 transition-colors mt-1"
          >
            티스토리 연동 해제
          </button>
        </div>
      )}

      {/* 에러 메시지 */}
      {status === "error" && message && (
        <p className="text-xs text-red-500 text-center">{message}</p>
      )}

      {/* 안내 문구 */}
      {!accessToken && (
        <p className="text-xs text-gray-400 text-center leading-relaxed">
          티스토리 계정을 연동하면<br />
          글을 바로 발행할 수 있어요
        </p>
      )}
    </div>
  )
}
