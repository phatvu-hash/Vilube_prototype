import { ArrowLeft, FileText, RefreshCw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface Props {
  title: string
  back?: boolean
  onBack?: () => void
  right?: ReactNode
  /** icon chứng từ bên phải — mở chi tiết công việc */
  onDoc?: () => void
  doc?: boolean
  /** icon làm mới (màn Chi tiết soạn hàng trong HDSD) */
  onRefresh?: () => void
}

export function MobileAppBar({ title, back = true, onBack, right, onDoc, doc = true, onRefresh }: Props) {
  const nav = useNavigate()
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-line bg-white px-3">
      {back && (
        <button
          type="button"
          onClick={() => (onBack ? onBack() : nav(-1))}
          className="-ml-1 grid size-9 place-items-center rounded-full text-navy active:bg-navy-50"
          aria-label="Quay lại"
        >
          <ArrowLeft className="size-6" strokeWidth={2} />
        </button>
      )}
      <h1 className={cn('flex-1 truncate text-[19px] font-semibold text-navy', !back && 'pl-1')}>{title}</h1>
      {right}
      {onRefresh && (
        <button
          type="button"
          onClick={onRefresh}
          aria-label="Làm mới"
          className="grid size-9 place-items-center rounded-full text-navy active:bg-navy-50"
        >
          <RefreshCw className="size-[22px]" strokeWidth={2} />
        </button>
      )}
      {doc && !right && (
        <button
          type="button"
          onClick={onDoc}
          aria-label="Chi tiết công việc"
          className="grid size-9 place-items-center rounded-full text-navy active:bg-navy-50 disabled:opacity-100"
          disabled={!onDoc}
        >
          <FileText className="size-6" strokeWidth={1.75} />
        </button>
      )}
    </header>
  )
}
