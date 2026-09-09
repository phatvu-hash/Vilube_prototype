import { useNavigate } from 'react-router-dom'
import { ArrowLeftRight, RotateCcw } from 'lucide-react'
import { useApp } from '@/store'
import { warehouseById } from '@/data/mock'
import { toast } from '@/lib/toast'
import { useT } from '@/i18n'
import { Button } from '@/components/ui/Button'
import { ScreenScroll } from '@/components/mobile/parts'

const ROLE_VI: Record<string, string> = {
  thukho: 'Thủ kho',
  picker: 'Nhân viên soạn hàng',
  receiver: 'Nhân viên nhận hàng',
}

export function CaNhan() {
  const nav = useNavigate()
  const t = useT()
  const user = useApp((s) => s.user)
  const whId = useApp((s) => s.warehouseId)
  const resetDemo = useApp((s) => s.resetDemo)
  const receipts = useApp((s) => s.receipts)
  const inventory = useApp((s) => s.inventory)

  const myInventory = inventory.filter((r) => r.whId === whId)
  const myReceipts = receipts.filter((r) => r.whId === whId)

  return (
    <>
      <header className="shrink-0 px-4 pb-2 pt-4">
        <h1 className="text-[22px] font-semibold text-slate-600">{t('Cá nhân')}</h1>
      </header>
      <ScreenScroll className="space-y-4 px-4 py-3">
        <div className="rounded-card border border-line bg-white p-4 shadow-sm">
          <div className="text-[18px] font-bold text-navy">{user.name}</div>
          <div className="mt-1 text-[14px] text-slate-600">
            {t(ROLE_VI[user.role])} · {user.code}
          </div>
          <div className="text-[13px] text-muted">{whId ? t(warehouseById[whId].name) : ''}</div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-card border border-line bg-white p-3 text-center shadow-sm">
            <div className="text-[24px] font-bold text-navy">{myInventory.length}</div>
            <div className="text-[12px] text-label">{t('Dòng tồn kho')}</div>
          </div>
          <div className="rounded-card border border-line bg-white p-3 text-center shadow-sm">
            <div className="text-[24px] font-bold text-navy">{myReceipts.length}</div>
            <div className="text-[12px] text-label">{t('Lần nhập chủ động')}</div>
          </div>
        </div>

        <Button variant="outline" block onClick={() => nav('/kho')}>
          <ArrowLeftRight className="size-5" /> {t('Đổi kho')}
        </Button>

        <Button
          variant="outline"
          block
          onClick={() => {
            resetDemo()
            toast(t('Đã khôi phục dữ liệu demo ban đầu'))
          }}
        >
          <RotateCcw className="size-5" /> {t('Khôi phục dữ liệu demo')}
        </Button>
      </ScreenScroll>
    </>
  )
}
