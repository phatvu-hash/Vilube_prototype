import { useEffect, useState } from 'react'
import { BatteryFull, Signal, Wifi } from 'lucide-react'

/** Thanh trạng thái của máy handheld (giờ · sóng · wifi · pin) */
export function StatusBar() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(t)
  }, [])

  const hh = String(now.getHours()).padStart(2, '0')
  const mm = String(now.getMinutes()).padStart(2, '0')

  return (
    <div className="hh-statusbar h-7 shrink-0 items-center justify-between bg-navy px-3 text-white">
      <span className="text-[12px] font-semibold tabular-nums tracking-wide">
        {hh}:{mm}
      </span>
      <span className="flex items-center gap-1.5">
        <Signal className="size-3.5" strokeWidth={2.4} />
        <Wifi className="size-3.5" strokeWidth={2.4} />
        <BatteryFull className="size-4" strokeWidth={2.2} />
      </span>
    </div>
  )
}
