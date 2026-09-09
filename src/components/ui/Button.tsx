import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost'
  block?: boolean
}

export function Button({ variant = 'primary', block, className, ...rest }: Props) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3 text-[15px] font-semibold tracking-wide transition active:scale-[.99] disabled:opacity-50 disabled:active:scale-100',
        variant === 'primary' && 'bg-navy text-white shadow-sm hover:bg-navy-900',
        variant === 'outline' && 'border border-navy/30 bg-white text-navy hover:bg-navy-50',
        variant === 'ghost' && 'text-navy hover:bg-navy-50',
        block && 'w-full',
        className,
      )}
      {...rest}
    />
  )
}
