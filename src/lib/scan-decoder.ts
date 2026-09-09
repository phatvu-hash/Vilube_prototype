/**
 * Giải mã mã vạch từ khung hình camera.
 *
 * Chrome trên Android có sẵn BarcodeDetector nên dùng thẳng, không tải gì thêm.
 * Safari trên iPhone không có, phải nạp @zxing/library — nạp động để bản dựng
 * chính không phải gánh thư viện khi người dùng chưa mở camera lần nào.
 */

/** Các định dạng cần đọc: tem carton kho là Code 128, phần còn lại cho chắc */
const FORMATS = ['code_128', 'code_39', 'ean_13', 'qr_code'] as const

export interface FrameDecoder {
  decode(video: HTMLVideoElement): Promise<string | null>
}

interface BarcodeDetectorLike {
  detect(source: CanvasImageSource): Promise<{ rawValue: string }[]>
}
type BarcodeDetectorCtor = new (opts: { formats: readonly string[] }) => BarcodeDetectorLike

export const hasNativeDetector = () => typeof (globalThis as Record<string, unknown>).BarcodeDetector !== 'undefined'

function nativeDecoder(): FrameDecoder {
  const Ctor = (globalThis as unknown as { BarcodeDetector: BarcodeDetectorCtor }).BarcodeDetector
  const detector = new Ctor({ formats: FORMATS })
  return {
    async decode(video) {
      const found = await detector.detect(video)
      return found[0]?.rawValue ?? null
    },
  }
}

/**
 * Chỉ giải mã dải ngang giữa khung hình — đúng vùng khung ngắm trên màn hình.
 * Vừa nhanh hơn vừa đỡ bắt nhầm chữ in quanh tem.
 */
const BAND_W = 0.9
const BAND_H = 0.34

async function zxingDecoder(): Promise<FrameDecoder> {
  const { BarcodeFormat, BinaryBitmap, DecodeHintType, HybridBinarizer, MultiFormatReader, RGBLuminanceSource } =
    await import('@zxing/library')

  const reader = new MultiFormatReader()
  reader.setHints(
    new Map<number, unknown>([
      [
        DecodeHintType.POSSIBLE_FORMATS,
        [BarcodeFormat.CODE_128, BarcodeFormat.CODE_39, BarcodeFormat.EAN_13, BarcodeFormat.QR_CODE],
      ],
      [DecodeHintType.TRY_HARDER, true],
    ]),
  )

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d', { willReadFrequently: true })

  return {
    async decode(video) {
      if (!ctx || !video.videoWidth) return null

      const sw = Math.round(video.videoWidth * BAND_W)
      const sh = Math.round(video.videoHeight * BAND_H)
      const sx = Math.round((video.videoWidth - sw) / 2)
      const sy = Math.round((video.videoHeight - sh) / 2)
      // Giới hạn bề ngang để iPhone không phải xử lý ảnh 4K mỗi khung hình
      const scale = Math.min(1, 800 / sw)
      const w = Math.round(sw * scale)
      const h = Math.round(sh * scale)
      canvas.width = w
      canvas.height = h
      ctx.drawImage(video, sx, sy, sw, sh, 0, 0, w, h)

      const { data } = ctx.getImageData(0, 0, w, h)
      const luminances = new Uint8ClampedArray(w * h)
      for (let i = 0, p = 0; i < luminances.length; i++, p += 4) {
        luminances[i] = (data[p] * 299 + data[p + 1] * 587 + data[p + 2] * 114) / 1000
      }

      try {
        const bitmap = new BinaryBitmap(new HybridBinarizer(new RGBLuminanceSource(luminances, w, h)))
        return reader.decode(bitmap).getText()
      } catch {
        return null // khung hình này chưa đọc được — thử khung kế tiếp
      } finally {
        reader.reset()
      }
    },
  }
}

export function createDecoder(): Promise<FrameDecoder> {
  return hasNativeDetector() ? Promise.resolve(nativeDecoder()) : zxingDecoder()
}
