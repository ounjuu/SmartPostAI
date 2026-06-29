// 숏폼(숏츠/릴스/틱톡) 톤 프리셋

export interface ShortformStyle {
  id: string
  name: string
  emoji: string
  description: string
  promptInstruction: string
}

export const SHORTFORM_STYLES: ShortformStyle[] = [
  {
    id: "info",
    name: "정보형",
    emoji: "📌",
    description: "핵심 정보를 빠르게 전달하는 꿀팁/리스트형",
    promptInstruction: `정보 전달형 숏폼으로 구성해주세요.
- 훅에서 "이거 모르면 손해" 류의 정보 가치를 명확히 제시
- 컷마다 하나의 팁/포인트를 다루고 자막에 숫자(①②③)나 키워드로 정리
- 나레이션은 군더더기 없이 정보 위주, 빠른 호흡
- 마지막 컷은 핵심 요약 + 저장 유도`,
  },
  {
    id: "emotional",
    name: "감성형",
    emoji: "🌙",
    description: "분위기·여운 중심의 감성 브이로그형",
    promptInstruction: `감성형 숏폼으로 구성해주세요.
- 훅은 공감되는 감정/질문으로 시작
- 나레이션은 잔잔하고 따뜻한 구어체, 여백 있는 호흡
- 자막은 감성적인 짧은 문장 (한 줄 카피처럼)
- 마지막 컷은 여운을 남기는 마무리`,
  },
  {
    id: "fun",
    name: "유머형",
    emoji: "😆",
    description: "빠른 전개와 반전으로 웃기는 예능형",
    promptInstruction: `유머·예능형 숏폼으로 구성해주세요.
- 훅은 반전/과장/궁금증 유발로 강하게
- 컷 전환이 빠르고 리듬감 있게, 자막에 효과음 느낌(ㅋㅋ, 헉, 띠용 등) 살짝 허용
- 나레이션은 친구한테 말하듯 가볍고 톡톡 튀게
- 마지막 컷은 빵 터지는 반전이나 드립으로 마무리`,
  },
]

export function getShortformStyle(styleId: string | undefined): ShortformStyle {
  return SHORTFORM_STYLES.find((s) => s.id === styleId) || SHORTFORM_STYLES[0]
}
