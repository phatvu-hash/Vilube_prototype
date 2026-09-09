import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Format số kiểu VN: 1.234 */
export function fmt(n: number): string {
  return new Intl.NumberFormat('vi-VN').format(n)
}

/** dd-MM-yyyy */
export function fmtDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  const p = (x: number) => String(x).padStart(2, '0')
  return `${p(d.getDate())}-${p(d.getMonth() + 1)}-${d.getFullYear()}`
}

/** dd/MM/yyyy — kiểu hiển thị trong ô field của HDSD */
export function fmtDateSlash(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  const p = (x: number) => String(x).padStart(2, '0')
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`
}

/** Cộng ngày → yyyy-MM-dd (dùng cho input type=date) */
export function addDays(iso: string, days: number): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  d.setDate(d.getDate() + days)
  const p = (x: number) => String(x).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

export const todayIso = () => new Date().toISOString().slice(0, 10)
