"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const from = searchParams.get("from") || "/"
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password.trim()) return
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "로그인 실패")
      }
      router.replace(from)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="max-w-sm mx-auto px-4 py-12">
      <div className="text-center mb-6">
        <h1 className="text-xl font-bold text-gray-900">SmartPostAI</h1>
        <p className="text-sm text-gray-500 mt-1">접속 비밀번호를 입력해주세요</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
          inputMode="numeric"
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-center text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-green-400"
          placeholder="••••"
        />
        {error && (
          <div className="p-2 bg-red-50 text-red-600 text-xs rounded-lg text-center">
            {error}
          </div>
        )}
        <button
          type="submit"
          disabled={loading || !password.trim()}
          className="w-full py-3 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600 active:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {loading ? "확인 중..." : "들어가기"}
        </button>
      </form>
    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="max-w-sm mx-auto px-4 py-12 text-center text-gray-400 text-sm">로딩 중...</main>}>
      <LoginForm />
    </Suspense>
  )
}
