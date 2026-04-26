// 티스토리 API 클라이언트

const TISTORY_AUTH_URL = "https://www.tistory.com/oauth/authorize"
const TISTORY_TOKEN_URL = "https://www.tistory.com/oauth/access_token"
const TISTORY_WRITE_URL = "https://www.tistory.com/apis/post/write"

export function getTistoryAuthUrl(): string {
  const appId = process.env.TISTORY_APP_ID
  const redirectUri = process.env.TISTORY_REDIRECT_URI

  if (!appId || !redirectUri) {
    throw new Error("티스토리 환경변수가 설정되지 않았습니다.")
  }

  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    response_type: "code",
  })

  return `${TISTORY_AUTH_URL}?${params.toString()}`
}

export async function exchangeCodeForToken(code: string): Promise<string> {
  const appId = process.env.TISTORY_APP_ID
  const secretKey = process.env.TISTORY_SECRET_KEY
  const redirectUri = process.env.TISTORY_REDIRECT_URI

  if (!appId || !secretKey || !redirectUri) {
    throw new Error("티스토리 환경변수가 설정되지 않았습니다.")
  }

  const params = new URLSearchParams({
    client_id: appId,
    client_secret: secretKey,
    redirect_uri: redirectUri,
    code,
    grant_type: "authorization_code",
  })

  const response = await fetch(`${TISTORY_TOKEN_URL}?${params.toString()}`)

  if (!response.ok) {
    throw new Error("티스토리 토큰 교환에 실패했습니다.")
  }

  const text = await response.text()

  // 응답이 JSON일 수도 있고 query string 형태일 수도 있음
  try {
    const json = JSON.parse(text)
    if (json.access_token) return json.access_token
    throw new Error(json.error_description || "토큰을 받지 못했습니다.")
  } catch {
    // query string 형태: access_token=xxx
    const tokenParams = new URLSearchParams(text)
    const token = tokenParams.get("access_token")
    if (token) return token
    throw new Error("티스토리 토큰 파싱에 실패했습니다.")
  }
}

interface PublishResult {
  postId: string
  url: string
}

export async function publishToTistory(
  accessToken: string,
  title: string,
  content: string
): Promise<PublishResult> {
  const blogName = process.env.TISTORY_BLOG_NAME

  if (!blogName) {
    throw new Error("TISTORY_BLOG_NAME이 설정되지 않았습니다.")
  }

  const params = new URLSearchParams({
    access_token: accessToken,
    blogName,
    title,
    content,
    visibility: "3", // 발행
    category: "0",   // 미분류
  })

  const response = await fetch(TISTORY_WRITE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`티스토리 발행 실패: ${text}`)
  }

  const data = await response.json()

  if (data.tistory?.status !== "200") {
    throw new Error(data.tistory?.error_message || "티스토리 발행에 실패했습니다.")
  }

  return {
    postId: data.tistory.postId,
    url: data.tistory.url,
  }
}
