import type { ReactNode } from 'react'
import { StatusBar } from '@/components/mobile/StatusBar'
import { NotificationModal } from '@/components/mobile/NotificationModal'

/**
 * Khung máy handheld kho.
 * - Desktop: dựng thành thiết bị cầm tay (bezel dày, nút quét vàng bên hông),
 *   neo cứng vào chính giữa cửa sổ trình duyệt.
 * - Điện thoại thật: bỏ khung, app chiếm trọn màn hình.
 */
export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="hh-stage">
      <div className="hh-device w-full sm:w-auto">
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
  )
}
