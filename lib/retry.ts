const RETRYABLE_STATUSES = new Set([429, 500, 502, 503, 504])

function isRetryable(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false
  const status = (error as { status?: number }).status
  return typeof status === "number" && RETRYABLE_STATUSES.has(status)
}

export async function callWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 2
): Promise<T> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      if (attempt === maxRetries || !isRetryable(error)) throw error
      const delayMs = 1000 * (attempt + 1)
      await new Promise((resolve) => setTimeout(resolve, delayMs))
    }
  }
  throw new Error("재시도 한도를 초과했습니다.")
}

export function isOverloadedError(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false
  const status = (error as { status?: number }).status
  return status === 429 || status === 503
}
