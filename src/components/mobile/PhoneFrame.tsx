import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { StatusBar } from '@/components/mobile/StatusBar'
import { NotificationModal } from '@/components/mobile/NotificationModal'

/**
 * Thu nhỏ nguyên cái máy cho vừa chiều cao cửa sổ, thay vì cắt bớt màn hình.
 * Nhờ vậy mọi field luôn hiện đủ, không phải cuộn — kể cả khi cửa sổ thấp.
 */
function useFitScale() {
  const ref = useRef<HTMLDivElement>(null)
  const [fit, setFit] = useState({ scale: 1, height: 0 })

  useLayoutEffect(() => {
    const measure = () => {
      const el = ref.current
      if (!el) return
      // Dưới 640px là điện thoại thật — không có khung máy nên không thu nhỏ
      if (window.innerWidth < 640) return setFit({ scale: 1, height: 0 })
      // offsetHeight không bị ảnh hưởng bởi transform → luôn là chiều cao gốc
      const natural = el.offsetHeight
      const scale = Math.min(1, (window.innerHeight - 24) / natural)
      setFit({ scale, height: natural * scale })
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  return { ref, ...fit }
}

/**
 * Khung máy handheld kho.
 * - Desktop: dựng thành thiết bị cầm tay (bezel dày, nút quét vàng bên hông),
 *   neo cứng vào chính giữa cửa sổ trình duyệt.
 * - Điện thoại thật: bỏ khung, app chiếm trọn màn hình.
 */
export function PhoneFrame({ children }: { children: ReactNode }) {
  const { ref, scale, height } = useFitScale()
  const shrunk = scale < 1

  return (
    <div className="hh-stage">
      {/* Lớp bọc mang đúng chiều cao SAU khi thu nhỏ, để máy vẫn nằm giữa cửa sổ */}
      <div className="w-full sm:w-auto" style={shrunk ? { height } : undefined}>
        <div
          ref={ref}
          className="hh-device w-full sm:w-auto"
          style={shrunk ? { transform: `scale(${scale})`, transformOrigin: 'top center' } : undefined}
        >
          {/* Loa thoại + camera trên bezel */}
          <div className="hidden items-center justify-center gap-2 pb-3 sm:flex">
            <span className="h-[5px] w-16 rounded-full bg-black/55 shadow-[0_1px_0_rgba(255,255,255,.08)]" />
            <span className="size-[7px] rounded-full bg-black/70 ring-1 ring-white/10" />
          </div>

          {/* Nút quét vàng bên hông phải — đặc trưng máy quét kho */}
          <span className="absolute -right-[3px] top-[30%] hidden h-24 w-[6px] rounded-r-md bg-amber-400/90 shadow-[0_0_0_1px_rgba(0,0,0,.5)] sm:block" />
          {/* Phím chức năng bên hông trái */}
          <span className="absolute -left-[3px] top-[26%] hidden h-12 w-[6px] rounded-l-md bg-slate-500/80 sm:block" />
          <span className="absolute -left-[3px] top-[38%] hidden h-12 w-[6px] rounded-l-md bg-slate-500/80 sm:block" />

          {/* Màn hình */}
          <div className="hh-screen">
            <StatusBar />
            {children}
            <NotificationModal />
          </div>

          {/* Cằm máy */}
          <div className="hidden pt-3 text-center sm:block">
            <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-white/35">
              Smartlog WMS
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
