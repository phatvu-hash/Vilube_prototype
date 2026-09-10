import { describe, expect, it } from 'vitest'
import { buildDrumBarcode, genPackageId, parseCartonBarcode, parseDrumBarcode } from './barcode'

describe('parseDrumBarcode — tem phuy kho NVL', () => {
  it('cắt chuỗi thành mã hàng, số lô, số lượng và mã phuy', () => {
    expect(parseDrumBarcode('MTL001|2609101|200|DR0000001')).toEqual({
      raw: 'MTL001|2609101|200|DR0000001',
      itemCode: 'MTL001',
      lot: '2609101',
      qty: 200,
      drumId: 'DR0000001',
    })
  })

  it('bỏ khoảng trắng thừa và đọc được chữ thường trên tem', () => {
    expect(parseDrumBarcode('  mtl001|2609101|200|dr0000001  ')?.drumId).toBe('DR0000001')
  })

  it('đọc được số lượng lẻ, chấp nhận cả dấu phẩy thập phân', () => {
    expect(parseDrumBarcode('7101500|2711050000|180.5|DRM100001')?.qty).toBe(180.5)
    expect(parseDrumBarcode('7101500|2711050000|180,5|DRM100001')?.qty).toBe(180.5)
  })

  it('trả null khi thiếu phần, thừa phần hoặc số lượng không hợp lệ', () => {
    expect(parseDrumBarcode('MTL001|2609101|200')).toBeNull()
    expect(parseDrumBarcode('MTL001|2609101|200|DR0000001|X')).toBeNull()
    expect(parseDrumBarcode('MTL001|2609101|0|DR0000001')).toBeNull()
    expect(parseDrumBarcode('MTL001|2609101|hai trăm|DR0000001')).toBeNull()
    expect(parseDrumBarcode('9082228|3000|PCE|0008083')).toBeNull()
  })

  it('không nhầm với tem carton kho Bao Bì', () => {
    expect(parseCartonBarcode('MTL001|2609101|200|DR0000001')).toBeNull()
  })

  it('dựng lại đúng chuỗi đã cắt', () => {
    expect(buildDrumBarcode('MTL001', '2609101', 200, 'DR0000001')).toBe(
      'MTL001|2609101|200|DR0000001',
    )
  })
})

describe('genPackageId — sinh mã kiện cho hàng chưa có tem', () => {
  it('nối tiếp mã lớn nhất đang có, giữ 6 chữ số', () => {
    expect(genPackageId('DRM', ['DRM000004', 'DRM000011', 'PLT000090'])).toBe('DRM000012')
    expect(genPackageId('PLT', ['DRM000011', 'PLT000090'])).toBe('PLT000091')
  })

  it('chưa có mã nào thì bắt đầu từ 1', () => {
    expect(genPackageId('DRM', [])).toBe('DRM000001')
    expect(genPackageId('DRM', ['DR0000001', 'rác'])).toBe('DRM000001')
  })

  it('giữ nguyên độ dài số của mã dài hơn 6 chữ số', () => {
    expect(genPackageId('DRM', ['DRM09000123'])).toBe('DRM09000124')
  })
})
