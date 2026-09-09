import { useNavigate } from 'react-router-dom'
import { Warehouse, Blocks, Download } from 'lucide-react'
import { toast } from '@/lib/toast'
import { ScreenScroll } from '@/components/mobile/parts'

const TILES = [
  { key: 'ton', label: 'Tồn Kho', icon: Warehouse, to: '' },
  { key: 'dichuyen', label: 'Di Chuyển', icon: Blocks, to: '' },
  { key: 'nhap', label: 'Nhập hàng', icon: Download, to: '/m/nhan-hang' },
]

export function Khac() {
  const nav = useNavigate()
  return (
    <>
      <header className="shrink-0 px-4 pb-2 pt-4">
        <h1 className="text-[22px] font-semibold text-slate-600">Khác</h1>
      </header>
      <ScreenScroll className="px-4 py-3">
        <div className="grid grid-cols-2 gap-3">
          {TILES.map(({ key, label, icon: Icon, to }) => (
            <button
              key={key}
              type="button"
              onClick={() =>
                to ? nav(to) : toast('Chức năng này chưa có trong tài liệu HDSD — sẽ bổ sung sau')
              }
              className="flex flex-col items-center gap-3 rounded-lg border border-line bg-white p-5 text-center active:border-navy/30"
            >
              <Icon className="size-14 text-navy" strokeWidth={1.6} />
              <span className="text-[15px] font-medium text-slate-700">{label}</span>
            </button>
          ))}
        </div>
      </ScreenScroll>
    </>
  )
}
