import { RotateCcw } from 'lucide-react'
import { useApp } from '@/store'
import { warehouseById } from '@/data/mock'
import { toast } from '@/lib/toast'
import { Button } from '@/components/ui/Button'
import { ScreenScroll } from '@/components/mobile/parts'

const ROLE_VI: Record<string, string> = {
  thukho: 'Thủ kho',
  picker: 'Nhân viên soạn hàng',
  receiver: 'Nhân viên nhận hàng',
}

export function CaNhan() {
  const user = useApp((s) => s.user)
  const resetDemo = useApp((s) => s.resetDemo)
  const receipts = useApp((s) => s.receipts)
  const inventory = useApp((s) => s.inventory)

  return (
    <>
      <header className="shrink-0 px-4 pb-2 pt-4">
        <h1 className="text-[22px] font-semibold text-slate-600">Cá nhân</h1>
      </header>
      <ScreenScroll className="space-y-4 px-4 py-3">
        <div className="rounded-card border border-line bg-white p-4 shadow-sm">
          <div className="text-[18px] font-bold text-navy">{user.name}</div>
          <div className="mt-1 text-[14px] text-slate-600">
            {ROLE_VI[user.role]} · {user.code}
          </div>
          <div className="text-[13px] text-muted">{warehouseById[user.warehouseId]?.name}</div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-card border border-line bg-white p-3 text-center shadow-sm">
            <div className="text-[24px] font-bold text-navy">{inventory.length}</div>
            <div className="text-[12px] text-label">Dòng tồn kho</div>
          </div>
          <div className="rounded-card border border-line bg-white p-3 text-center shadow-sm">
            <div className="text-[24px] font-bold text-navy">{receipts.length}</div>
            <div className="text-[12px] text-label">Lần nhập chủ động</div>
          </div>
        </div>

        <Button
          variant="outline"
          block
          onClick={() => {
            resetDemo()
            toast('Đã khôi phục dữ liệu demo ban đầu')
          }}
        >
          <RotateCcw className="size-5" /> Khôi phục dữ liệu demo
        </Button>
      </ScreenScroll>
    </>
  )
}
