import { useEffect, useRef, useState } from 'react'
import { Loader2, X } from 'lucide-react'
import { useT } from '@/i18n'
import { createDecoder } from '@/lib/scan-decoder'
import { Button } from '@/components/ui/Button'

/** Khoảng nghỉ giữa hai lần thử giải mã — đủ mượt mà không nấu chín điện thoại */
const INTERVAL_MS = 180

type Phase = 'starting' | 'scanning' | 'error'

function messageFor(err: unknown): string {
  const name = (err as { name?: string })?.name
  if (name === 'NotAllowedError' || name === 'SecurityError')
    return 'Bạn đã từ chối quyền dùng camera. Bật lại trong cài đặt trình duyệt rồi thử lại.'
  if (name === 'NotFoundError' || name === 'OverconstrainedError') return 'Máy này không có camera dùng được.'
  if (name === 'NotReadableError') return 'Camera đang được ứng dụng khác dùng. Đóng ứng dụng đó rồi thử lại.'
  return 'Không mở được camera trên máy này.'
}

/**
 * Lớp phủ quét mã bằng camera sau của máy.
 * Chỉ giải mã dải ngang giữa khung hình, đúng vùng khung ngắm người dùng thấy.
 */
export function CameraScanner({
  open,
  label,
  onDetect,
  onClose,
}: {
  open: boolean
  label: string
  onDetect: (value: string) => void
  onClose: () => void
}) {
  const t = useT()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [phase, setPhase] = useState<Phase>('starting')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    let stream: MediaStream | null = null
    let timer: number | undefined
    let stopped = false

    const stop = () => {
      stopped = true
      window.clearTimeout(timer)
      stream?.getTracks().forEach((track) => track.stop())
    }

    const run = async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) throw new Error('unsupported')
        setPhase('starting')
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 } },
          audio: false,
        })
        if (stopped) return stop()

        const video = videoRef.current
        if (!video) return stop()
        video.srcObject = stream
        await video.play()
        if (stopped) return stop()
        setPhase('scanning')

        const decoder = await createDecoder()
        const tick = async () => {
          if (stopped) return
          try {
            const value = await decoder.decode(video)
            if (value && !stopped) {
              stop()
              onDetect(value.trim())
              return
            }
          } catch {
            // khung hình lỗi thì bỏ qua, thử khung kế tiếp
          }
          timer = window.setTimeout(tick, INTERVAL_MS)
        }
        void tick()
      } catch (err) {
        if (stopped) return
        setError(
          (err as Error)?.message === 'unsupported'
            ? 'Trình duyệt này không mở được camera. Dùng Safari hoặc Chrome bản mới.'
            : messageFor(err),
        )
        setPhase('error')
      }
    }

    void run()
    return stop
  }, [open, onDetect])

  if (!open) return null

  return (
    <div className="absolute inset-0 z-[110] flex flex-col bg-black">
      <header className="flex h-14 shrink-0 items-center gap-2 px-3 text-white">
        <h2 className="flex-1 truncate text-[17px] font-semibold">{label}</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label={t('Đóng')}
          className="grid size-9 place-items-center rounded-full active:bg-white/20"
        >
          <X className="size-6" strokeWidth={2.2} />
        </button>
      </header>

      <div className="relative flex-1 overflow-hidden">
        {/* playsInline + muted: thiếu là Safari trên iPhone bung trình phát toàn màn hình */}
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          className="size-full object-cover"
          style={{ display: phase === 'error' ? 'none' : undefined }}
        />

        {phase === 'scanning' && (
          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            <div className="h-[34%] w-[90%] rounded-lg border-2 border-white/90 shadow-[0_0_0_9999px_rgba(0,0,0,.45)]" />
          </div>
        )}

        {phase === 'starting' && (
          <div className="absolute inset-0 grid place-items-center bg-black/70 text-white">
            <span className="flex items-center gap-2 text-[15px]">
              <Loader2 className="size-5 animate-spin" strokeWidth={2.2} /> {t('Đang mở camera…')}
            </span>
          </div>
        )}

        {phase === 'error' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-8 text-center">
            <p className="text-[15px] leading-normal text-white">{t(error)}</p>
            <Button variant="outline" onClick={onClose}>
              {t('Chọn mã trong danh sách')}
            </Button>
          </div>
        )}
      </div>

      {phase === 'scanning' && (
        <p className="shrink-0 px-6 py-4 text-center text-[13px] leading-snug text-white/80">
          {t('Đưa mã vạch nằm gọn trong khung, cách máy khoảng một gang tay.')}
        </p>
      )}
    </div>
  )
}
