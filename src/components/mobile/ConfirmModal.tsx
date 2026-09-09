import { useT } from '@/i18n'
import { Button } from '@/components/ui/Button'

/** Popup hỏi Có / Không — dùng cho bước "Bạn có muốn in barcode không?" */
export function ConfirmModal({
  open,
  message,
  onYes,
  onNo,
}: {
  open: boolean
  message: string
  onYes: () => void
  onNo: () => void
}) {
  const t = useT()
  if (!open) return null
  return (
    <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/50 p-6">
      <div className="w-full max-w-xs space-y-4 rounded-card bg-white p-6 text-center shadow-xl">
        <p className="text-[15px] leading-normal text-slate-700">{message}</p>
        <div className="flex gap-2">
          <Button variant="outline" block onClick={onNo}>
            {t('KHÔNG')}
          </Button>
          <Button block onClick={onYes}>
            {t('CÓ')}
          </Button>
        </div>
      </div>
    </div>
  )
}
