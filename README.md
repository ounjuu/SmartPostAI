# HantolLog (SmartPostAI)

사진과 간단한 메모만 입력하면 AI가 네이버 블로그 + 티스토리 글을 자동 생성해주는 모바일 웹앱입니다.

🔗 **배포 URL**: https://smartpostai.netlify.app

## 주요 기능

### 글 생성
- 사진 업로드 (최대 5장) + 메모 입력 → AI가 블로그 글 자동 작성
- **발행 플랫폼 선택 방식**: 네이버 블로그 / 티스토리 중 선택해서 생성
- 결과 화면에서 다른 플랫폼 글도 추가 생성 가능 (네이버/티스토리 탭 전환)
- SEO 키워드 10~15개 자동 추천

### 기존 글 변환
- 이미 작성한 글을 붙여넣으면 한톨 말투·구조로 다시 다듬어줌
- 다른 플랫폼용으로 톤 변환할 때 활용

### 글 히스토리
- 생성한 글을 자동 저장 → 언제든 다시 열람 가능
- "다시 생성하기"로 같은 입력에서 새로운 결과 받기

### 스타일 프리셋 8종
| 프리셋 | 용도 |
|--------|------|
| 🍴 맛집·카페·여행 | 맛집/카페/여행 후기 |
| 📱 앱 추천·홍보 | 앱 소개 및 홍보 글 |
| 💻 개발 | 개발/IT 정보 글 |
| 📝 개발 회고록 | 사이드 프로젝트 회고 |
| 🍪 과자 추천 | 과자/간식 리뷰 |
| 🛍️ 쇼핑/구매 후기 | 옷·생활용품·가전 등 후기 |
| 🏋️ 운동/헬스 | 운동 기록·루틴·후기 |
| 📝 일상 | 일상 기록·잡담 |
| ✏️ 커스텀 | 내 글 샘플 학습 (최대 3개) |

### 카테고리별 입력 가이드
- 프리셋 선택 시 "어떤 정보를 넣으면 좋은지" 메모 입력란에 가이드 표시

### 복사 & 열기
- **서식 복사 → 네이버 블로그 열기** (HTML 서식 유지)
- **텍스트 복사 → 티스토리 열기** (기본 모드 붙여넣기용)
- 해시태그 별도 복사 지원

### 내 스타일 학습
- 기존 블로그 글 샘플을 등록하면 AI가 말투·구조·분위기를 학습
- 스타일당 최대 3개 샘플, localStorage 저장

### 접근 제어 & 비공개 운영
- 비밀번호 로그인 게이트 (Next.js middleware + httpOnly 쿠키, 30일 슬라이딩 세션)
- `robots.txt` / `noindex` 메타로 검색엔진 노출 차단
- Safari iOS 쿠키 즉시 만료 이슈 대응 완료

## 기술 스택

| 분류 | 기술 |
|------|------|
| Framework | Next.js 14 (App Router, TypeScript) |
| Styling | Tailwind CSS v4 (모바일 퍼스트) |
| AI | Google Gemini API (gemini-2.5-flash) |
| Deploy | Netlify |

## 프로젝트 구조

```
SmartPostAI/
├── app/
│   ├── layout.tsx              # 루트 레이아웃 (noindex 메타)
│   ├── page.tsx                # 메인 (사진 업로드 + 메모 + 스타일 + 플랫폼 선택)
│   ├── globals.css             # Tailwind CSS
│   ├── result/page.tsx         # 결과 미리보기 (네이버/티스토리 탭)
│   ├── convert/page.tsx        # 기존 글 변환
│   ├── history/page.tsx        # 글 히스토리 (다시 생성하기)
│   ├── styles/page.tsx         # 내 스타일 관리
│   ├── login/page.tsx          # 비밀번호 로그인 게이트
│   └── api/
│       ├── generate/route.ts   # Gemini API 엔드포인트
│       └── login/route.ts      # 로그인 인증 (httpOnly 쿠키 발급)
├── middleware.ts               # 비공개 접근 제어 (30일 슬라이딩 세션)
├── components/
│   ├── ui.tsx                  # 공통 UI (Label, Card, PageLayout 등)
│   ├── PhotoUploader.tsx       # 사진 업로드 (최대 5장)
│   ├── MemoInput.tsx           # 메모 입력 (카테고리별 가이드)
│   ├── StyleSelector.tsx       # 스타일 선택 칩 UI
│   ├── BlogPreview.tsx         # 글 미리보기 + 편집
│   ├── CopyAndOpen.tsx         # 복사 + 블로그 열기
│   └── KeywordPanel.tsx        # SEO 키워드 관리
├── lib/
│   ├── gemini.ts               # Gemini API 클라이언트 (503 자동 재시도)
│   ├── clipboard.ts            # 클립보드 + 딥링크 유틸
│   └── styles.ts               # 스타일 프리셋 + 커스텀 스타일 관리
└── package.json
```

## 시작하기

### 1. 설치

```bash
git clone https://github.com/ounjuu/SmartPostAI.git
cd SmartPostAI
npm install
```

### 2. 환경변수 설정

`.env.local` 파일을 생성하고 다음 값을 입력:

```
GEMINI_API_KEY=your_gemini_api_key
SITE_PASSWORD=your_site_password
```

| 변수 | 설명 | 필수 |
|------|------|------|
| `GEMINI_API_KEY` | Google Gemini API 키 ([Google AI Studio](https://aistudio.google.com)에서 무료 발급) | O |
| `SITE_PASSWORD` | 비공개 운영용 사이트 접속 비밀번호 | O |

### 3. 실행

```bash
npm run dev
```

http://localhost:3000 에서 확인

### 4. 빌드

```bash
npm run build
npm run start
```

## 사용 방법

1. 사진 업로드 + 메모 입력 (또는 둘 중 하나만)
2. 글 스타일 프리셋 선택
3. 발행 플랫폼 선택 (네이버 블로그 / 티스토리)
4. "블로그 글 생성하기" 클릭
5. 미리보기에서 내용 확인·수정 (필요 시 다른 플랫폼 글도 추가 생성)
6. 복사 버튼 클릭 → 블로그 앱에서 붙여넣기
