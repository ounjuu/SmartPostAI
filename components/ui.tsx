// 공통 UI 컴포넌트

interface LabelProps {
  children: React.ReactNode
  rightSlot?: React.ReactNode
}

export function Label({ children, rightSlot }: LabelProps) {
  return (
    <div className="flex items-center justify-between">
      <label className="block text-sm font-semibold text-gray-700">
        {children}
      </label>
      {rightSlot}
    </div>
  )
}

interface CardProps {
  children: React.ReactNode
  className?: string
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-200 p-4 ${className}`}>
      {children}
    </div>
  )
}

interface PageLayoutProps {
  children: React.ReactNode
}

export function PageLayout({ children }: PageLayoutProps) {
  return (
    <main className="max-w-lg mx-auto px-4 py-6">
      {children}
    </main>
  )
}

interface PageHeaderProps {
  title: string
  onBack?: () => void
}

export function PageHeader({ title, onBack }: PageHeaderProps) {
  return (
    <header className="flex items-center justify-between mb-6">
      {onBack ? (
        <button
          onClick={onBack}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          &larr; 돌아가기
        </button>
      ) : (
        <div className="w-16" />
      )}
      <h1 className="text-lg font-bold text-gray-900">{title}</h1>
      <div className="w-16" />
    </header>
  )
}

// 공통 스타일 상수
export const inputClass =
  "w-full p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"

export const textareaClass = (height: string = "h-32") =>
  `w-full ${height} p-3 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent`

export const btnPrimary =
  "w-full py-3 bg-green-500 text-white font-medium rounded-xl hover:bg-green-600 active:bg-green-700 transition-colors"

export const btnSecondary =
  "w-full py-3 bg-gray-100 text-gray-600 font-medium rounded-xl hover:bg-gray-200 transition-colors"
