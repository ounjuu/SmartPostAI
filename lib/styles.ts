interface StylePreset {
  id: string
  name: string
  description: string
  emoji: string
  promptInstruction: string
  examplePost: string
}

const HANTOL_TONE_RULES = `
[한톨 말투 규칙 — 모든 글에 공통 적용]
- 시작은 항상 "안녕하세요 한톨입니다 😊" 로 시작
- 어미는 ~해요, ~이에요, ~더라고요, ~거든요, ~네요, ~죠 위주로 친근하게
- 1인칭 본인 경험을 자주 섞기 ("저도 ~", "제가 ~", "저처럼 ~")
- 독자 호명은 "~하시는 분들", "~하셨던 분들께" 처럼 정중하게
- 가벼운 자조 유머 OK (예: "저도 그랬거든요 😂")
- 마무리는 "✍️ 마무리" 섹션으로 감성적·개인 경험 한두 줄 마무리
- 마지막에 "오늘도 한 톨, 저장 완료입니다 🌾" 시그니처 한 줄 추가
- 그 아래 해시태그 8~12개 (#한톨로그 항상 포함)
- 박스 강조는 ⚠️ 💡 ✅ 👉 📌 ✨ 같은 이모지로 시작
- 단계 설명은 ① ② ③ 동그라미 숫자 사용
- 표는 비교/정리에 적극 활용 (HTML <table>)
- 문단은 짧게 (1~3줄), 줄바꿈 자주`

export const STYLE_PRESETS: StylePreset[] = [
  {
    id: "restaurant",
    name: "맛집",
    description: "맛집/카페 후기",
    emoji: "🍴",
    promptInstruction: `한톨로그의 맛집 후기 글로 작성해주세요.
${HANTOL_TONE_RULES}

[맛집 글 구조]
- 도입: 어떻게 가게 됐는지 짧은 스토리
- 📍 매장 정보 (위치, 영업시간, 주차, 가격대) 박스로 정리
- 메뉴별로 섹션 분리 (🍝 🍜 🥗 등 음식별 이모지 + 메뉴명)
- 각 메뉴마다 맛/식감/양/가격 구체적으로 묘사
- 💬 솔직 후기 섹션 (별점 ⭐ 1~5개로 맛/분위기/가격/서비스 평가)
- 추천 대상 명시 ("데이트로", "친구 모임으로" 등)
- 사진이 있으면 사진별 설명 자연스럽게 연결
- 메모 없이 사진만 있으면 사진 속 음식·매장을 보고 자연스럽게 추측해서 작성`,
    examplePost: `안녕하세요 한톨입니다 😊<br>
주말에 동네 산책하다가 우연히 발견한 곳이 있는데요,<br>
들어가자마자 분위기에 반해서 그날 바로 단골 등극시켰어요 😂<br>
오늘은 그 가게 후기를 가져왔습니다!<br><br>

<b>📍 매장 정보</b><br>
· 위치: 서울 ○○구 ○○동<br>
· 영업시간: 11:30 ~ 22:00 (브레이크타임 15:00~17:00)<br>
· 주차: 건물 지하 1시간 무료<br>
· 가격대: 1인 2~3만원<br><br>

평일 점심에 갔는데도 자리가 거의 다 차 있더라고요 😮<br>
다행히 마지막 자리에 앉을 수 있었어요!<br><br>

<b>🍝 시그니처 트러플 파스타 (19,000원)</b><br><br>

대표 메뉴라길래 바로 시켰는데요,<br>
첫입에 <b>트러플 향이 진짜 미쳤어요</b> 🤤<br>
크림이 무겁지 않고 고소해서 면에 잘 감기더라고요.<br>
면도 알덴테로 딱 맞게 익어서 한 젓가락씩 멈출 수가 없었어요.<br><br>

<b>🥗 루꼴라 샐러드 (12,000원)</b><br><br>

파스타만 먹으면 느끼할 것 같아서 같이 시켰어요.<br>
발사믹 드레싱이 새콤달콤해서 입가심으로 딱이었어요 👍<br><br>

<b>💬 솔직 후기</b><br><br>

✅ 맛 ⭐⭐⭐⭐⭐<br>
✅ 분위기 ⭐⭐⭐⭐⭐<br>
✅ 가격 ⭐⭐⭐⭐<br>
✅ 서비스 ⭐⭐⭐⭐⭐<br><br>

가성비까진 아니지만 분위기랑 맛 생각하면 충분히 값어치 있어요.<br>
직원분들도 친절하셔서 기분 좋게 식사했습니다 😊<br><br>

<b>📌 이런 분께 추천해요</b><br>
· 분위기 좋은 곳에서 데이트하시는 분<br>
· 트러플 파스타 좋아하시는 분<br>
· 조용한 점심 식사 찾으시는 분<br><br>

<b>✍️ 마무리</b><br><br>

요즘 동네에서 새로운 가게 찾는 재미에 빠졌는데요,<br>
이 집은 한 번 더 가도 후회 없을 것 같아요 😂<br>
주변 사시는 분들 한 번씩 들러보세요!<br><br>

오늘도 한 톨, 저장 완료입니다 🌾<br><br>

#맛집 #파스타맛집 #데이트맛집 #동네맛집 #트러플파스타 #점심맛집 #한톨로그 #일상기록`,
  },
  {
    id: "product",
    name: "앱 추천",
    description: "앱 추천/리뷰",
    emoji: "📱",
    promptInstruction: `한톨로그의 앱 추천/리뷰 글로 작성해주세요.
${HANTOL_TONE_RULES}

[앱 추천 글 구조]
- 도입: 왜 이 앱을 알게 됐는지, 어떤 고민이 있었는지 공감 포인트
- 📱 앱 한 줄 소개 ("한 줄로 말하면 → ~")
- 💡 어떤 점이 좋았나요? 섹션 (① ② ③ 으로 핵심 장점 3가지)
- 각 장점마다 본인 경험과 함께 구체적으로 설명
- ⚠️ 아쉬운 점도 솔직하게 1~2개
- 📌 이런 분께 추천해요 ✓ 체크리스트로 정리
- 사진(앱 스크린샷)마다 어떤 화면인지 자연스럽게 설명
- 메모 없이 스크린샷만 있으면 화면 속 UI를 보고 어떤 앱인지 추측해서 작성`,
    examplePost: `안녕하세요 한톨입니다 😊<br>
요즘 매일 쓰는 앱 중에 정말 만족하면서 쓰고 있는 게 있어서<br>
오늘은 그 얘기를 해보려고 해요.<br>
저처럼 메모 앱 고민 많이 하셨던 분들께 도움이 될 것 같아요!<br><br>

<b>📱 이 앱이 뭔가요?</b><br><br>

한 줄로 말하면 → <b>"메모를 자동으로 정리해주는 똑똑한 앱"</b>이에요.<br><br>

저도 처음엔 "또 비슷한 메모앱이겠지" 했거든요 😂<br>
그런데 써보니까 진짜 다르더라고요.<br><br>

<b>💡 어떤 점이 좋았나요?</b><br><br>

<b>① UI가 정말 깔끔해요</b><br><br>

군더더기 없이 딱 필요한 것만 있어요.<br>
복잡한 기능 없이 직관적이라 처음 써도 헤맬 일이 없더라고요.<br>
첫 화면 켰을 때 "어 이거 뭔가 다른데?" 싶었어요 😮<br><br>

<b>② 자동 정리 기능이 똑똑해요</b><br><br>

이 부분이 진짜 신기했는데요,<br>
메모를 쓰면 자동으로 카테고리가 분류돼요.<br>
태그 일일이 달 필요 없이 알아서 정리해주니까 손이 갈 일이 거의 없어요.<br><br>

<b>③ 무료로도 충분히 쓸 수 있어요</b><br><br>

유료 결제 없이도 핵심 기능은 다 쓸 수 있어요.<br>
저는 일단 무료로 써보다가 만족스러워서 Pro로 업그레이드했는데,<br>
무료로도 일상 메모 용도로는 부족함 없어요 👍<br><br>

<b>⚠️ 아쉬운 점도 있긴 해요</b><br><br>

· 다크모드가 아직 어색한 부분이 있어요<br>
· 동기화가 가끔 살짝 느릴 때가 있더라고요<br><br>

그래도 전체적으로 보면 굉장히 만족스러운 앱이에요!<br><br>

<b>📌 이런 분께 추천해요</b><br><br>

✓ 메모를 자주 하시는 분<br>
✓ 일정·아이디어 정리가 필요하신 분<br>
✓ 깔끔한 UI 좋아하시는 분<br>
✓ 무료로 시작해보고 싶은 분<br><br>

<b>✍️ 마무리</b><br><br>

처음 써봤을 때 "왜 이걸 이제 알았지?" 싶었거든요 😂<br>
저처럼 메모 앱 고민이셨던 분들께<br>
조금이라도 도움이 됐으면 좋겠습니다 😊<br><br>

오늘도 한 톨, 저장 완료입니다 🌾<br><br>

#앱추천 #메모앱 #생산성앱 #일상앱 #앱리뷰 #추천앱 #한톨로그 #일상기록`,
  },
  {
    id: "tech",
    name: "개발",
    description: "개발/IT 정보",
    emoji: "💻",
    promptInstruction: `한톨로그의 개발/IT 정보 글로 작성해주세요.
${HANTOL_TONE_RULES}

[개발 글 구조]
- 도입: 본인 경험·상황 공유 + 글 쓰는 이유
- 번호 섹션 (1️⃣ 2️⃣ 3️⃣ ...) 으로 큰 챕터 구분
- 각 챕터 도입에 짧은 한두 줄 설명 후 본론
- 비교는 HTML <table> 로 정리
- 코드는 <pre><code> 태그로 감싸기 (주석 포함)
- 핵심 포인트는 박스(⚠️ 💡 ✅ 👉 📌)로 강조
- 마지막에 📌 핵심 요약 불릿으로 정리
- ✍️ 마무리 섹션에서 개인 회고 한두 줄
- 친근하지만 정보의 정확성은 유지 (~합니다, ~입니다 섞어도 OK)
- 메모 없이 스크린샷만 있으면 코드/화면을 보고 무슨 주제인지 추측해서 작성`,
    examplePost: `안녕하세요 한톨입니다 😊<br>
요즘 개발하면서 AI 도구를 안 쓰는 분들이 거의 없으실 것 같은데요,<br>
저도 ChatGPT, Gemini 쓰다가 Claude로 넘어온 지 꽤 됐는데<br>
Claude Code라는 도구를 알게 되고 나서부터는 진짜 코딩 방식이 많이 바뀌었어요.<br><br>

그런데 처음에 "Claude랑 Claude Code가 다른 거야?"부터 시작해서<br>
무료로 쓸 수 있는지, ChatGPT랑 뭐가 다른지 헷갈리는 분들이 많더라고요.<br>
저도 그랬거든요 😂<br>
그래서 이번 글에서는 처음 접하시는 분들도 이해할 수 있도록 하나씩 정리해보려고 합니다!<br><br>

<b>1️⃣ Claude vs Claude Code — 뭐가 달라요?</b><br><br>

가장 많이 헷갈리는 부분이 바로 이거인 것 같아요.<br>
결론부터 말하면 이렇게 생각하시면 됩니다.<br><br>

🧠 <b>Claude (claude.ai)</b> → 웹에서 대화하는 AI 챗봇<br>
💻 <b>Claude Code</b> → 터미널·IDE에서 동작하는 AI 코딩 에이전트<br><br>

비유하자면,<br>
👉 Claude는 옆에서 조언해주는 똑똑한 동료<br>
👉 Claude Code는 내 컴퓨터에서 직접 코드를 짜고 파일을 수정하는 자동화 도구<br><br>

Claude는 채팅창에 코드를 붙여넣으면 설명해주거나 수정해주죠.<br>
반면 Claude Code는 프로젝트 폴더를 직접 열고, 파일을 읽고, 코드를 수정하고, 터미널 명령어까지 실행해요.<br>
"이 기능 추가해줘"라고 하면 진짜로 파일을 열어서 직접 짜주는 느낌이랄까요 😮<br><br>

<table border="1" style="border-collapse:collapse"><tr><th>구분</th><th>Claude (claude.ai)</th><th>Claude Code</th></tr><tr><td>사용 방법</td><td>웹 브라우저, 앱</td><td>터미널, VS Code</td></tr><tr><td>주요 기능</td><td>대화, 질의응답, 코드 설명</td><td>파일 수정, 코드 자동 작성</td></tr><tr><td>파일 접근</td><td>붙여넣기 필요</td><td>프로젝트 폴더 직접 탐색</td></tr><tr><td>자동화</td><td>낮음</td><td>높음 (에이전트형)</td></tr></table><br>

<b>2️⃣ 무료로 쓸 수 있나요?</b><br><br>

네, 무료로 쓸 수 있어요! 다만 플랜별로 제한이 있습니다 😅<br><br>

<b>⚠️ 무료 플랜 주의사항</b><br>
· 무료 플랜도 Claude Code를 쓸 수 있긴 한데, 사용량 한도가 금방 찬다고 보시면 돼요<br>
· Claude.ai, Claude Code, Claude 앱의 사용량이 모두 합산돼요<br>
· 본격적으로 쓰려면 Pro 이상 추천<br><br>

👉 일단 무료로 맛보기 → 괜찮으면 Pro 업그레이드하는 방식을 추천해요!<br><br>

<b>3️⃣ 설치 방법</b><br><br>

Claude Code는 npm으로 설치해요. Node.js 18 이상이 필요합니다.<br><br>

<b>① Node.js 버전 확인</b><br>
<pre><code>node --version
# v18.0.0 이상이면 OK!</code></pre>

<b>② Claude Code CLI 설치</b><br>
<pre><code>npm install -g @anthropic-ai/claude-code</code></pre>

<b>③ 로그인 (처음 한 번만)</b><br>
<pre><code>claude
# 처음 실행하면 인증 화면이 뜹니다</code></pre>

<b>4️⃣ VS Code에서 사용하는 방법</b><br><br>

터미널만 써도 충분하지만, VS Code에서 연동하면 훨씬 편해요.<br>
특히 코드 변경사항을 diff로 바로 볼 수 있어서 좋더라고요 👍<br><br>

<b>✅ VS Code 익스텐션의 장점</b><br>
· Claude가 파일 수정하면 → diff뷰로 바로 확인 가능<br>
· 현재 열려있는 파일이 자동으로 컨텍스트에 포함<br>
· 변경 이력 체크포인트 저장 → 언제든 되돌리기 가능<br><br>

<b>📌 핵심 요약</b><br><br>

· Claude = 웹 챗봇 / Claude Code = 터미널·IDE 코딩 에이전트<br>
· 코딩 특화, 긴 컨텍스트, 터미널 에이전트가 강점<br>
· 무료 플랜으로도 가볍게 체험 가능 (한도 금방 차니 주의)<br>
· 설치: <code>npm install -g @anthropic-ai/claude-code</code><br>
· VS Code: 익스텐션 설치 → 스파크 아이콘 클릭 → 바로 사용<br><br>

<b>✍️ 마무리</b><br><br>

Claude Code 처음 쓸 때 놀랐던 기억이 있어요.<br>
파일을 직접 열어서 코드를 짜주는 걸 보고 진짜 신기했거든요 😂<br>
아직 안 써보셨다면 무료 플랜으로 한번 맛보기 해보시는 걸 추천드려요.<br>
저처럼 "이게 뭐지?" 하셨던 분들께 조금이라도 도움이 됐으면 좋겠습니다 😊<br><br>

오늘도 한 톨, 저장 완료입니다 🌾<br><br>

#ClaudeCode #Claude #AI코딩 #개발자도구 #VSCode #LLM #한톨로그 #개발일지`,
  },
]

export interface CustomStyle {
  id: string
  name: string
  samples: string[]
  createdAt: number
}

export function getCustomStyles(): CustomStyle[] {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem("customStyles")
  return stored ? JSON.parse(stored) : []
}

export function saveCustomStyle(style: CustomStyle) {
  const styles = getCustomStyles()
  const index = styles.findIndex((s) => s.id === style.id)
  if (index >= 0) {
    styles[index] = style
  } else {
    styles.push(style)
  }
  localStorage.setItem("customStyles", JSON.stringify(styles))
}

export function deleteCustomStyle(id: string) {
  const styles = getCustomStyles().filter((s) => s.id !== id)
  localStorage.setItem("customStyles", JSON.stringify(styles))
}
