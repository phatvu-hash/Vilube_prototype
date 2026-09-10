import { useRef, useState } from 'react'
import { Camera, ScanLine } from 'lucide-react'
import { cn } from '@/lib/utils'
import { BottomSheet } from '@/components/mobile/BottomSheet'
import { Button } from '@/components/ui/Button'
import { useT } from '@/i18n'
import { CameraScanner } from '@/components/mobile/CameraScanner'

export interface ScanOption {
  value: string
  label: string
  sub?: string
}

interface Props {
  label: string
  value: string
  onChange: (v: string) => void
  /**
   * Gọi khi "bắn xong" một mã: chọn mã trong danh sách mô phỏng, bấm Enter,
   * hoặc rời khỏi ô. Máy quét thật cũng nạp trọn chuỗi rồi mới gửi Enter,
   * nên phần kiểm tra mã đặt ở đây thay vì chạy theo từng ký tự gõ tay.
   */
  onCommit?: (v: string) => void
  /** Danh sách mã có thể "quét" — mô phỏng máy quét của handheld */
  options: ScanOption[]
  placeholder?: string
  required?: boolean
  emphasis?: boolean
  sheetTitle?: string
  emptyText?: string
  /** Lớp CSS thêm cho khung field — dùng khi xếp field cạnh một nút khác */
  className?: string
}

/**
 * Ô quét mã. Trên handheld thật, bấm ô này rồi bắn máy quét.
 * Ở prototype: chạm icon quét → chọn mã trong danh sách mô phỏng.
 */
export function ScanField({
  label,
  value,
  onChange,
  onCommit,
  options,
  placeholder = '---',
  required,
  emphasis,
  sheetTitle,
  emptyText = 'Không còn mã nào để quét',
  className,
}: Props) {
  const [open, setOpen] = useState(false)
  const [camera, setCamera] = useState(false)
  const t = useT()
  // Enter rồi blur sẽ bắn 2 lần cùng một mã — chỉ xử lý lần đầu
  const lastCommitted = useRef<string | null>(null)
  const commit = (v: string) => {
    if (lastCommitted.current === v) return
    lastCommitted.current = v
    onCommit?.(v)
  }
  return (
    <>
      <div className={cn('flex items-center gap-2 rounded-lg bg-field px-3.5 py-2', className)}>
        <label className="min-w-0 flex-1">
          <span className="block text-[11px] font-medium uppercase tracking-wide text-label">
            {label}
            {required && <span className="text-danger"> *</span>}
          </span>
          <input
            value={value}
            placeholder={placeholder}
            onChange={(e) => {
              lastCommitted.current = null // gõ lại mã khác thì cho phép xử lý tiếp
              onChange(e.target.value)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commit((e.target as HTMLInputElement).value)
            }}
            onBlur={(e) => commit(e.target.value)}
            className={cn(
              'block w-full bg-transparent text-[15px] font-medium placeholder:text-muted focus:outline-none',
              emphasis ? 'font-semibold text-brand' : 'text-ink',
            )}
          />
        </label>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={t('Quét mã')}
          className="grid size-9 shrink-0 place-items-center rounded-lg text-navy active:bg-navy-100"
        >
          <ScanLine className="size-5" strokeWidth={1.75} />
        </button>
      </div>

      <BottomSheet
        open={open}
        title={sheetTitle ?? (/^qu[ée]t|^scan/i.test(label) ? label : t('Quét {0}', label.toLowerCase()))}
        onClose={() => setOpen(false)}
      >
        <div className="px-2 pb-3 pt-1">
          <Button block variant="outline" onClick={() => setCamera(true)}>
            <Camera className="size-5" /> {t('Quét bằng camera')}
          </Button>
        </div>
        <p className="px-3.5 pb-2 text-[12px] text-muted">
          {t('Mô phỏng máy quét — chạm vào mã bên dưới để "quét".')}
        </p>
        {options.length === 0 && (
          <div className="px-4 py-10 text-center text-[15px] text-muted">{emptyText}</div>
        )}
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => {
              onChange(o.value)
              commit(o.value)
              setOpen(false)
            }}
            className="flex w-full items-center gap-3 rounded-lg px-3.5 py-3 text-left active:bg-slate-50"
          >
            <ScanLine className="size-5 shrink-0 text-navy" strokeWidth={1.75} />
            <span className="min-w-0">
              <span className="block truncate text-[15px] font-semibold text-ink">{o.label}</span>
              {o.sub && <span className="block truncate text-[12px] text-muted">{o.sub}</span>}
            </span>
          </button>
        ))}
      </BottomSheet>

      <CameraScanner
        open={camera}
        label={sheetTitle ?? label}
        onDetect={(value) => {
          onChange(value)
          commit(value)
          setCamera(false)
          setOpen(false)
        }}
        onClose={() => setCamera(false)}
      />
    </>
  )
}
