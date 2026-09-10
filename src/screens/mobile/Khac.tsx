import { useNavigate } from 'react-router-dom'
import { Warehouse, Blocks, Download, Droplets, BookOpen, FileSpreadsheet } from 'lucide-react'
import { toast } from '@/lib/toast'
import { useT } from '@/i18n'
import { useWhKind } from '@/store'
import { DOC_URL, SHEET_URL } from '@shared/catalog'
import { ScreenScroll } from '@/components/mobile/parts'

/**
 * nvlOnly: chiết rót là việc của phuy nguyên vật liệu, kho Bao Bì không có.
 * href: mở ở tab mới — tài liệu và bảng tính nằm ngoài app.
 */
const TILES = [
  { key: 'ton', label: 'Tồn Kho', icon: Warehouse, to: '' },
  { key: 'dichuyen', label: 'Di Chuyển', icon: Blocks, to: '' },
  { key: 'nhap', label: 'Nhập hàng', icon: Download, to: '/m/nhan-hang' },
  { key: 'chietrot', label: 'Chiết rót', icon: Droplets, to: '/m/chiet-rot', nvlOnly: true },
  { key: 'hdsd', label: 'Hướng dẫn sử dụng', icon: BookOpen, href: DOC_URL },
  { key: 'sheet', label: 'Bảng tính nhập đơn', icon: FileSpreadsheet, href: SHEET_URL },
]

export function Khac() {
  const nav = useNavigate()
  const t = useT()
  const kind = useWhKind()
  const tiles = TILES.filter((x) => !x.nvlOnly || kind === 'NVL')
  return (
    <>
      <header className="shrink-0 px-4 pb-2 pt-4">
        <h1 className="text-[22px] font-semibold text-slate-600">{t('Khác')}</h1>
      </header>
      <ScreenScroll className="px-4 py-3">
        <div className="grid grid-cols-2 gap-3">
          {tiles.map(({ key, label, icon: Icon, to, href }) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                if (href) return void window.open(href, '_blank', 'noopener')
                if (to) return nav(to)
                toast(t('Chức năng này chưa có trong tài liệu HDSD — sẽ bổ sung sau'))
              }}
              className="flex flex-col items-center gap-3 rounded-lg border border-line bg-white p-5 text-center active:border-navy/30"
            >
              <Icon className="size-14 text-navy" strokeWidth={1.6} />
              <span className="text-[15px] font-medium text-slate-700">{t(label)}</span>
            </button>
          ))}
        </div>
      </ScreenScroll>
    </>
  )
}
