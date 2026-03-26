export interface StylePreset {
  id: string
  name: string
  description: string
  emoji: string
  promptInstruction: string
  examplePost: string
}

export const STYLE_PRESETS: StylePreset[] = [
  {
    id: "restaurant",
    name: "맛집 리뷰",
    description: "맛집 방문 후기",
    emoji: "🍽️",
    promptInstruction: `맛집 블로그 리뷰 스타일로 작성해주세요.
- 친근한 톤 (~했어요, ~이에요, ~더라고요)
- 매장 정보(위치, 영업시간, 주차 등)를 상단에 정리
- 주문한 메뉴별로 맛, 식감, 양, 가격을 구체적으로 묘사
- 매장 분위기와 서비스도 언급
- 사진마다 음식/매장 설명을 자연스럽게 연결
- 총평과 추천 포인트를 마지막에 정리
- 이모지를 적절히 사용하여 가독성 높이기`,
    examplePost: `안녕하세요! 오늘은 요즘 핫하다는 <b>성수동 파스타 맛집</b>에 다녀왔어요 🍝<br><br>

<b>📍 매장 정보</b><br>
- 위치: 서울 성동구 성수동 2가<br>
- 영업시간: 11:30 ~ 21:30 (브레이크타임 15:00~17:00)<br>
- 주차: 근처 공영주차장 이용<br>
- 예약: 네이버 예약 가능<br><br>

평일 점심에 방문했는데도 웨이팅이 있더라고요 😮 약 15분 정도 기다려서 입장했어요!<br><br>

<b>🍽️ 트러플 크림 파스타 (19,000원)</b><br><br>

시그니처 메뉴라길래 바로 주문했는데요, <b>트러플 향이 진짜 미쳤어요</b> 🤤 크림소스가 느끼하지 않고 고소한 게 면에 잘 감겨서 한 젓가락 먹으면 멈출 수가 없었어요.<br><br>

면은 알덴테로 딱 적당하게 삶아져 있었고, 위에 올라간 파르메산 치즈가 고소함을 더해줬어요.<br><br>

<b>🥗 루꼴라 샐러드 (12,000원)</b><br><br>

파스타만 먹으면 느끼할까 봐 샐러드도 하나 시켰는데, 발사믹 드레싱이 새콤달콤해서 입가심으로 딱이었어요 👍<br><br>

<b>💬 총평</b><br><br>

인테리어가 감각적이고 직원분들도 친절해서 분위기 좋게 식사했어요. 가격이 조금 있는 편이긴 한데, 맛과 분위기를 생각하면 충분히 값어치 있는 곳이에요!<br><br>

<b>데이트나 특별한 날 방문하기 좋은 곳</b>으로 추천드려요 💕<br><br>

#성수동맛집 #성수동파스타 #트러플파스타 #성수동데이트 #서울맛집 #파스타맛집 #성수동점심 #맛집추천`,
  },
  {
    id: "tech",
    name: "기술 블로그",
    description: "개발/기술 정보 글",
    emoji: "💻",
    promptInstruction: `기술 블로그 스타일로 작성해주세요.
- ~합니다, ~입니다 정중한 톤
- 도입부에서 주제와 배경을 간결하게 설명
- 핵심 내용을 단계별 또는 항목별로 구조화
- 코드 블록이 필요하면 <pre><code> 태그 사용
- 기술 용어는 정확하게, 필요시 간단한 부연 설명 포함
- 실제 사용 사례나 비교 분석을 포함하면 좋음
- 마지막에 요약 또는 결론 정리
- 이모지는 제목이나 소제목에만 간결하게 사용`,
    examplePost: `<b>🚀 Next.js 14 App Router 마이그레이션 가이드</b><br><br>

기존 Pages Router 기반 프로젝트를 App Router로 전환하면서 겪은 경험을 공유합니다.<br><br>

<b>📌 왜 App Router인가?</b><br><br>

Next.js 13부터 도입된 App Router는 React Server Components를 기본으로 지원하며, 레이아웃 중첩, 로딩/에러 UI, 서버 액션 등 다양한 기능을 제공합니다.<br><br>

기존 Pages Router 대비 주요 장점은 다음과 같습니다:<br>
- 서버 컴포넌트로 번들 사이즈 감소<br>
- 레이아웃 시스템으로 코드 중복 제거<br>
- 스트리밍 SSR 지원<br><br>

<b>🔧 마이그레이션 핵심 단계</b><br><br>

<b>1단계: 디렉토리 구조 변경</b><br><br>

Pages Router의 <code>pages/</code> 디렉토리를 <code>app/</code>으로 전환합니다. 각 라우트는 폴더 기반으로 구성되며, <code>page.tsx</code>가 해당 경로의 진입점이 됩니다.<br><br>

<b>2단계: 클라이언트 컴포넌트 분리</b><br><br>

App Router에서 모든 컴포넌트는 기본적으로 서버 컴포넌트입니다. <code>useState</code>, <code>useEffect</code> 등 클라이언트 기능을 사용하는 컴포넌트는 상단에 <code>"use client"</code> 지시문을 추가해야 합니다.<br><br>

<b>3단계: 데이터 페칭 방식 변경</b><br><br>

<code>getServerSideProps</code>, <code>getStaticProps</code>는 더 이상 사용하지 않습니다. 대신 서버 컴포넌트 내에서 직접 <code>async/await</code>로 데이터를 가져옵니다.<br><br>

<b>⚠️ 주의할 점</b><br>
- 기존 미들웨어와의 호환성 확인 필요<br>
- 서드파티 라이브러리의 서버 컴포넌트 지원 여부 체크<br>
- 점진적 마이그레이션 권장 (pages/와 app/ 공존 가능)<br><br>

<b>📝 마무리</b><br><br>

전환 과정에서 초기 러닝 커브가 있었지만, 완료 후 빌드 사이즈가 약 30% 감소했고 페이지 로딩 속도도 체감할 수 있을 정도로 개선되었습니다. 신규 프로젝트라면 App Router를 적극 권장합니다.<br><br>

#NextJS #AppRouter #React #프론트엔드 #웹개발 #마이그레이션 #기술블로그`,
  },
  {
    id: "product",
    name: "상품 리뷰",
    description: "제품 사용 후기",
    emoji: "📦",
    promptInstruction: `상품 리뷰 블로그 스타일로 작성해주세요.
- 친근하지만 신뢰감 있는 톤 (~했어요, ~이에요)
- 제품 기본 정보(제품명, 가격, 구매처)를 상단에 정리
- 개봉기 → 외관/디자인 → 실사용 후기 순서로 구성
- 장점과 단점을 솔직하게 구분하여 작성
- 별점 또는 점수 평가 포함
- 어떤 사람에게 추천하는지 명시
- 사진마다 제품 설명을 자연스럽게 연결
- 이모지를 적절히 활용`,
    examplePost: `오늘은 최근에 구매한 <b>○○ 블루투스 키보드</b>를 2주간 써본 솔직 후기를 가져왔어요! ⌨️<br><br>

<b>📦 제품 정보</b><br>
- 제품명: ○○ 무선 기계식 키보드 K1<br>
- 가격: 89,000원<br>
- 구매처: 쿠팡<br>
- 연결: 블루투스 5.0 / USB-C 유선<br>
- 스위치: 적축<br><br>

<b>📐 디자인 & 외관</b><br><br>

박스를 열자마자 느낀 건 <b>생각보다 컴팩트하다</b>는 거였어요. 75% 배열이라 텐키가 없는데, 책상 위가 훨씬 깔끔해졌어요 ✨<br><br>

알루미늄 상판이라 고급스러운 느낌이 나고, 무게감도 적당해서 타이핑할 때 밀리지 않아요.<br><br>

<b>⌨️ 타이핑 실사용 후기</b><br><br>

적축이라 소음이 적을 줄 알았는데, <b>탁탁 치는 느낌이 꽤 있어요</b>. 조용한 사무실에서는 약간 신경 쓰일 수 있지만, 재택근무나 집에서 쓰기엔 완전 만족이에요 👍<br><br>

블루투스 연결도 안정적이고, 기기 3대까지 멀티페어링이 돼서 맥북-아이패드-회사 노트북을 번갈아 쓸 수 있는 게 너무 편해요.<br><br>

배터리는 하루 6시간 기준으로 약 2주 정도 가더라고요 🔋<br><br>

<b>⭐ 총평: 4.3 / 5</b><br><br>

<b>👍 장점</b><br>
1. 컴팩트한 디자인 + 알루미늄 상판 고급감<br>
2. 멀티페어링 3대 지원<br>
3. USB-C 유선 겸용<br>
4. 적축 특유의 부드러운 키감<br><br>

<b>👎 아쉬운 점</b><br>
1. 키캡 각인이 시간 지나면 지워질 것 같은 느낌<br>
2. 경사 조절 받침대가 1단계뿐<br><br>

<b>🎯 이런 분께 추천해요</b><br>
- 깔끔한 데스크 셋업을 원하시는 분<br>
- 여러 기기를 번갈아 쓰시는 분<br>
- 조용한 기계식 키보드를 찾으시는 분<br><br>

가격 대비 완성도가 높아서 만족스러운 제품이었어요! 키보드 고민 중이신 분들 참고하세요 😊<br><br>

#블루투스키보드 #기계식키보드 #키보드추천 #데스크셋업 #재택근무템 #IT리뷰 #상품리뷰`,
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
