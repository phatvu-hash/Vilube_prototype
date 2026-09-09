import { cn } from '@/lib/utils'

type Tone = 'new' | 'progress' | 'done'

const TONE: Record<Tone, string> = {
  new: 'bg-success text-white',
  progress: 'bg-warning text-white',
  done: 'bg-slate-200 text-slate-600',
}

export function StatusBadge({ tone, label }: { tone: Tone; label: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide',
        TONE[tone],
      )}
    >
      {label}
    </span>
  )
}
