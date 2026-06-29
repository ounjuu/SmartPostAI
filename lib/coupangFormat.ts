// 쿠팡 파트너스 × 쓰레드(Threads) 글 포맷 — 서버 의존성 없는 순수 모듈
// (생성기 결과를 실제 게시물 배열로 조립 + 링크 주입 + 500자 분할)

/** 쿠팡 파트너스 대가성 고지 (법적 필수, 코드 고정) */
export const COUPANG_DISCLOSURE =
  "이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다."

/** 쓰레드 게시물 1개 권장 글자 수 상한 */
export const THREADS_MAX = 500

export interface CoupangProduct {
  /** 제품명 (사용자 입력, AI 추천 문구 작성용) */
  name: string
  /** 쿠팡 파트너스 단축 링크 (사용자 입력, 없으면 자리만 표시) */
  link: string
}

export interface CoupangProductPitch {
  /** 👇 ~ 이거! 👇 형태의 헤드라인 */
  headline: string
  /** 추천 이유 한두 줄 */
  reason: string
}

export interface CoupangResult {
  /** 1편: 훅 게시물 (제품 언급 없이 경험·감정만) */
  hookPost: string
  /** 2편 도입 한 줄 ([광고] 표기는 코드가 붙임) */
  bodyIntro: string
  /** 준비물/포인트 라벨 (예: "🛒 준비물", "✅ 체크포인트") */
  prepLabel: string
  /** 준비물/포인트 항목 */
  prepItems: string[]
  /** 제품별 추천 문구 (입력한 제품 순서와 1:1) */
  productPitches: CoupangProductPitch[]
  /** 레시피/사용법 라벨 (예: "👨‍🍳 레시피", "📝 사용법") */
  stepsLabel: string
  /** 레시피/사용법 단계 */
  steps: string[]
  /** 해시태그 */
  hashtags: string[]
}

/** 숫자를 키캡 이모지로 (1 → 1️⃣). 1~9만 지원, 그 외는 "n." */
function keycap(n: number): string {
  if (n >= 1 && n <= 9) return `${n}️⃣`
  return `${n}.`
}

/** 블록들을 순서 유지하며 maxLen 이하 게시물로 묶기 (블록 자체가 길면 줄 단위로 분할) */
function packBlocks(blocks: string[], maxLen = THREADS_MAX): string[] {
  const out: string[] = []
  let cur = ""
  const flush = () => {
    if (cur.trim()) out.push(cur.trim())
    cur = ""
  }
  const add = (piece: string) => {
    if (!cur) {
      cur = piece
    } else if ((cur + "\n\n" + piece).length <= maxLen) {
      cur += "\n\n" + piece
    } else {
      flush()
      cur = piece
    }
  }

  for (const block of blocks) {
    if (block.length <= maxLen) {
      add(block)
      continue
    }
    // 한 블록이 상한을 넘으면 줄 단위로 쪼갬
    let chunk = ""
    for (const line of block.split("\n")) {
      if (!chunk) chunk = line
      else if ((chunk + "\n" + line).length <= maxLen) chunk += "\n" + line
      else {
        add(chunk)
        chunk = line
      }
    }
    if (chunk) add(chunk)
  }
  flush()
  return out
}

/**
 * 생성 결과 + 제품 링크를 실제 쓰레드 게시물 배열로 조립.
 * - 1편: 훅
 * - 2편~: [광고] 도입 → 준비물 → 제품 추천(링크 주입) → 레시피 → 대가성 고지
 */
export function assembleCoupangPosts(
  result: CoupangResult,
  products: CoupangProduct[]
): string[] {
  const posts: string[] = []

  // 1편: 훅
  const hookPosts = packBlocks([result.hookPost?.trim() || ""].filter(Boolean))
  posts.push(...hookPosts)

  // 2편~: 본론 섹션 구성
  const sections: string[] = []

  const intro = result.bodyIntro?.trim() || ""
  sections.push(intro ? `[광고] ${intro}` : "[광고]")

  if (result.prepItems?.length) {
    const label = result.prepLabel?.trim() || "🛒 준비물"
    sections.push([label, ...result.prepItems.map((i) => `-${i}`)].join("\n"))
  }

  result.productPitches?.forEach((p, i) => {
    const link = products[i]?.link?.trim()
    const lines = [`👇 ${p.headline?.trim() || "내가 쓴 건 이거!"} 👇`]
    if (p.reason?.trim()) lines.push(p.reason.trim())
    lines.push(link ? `(${link})` : "(여기에 쿠팡 파트너스 링크)")
    sections.push(lines.join("\n"))
  })

  if (result.steps?.length) {
    const label = result.stepsLabel?.trim() || "👨‍🍳 레시피"
    const stepLines = result.steps.map((s, i) => `${keycap(i + 1)} ${s}`)
    sections.push([label, ...stepLines].join("\n"))
  }

  // 대가성 고지는 마지막 블록 (코드 고정)
  sections.push(COUPANG_DISCLOSURE)

  posts.push(...packBlocks(sections))

  return posts
}
