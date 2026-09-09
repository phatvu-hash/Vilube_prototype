import { cn } from '@/lib/utils'
import { fmtQty } from '@/lib/uom'

interface Props {
  qty: number
  units: string[]
  selected: string
  onSelect: (u: string) => void
}

/** Số lượng cỡ lớn + segmented đơn vị tính dọc (CÁI/THÙNG/PALLET · KG/DRUM/PALLET) */
export function UomSegment({ qty, units, selected, onSelect }: Props) {
  return (
    <div className="flex items-center gap-4">
      <div className="min-w-[72px] flex-1 text-center text-[40px] font-bold leading-none tabular-nums text-navy">
        {fmtQty(qty)}
      </div>
      <div className="w-[170px] overflow-hidden rounded-lg border-2 border-navy">
        {units.map((u, i) => {
          const active = u === selected
          return (
            <button
              key={u}
              type="button"
              onClick={() => onSelect(u)}
              className={cn(
                'block w-full px-4 py-1.5 text-center text-[15px] font-bold tracking-wide transition',
                i > 0 && 'border-t-2 border-navy/15',
                active ? 'bg-navy text-white' : 'bg-white text-brand',
              )}
            >
              {u}
            </button>
          )
        })}
      </div>
    </div>
  )
}
