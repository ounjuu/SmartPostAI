import { NextRequest, NextResponse } from "next/server"
import { exchangeCodeForToken } from "@/lib/tistory"

// GET: OAuth 콜백 처리 - code를 받아 토큰 교환 후 클라이언트로 전달
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code")
  const error = request.nextUrl.searchParams.get("error")

  if (error) {
    // 인증 거부 또는 오류 시 결과 페이지로 리다이렉트
    return NextResponse.redirect(
      new URL(`/result?tistory_error=${encodeURIComponent(error)}`, request.url)
    )
  }

  if (!code) {
    return NextResponse.redirect(
      new URL("/result?tistory_error=code_missing", request.url)
    )
  }

  try {
    const accessToken = await exchangeCodeForToken(code)

    // 토큰을 클라이언트에 전달하기 위해 결과 페이지로 리다이렉트
    // 토큰은 URL fragment(#)로 전달하여 서버 로그에 남지 않도록 함
    const redirectUrl = new URL("/result", request.url)
    // fragment는 서버에서 설정할 수 없으므로 query param으로 전달
    // 클라이언트에서 localStorage에 저장 후 URL에서 제거
    redirectUrl.searchParams.set("tistory_token", accessToken)

    return NextResponse.redirect(redirectUrl)
  } catch (error) {
    const message = error instanceof Error ? error.message : "토큰 교환 실패"
    return NextResponse.redirect(
      new URL(`/result?tistory_error=${encodeURIComponent(message)}`, request.url)
    )
  }
}
