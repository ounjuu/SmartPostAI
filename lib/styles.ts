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
    id: "casual",
    name: "일상 톤",
    description: "친근한 일상 블로그",
    emoji: "😊",
    promptInstruction: `친근한 일상 톤으로 작성해주세요.
- ~했어요, ~인 것 같아요, ~이에요 말투 사용
- 독자에게 말을 거는 듯한 느낌
- 이모지를 자연스럽게 섞어 사용`,
    examplePost: `오늘 드디어 소문만 듣던 그 카페에 다녀왔어요! ☕

친구가 여기 브런치가 진짜 맛있다고 해서 기대하고 갔는데요, 기대 이상이었어요 😍

<b>크로플이 진짜 바삭바삭</b>하고 안에는 촉촉해서 식감이 너무 좋았어요. 아이스 아메리카노도 산미가 적당해서 제 취향이었어요!

분위기도 너무 좋고 사진 찍기에도 딱이더라고요 📸

다음에는 딸기 라떼도 도전해보려고요! 여러분도 근처 가시면 한번 들러보세요~ 👍`,
  },
  {
    id: "informative",
    name: "정보 전달",
    description: "깔끔한 정보 리뷰",
    emoji: "📋",
    promptInstruction: `깔끔한 정보 전달 톤으로 작성해주세요.
- ~합니다, ~입니다 존댓말 사용
- 항목별로 정리된 구조
- 가격, 위치, 영업시간 등 실용 정보 강조
- 장단점을 명확하게 구분`,
    examplePost: `<b>📍 매장 정보</b><br>
- 위치: 서울 강남구 역삼동<br>
- 영업시간: 10:00 ~ 22:00<br>
- 주차: 건물 내 2시간 무료<br><br>

<b>🍽️ 메뉴 리뷰</b><br><br>

이번에 방문한 곳은 역삼역 근처에 위치한 이탈리안 레스토랑입니다.<br><br>

<b>대표 메뉴인 트러플 파스타(18,000원)</b>를 주문했습니다. 면의 익힘 정도가 적절했으며, 트러플 향이 진하게 느껴졌습니다.<br><br>

<b>✅ 장점</b><br>
- 합리적인 가격대<br>
- 넓고 쾌적한 매장<br>
- 친절한 서비스<br><br>

<b>❌ 아쉬운 점</b><br>
- 웨이팅이 길 수 있음<br>
- 메뉴 종류가 다소 제한적<br><br>

전반적으로 가격 대비 만족스러운 곳이었습니다. 데이트나 모임 장소로 추천드립니다.`,
  },
  {
    id: "emotional",
    name: "감성 톤",
    description: "감성적인 에세이",
    emoji: "🌿",
    promptInstruction: `감성적인 에세이 톤으로 작성해주세요.
- ~했다, ~이었다 문어체 사용
- 서정적이고 묘사적인 문장
- 감정과 분위기를 세밀하게 표현
- 이모지는 최소한으로 사용`,
    examplePost: `바람이 좋은 날이었다.<br><br>

오래 걷고 싶다는 생각에 무작정 골목길을 따라 걸었다. 낯선 거리에서 만난 작은 카페 하나. 간판도 없이 나무 문 하나만 달려 있었는데, 괜히 끌려서 문을 열었다.<br><br>

안쪽은 생각보다 넓었다. 오래된 LP판이 벽면을 가득 채우고 있었고, 어디선가 재즈가 조용히 흘러나왔다. 창가 자리에 앉아 핸드드립 커피를 한 모금 마셨다.<br><br>

<b>그 순간, 시간이 멈춘 것 같았다.</b><br><br>

가끔은 이런 우연한 발견이 하루를 특별하게 만든다. 아무 계획 없이 걷다 마주친 이 공간이, 오늘 하루 중 가장 좋은 시간이었다.`,
  },
  {
    id: "review",
    name: "체험단 리뷰",
    description: "체험단/협찬 솔직 리뷰",
    emoji: "⭐",
    promptInstruction: `체험단/협찬 리뷰 스타일로 작성해주세요.
- 솔직하고 상세한 사용 후기
- 별점 또는 평가 포인트 포함
- 추천 포인트와 아쉬운 점 구분
- 구매 링크나 할인 정보 안내 영역 포함
- "이 글은 체험단으로 제공받아 솔직하게 작성한 후기입니다" 문구 마지막에 포함`,
    examplePost: `안녕하세요! 오늘은 요즘 핫한 <b>○○ 클렌징 오일</b>을 써본 솔직 후기를 가져왔어요 🧴<br><br>

<b>📦 제품 정보</b><br>
- 용량: 200ml<br>
- 가격: 28,000원<br>
- 주요 성분: 호호바 오일, 올리브 오일<br><br>

<b>⭐ 총평: 4.5 / 5</b><br><br>

<b>👍 좋았던 점</b><br>
1. 진한 메이크업도 한 번에 깔끔하게 지워져요<br>
2. 세안 후에도 당김 없이 촉촉해요<br>
3. 펌핑형이라 위생적이에요<br><br>

<b>👎 아쉬운 점</b><br>
1. 향이 다소 강한 편이에요<br>
2. 가격이 조금 있는 편<br><br>

전체적으로 <b>민감 피부에도 자극 없이</b> 사용할 수 있어서 만족스러웠어요. 클렌징 오일 찾고 계신 분들께 추천드려요!<br><br>

<hr>
<i>이 글은 체험단으로 제공받아 솔직하게 작성한 후기입니다.</i>`,
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
