import { ClipboardList, LayoutGrid, User } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'

const items = [
  { key: 'work', label: 'Công việc', icon: ClipboardList, to: '/m' },
  { key: 'other', label: 'Khác', icon: LayoutGrid, to: '/m/khac' },
  { key: 'me', label: 'Cá nhân', icon: User, to: '/m/canhan' },
]

export function BottomNav() {
  const nav = useNavigate()
  const { pathname } = useLocation()
  const workPrefixes = ['/m/nhap', '/m/cat', '/m/soan']
  const otherPrefixes = ['/m/khac', '/m/nhan-hang', '/m/tonkho', '/m/dichuyen']
  const active = (to: string) => {
    if (to === '/m') return pathname === '/m' || workPrefixes.some((p) => pathname.startsWith(p))
    if (to === '/m/khac') return otherPrefixes.some((p) => pathname.startsWith(p))
    return pathname.startsWith(to)
  }
  return (
    <nav className="flex shrink-0 items-stretch border-t border-line bg-white pb-[env(safe-area-inset-bottom)]">
      {items.map(({ key, label, icon: Icon, to }) => {
        const on = active(to)
        return (
          <button
            key={key}
            type="button"
            onClick={() => nav(to)}
            className={cn(
              'flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition',
              on ? 'text-navy' : 'text-muted',
            )}
          >
            <Icon className="size-[22px]" strokeWidth={on ? 2.2 : 1.8} />
            {label}
          </button>
        )
      })}
    </nav>
  )
}
