export interface HistoryItem {
  id: string
  title: string
  content: string
  tistoryTitle: string
  tistoryContent: string
  keywords: string[]
  styleId: string
  createdAt: string
}

const STORAGE_KEY = "smartpostai_history"
const MAX_ITEMS = 20

export function getHistory(): HistoryItem[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const items: HistoryItem[] = JSON.parse(raw)
    return items.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  } catch {
    return []
  }
}

export function saveToHistory(item: Omit<HistoryItem, "id" | "createdAt">): void {
  // 네이버/티스토리 중 하나라도 본문이 있어야 저장
  if (!item.content && !item.tistoryContent) return

  const history = getHistory()

  // 중복 방지: 네이버/티스토리 본문이 모두 동일하면 저장하지 않음
  const isDuplicate = history.some(
    (h) =>
      h.content === item.content &&
      h.tistoryContent === item.tistoryContent &&
      h.title === item.title &&
      h.tistoryTitle === item.tistoryTitle
  )
  if (isDuplicate) return

  const newItem: HistoryItem = {
    ...item,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  }

  const updated = [newItem, ...history].slice(0, MAX_ITEMS)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
}

export function deleteFromHistory(id: string): void {
  const history = getHistory()
  const updated = history.filter((h) => h.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
}

export function clearHistory(): void {
  localStorage.removeItem(STORAGE_KEY)
}
