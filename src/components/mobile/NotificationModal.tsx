import { useNotificationStore } from '@/lib/toast'
import { Button } from '@/components/ui/Button'

/** Popup thông báo giữa màn hình — bấm ĐỒNG Ý mới tắt */
export function NotificationModal() {
  const current = useNotificationStore((s) => s.current)
  const dismiss = useNotificationStore((s) => s.dismiss)
  if (!current) return null
  return (
    <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/50 p-6">
      <div className="relative w-full max-w-xs space-y-4 rounded-card bg-white p-6 text-center shadow-xl">
        <p className="text-[15px] leading-normal text-slate-700">{current}</p>
        <Button block onClick={dismiss}>
          ĐỒNG Ý
        </Button>
      </div>
    </div>
  )
}
