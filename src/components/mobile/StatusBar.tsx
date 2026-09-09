import { useEffect, useState } from 'react'
import { BatteryFull, Signal, Wifi } from 'lucide-react'
import { DataStatus } from '@/components/mobile/DataStatus'

/**
 * Thanh trên cùng của máy handheld.
 * Đồng hồ và biểu tượng sóng là phần giả lập, chỉ hiện khi xem trong khung máy
 * trên desktop — mở bằng điện thoại thật thì máy đã có thanh trạng thái riêng.
 * Chip dữ liệu đơn hàng thì luôn hiện, vì đó là thông tin của app.
 */
export function StatusBar() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(t)
  }, [])

  const hh = String(now.getHours()).padStart(2, '0')
  const mm = String(now.getMinutes()).padStart(2, '0')

  return (
    <div className="flex h-7 shrink-0 items-center justify-between gap-2 bg-navy px-3 text-white">
      <span className="flex min-w-0 items-center gap-2">
        <span className="hh-fake shrink-0 text-[12px] font-semibold tabular-nums tracking-wide">
          {hh}:{mm}
        </span>
        <DataStatus />
      </span>
      <span className="hh-fake shrink-0 items-center gap-1.5">
        <Signal className="size-3.5" strokeWidth={2.4} />
        <Wifi className="size-3.5" strokeWidth={2.4} />
        <BatteryFull className="size-4" strokeWidth={2.2} />
      </span>
    </div>
  )
}
