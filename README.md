# HantolLog (SmartPostAI)

사진과 메모만 입력하면 AI가 네이버 블로그·티스토리 글을 자동 생성해주는 모바일 웹앱.

🔗 https://smartpostai.netlify.app

## 주요 기능

- **글 생성**: 사진(최대 5장) + 메모 → 네이버 / 티스토리 중 선택해 생성, SEO 키워드·해시태그 자동 추천
- **결과 화면**: 네이버/티스토리 탭 전환으로 다른 플랫폼 글 추가 생성, 티스토리는 마크다운 자동 제거
- **기존 글 변환**: 작성한 글을 친근한 톤으로 다듬거나 네이버 ↔ 티스토리 톤 변환
- **히스토리**: 생성한 글 자동 저장 (localStorage, 최대 20개) + 다시 생성하기
- **복사 & 발행**: 서식 복사 → 네이버 앱 / 텍스트 복사 → 티스토리 / 해시태그 별도 복사
- **비공개 운영**: 비밀번호 게이트(middleware + httpOnly 쿠키, 30일 슬라이딩) + `robots.txt`/`noindex`

### 스타일 프리셋

🍴 맛집·카페·여행 / 📱 앱 추천·홍보 / 💻 개발 / 📝 개발 회고록 / 🍪 과자 추천 / 🛍️ 쇼핑·구매 후기 / 🏋️ 운동·헬스 / 📝 일상 / ✏️ 커스텀(내 글 샘플 학습, 스타일당 최대 3개)

프리셋별 메모 입력 가이드 제공.

## 기술 스택

Next.js 14 (App Router, TypeScript) · Tailwind CSS v4 · Google Gemini API (gemini-2.5-flash) · Netlify

## 프로젝트 구조

```
app/
├── page.tsx / result / convert / history / styles / login
├── api/(generate | convert | login)
└── icon.svg
middleware.ts          # 접근 제어 (30일 슬라이딩 세션)
components/            # PhotoUploader, MemoInput, StyleSelector, BlogPreview, CopyAndOpen, KeywordPanel, ui
lib/                   # gemini, convert, styles, history, markdown, retry, clipboard
public/robots.txt
```

## 시작하기

```bash
git clone https://github.com/ounjuu/SmartPostAI.git
cd SmartPostAI
npm install
npm run dev    # http://localhost:3000
```

`.env.local`:

| 변수 | 설명 |
|------|------|
| `GEMINI_API_KEY` | Google Gemini API 키 ([Google AI Studio](https://aistudio.google.com)) |
| `SITE_PASSWORD` | 비공개 운영용 사이트 접속 비밀번호 |

## 사용 방법

1. 사진·메모 입력 → 스타일·플랫폼 선택 → 생성
2. 미리보기에서 수정 (필요 시 다른 플랫폼 글 추가 생성)
3. 복사 → 블로그 앱에서 붙여넣기
