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
  const history = getHistory()

  // 중복 방지: 같은 title + content가 이미 있으면 저장하지 않음
  const isDuplicate = history.some(
    (h) => h.title === item.title && h.content === item.content
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
