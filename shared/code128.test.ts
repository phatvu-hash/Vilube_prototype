import { describe, expect, it } from 'vitest'
import {
  BarcodeFormat,
  BinaryBitmap,
  DecodeHintType,
  HybridBinarizer,
  MultiFormatReader,
  RGBLuminanceSource,
} from '@zxing/library'
import { renderCode128 } from './code128'
import { buildCartonBarcode } from './barcode'

/** Giải mã đúng như trong app: cùng thư viện, cùng danh sách định dạng */
function decode(text: string): string {
  const { luminances, width, height } = renderCode128(text)
  const source = new RGBLuminanceSource(luminances, width, height)
  const reader = new MultiFormatReader()
  reader.setHints(
    new Map<number, unknown>([
      [DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.CODE_128, BarcodeFormat.CODE_39]],
      [DecodeHintType.TRY_HARDER, true],
    ]),
  )
  return reader.decode(new BinaryBitmap(new HybridBinarizer(source))).getText()
}

describe('đọc tem carton bằng thư viện giải mã của app', () => {
  it('đọc đúng tem thật của kho, kể cả dấu sổ đứng', () => {
    expect(decode('9082228|3000|PCE|0008083')).toBe('9082228|3000|PCE|0008083')
  })

  it('đọc được mọi mã carton do hệ thống sinh ra', () => {
    for (const check of ['0008083', '0008084', '0008085', '0009001']) {
      const bc = buildCartonBarcode('9082228', 3000, 'PCE', check)
      expect(decode(bc)).toBe(bc)
    }
  })

  it('đọc được mã phuy kho NVL', () => {
    expect(decode('DRM100001')).toBe('DRM100001')
  })

  it('đọc được mã vị trí và mã pallet', () => {
    expect(decode('A2.1')).toBe('A2.1')
    expect(decode('PLT000101')).toBe('PLT000101')
  })
})
