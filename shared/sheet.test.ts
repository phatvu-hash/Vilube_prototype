import { describe, expect, it } from 'vitest'
import { buildDataSet, nextPackageCode, parseCsv, toIsoDate } from './sheet'
import { SAMPLE_INBOUND_CSV, SAMPLE_OUTBOUND_CSV, sampleDataSet } from './sample'

const IN_HEAD =
  'KHO,MA_DON,SO_DON_NHAP,NHA_CUNG_CAP,NGAY_GIAO,LOAI_DON,GHI_CHU,MA_HANG,SO_LUONG,SO_LO,NSX,HSD,SO_KIEN,SL_MOI_KIEN,MA_KIEN_DAU,DA_NHAN'
const OUT_HEAD =
  'KHO,SO_DON_HANG,MA_DON_HANG,KHACH_HANG,NGAY_GIAO,GHI_CHU,KHU_VUC,VI_TRI,MA_PALLET,MA_HANG,SO_LO_NCC,SO_LO,NSX,HSD,SO_LUONG,DVT,TON_TAI_VI_TRI'

const inbound = (...rows: string[]) => [IN_HEAD, ...rows].join('\n')
const outbound = (...rows: string[]) => [OUT_HEAD, ...rows].join('\n')

const ROW_BB =
  'BB,25000000002,MDTRDS2220240,Motul Asia Pacific,20/08/2024,Nhập Nhà cung cấp,,9082228,9000,2613030000,27/09/2026,27/09/2028,3,3000,0008083,'

describe('parseCsv', () => {
  it('giữ nguyên dấu phẩy và xuống dòng nằm trong ô có nháy kép', () => {
    const rows = parseCsv('a,b\n"x, còn 1","dòng 1\ndòng 2"')
    expect(rows).toEqual([
      ['a', 'b'],
      ['x, còn 1', 'dòng 1\ndòng 2'],
    ])
  })

  it('đọc được nháy kép lồng nhau và bỏ dòng trắng', () => {
    expect(parseCsv('a\n"nói ""xin chào"""\n\n')).toEqual([['a'], ['nói "xin chào"']])
  })
})

describe('toIsoDate', () => {
  it('đổi dd/MM/yyyy sang yyyy-MM-dd', () => {
    expect(toIsoDate('20/08/2024')).toBe('2024-08-20')
    expect(toIsoDate('5-3-2026')).toBe('2026-03-05')
    expect(toIsoDate('2026-09-27')).toBe('2026-09-27')
  })

  it('ô trống là hợp lệ, chuỗi sai trả null', () => {
    expect(toIsoDate('')).toBe('')
    expect(toIsoDate('20 tháng 8')).toBeNull()
  })
})

describe('nextPackageCode', () => {
  it('giữ độ dài phần số và phần chữ đứng trước', () => {
    expect(nextPackageCode('0008083', 1)).toBe('0008084')
    expect(nextPackageCode('0008083', 2)).toBe('0008085')
    expect(nextPackageCode('DRM100001', 1)).toBe('DRM100002')
    expect(nextPackageCode('DRM099999', 1)).toBe('DRM100000')
  })
})

describe('buildDataSet — đơn nhập', () => {
  it('gộp các dòng cùng mã đơn thành một đơn', () => {
    const d = buildDataSet(
      inbound(
        ROW_BB,
        'BB,25000000002,MDTRDS2220240,Motul Asia Pacific,20/08/2024,Nhập Nhà cung cấp,,9083101,1200,2613030001,27/09/2026,27/09/2028,,,,',
      ),
      outbound(),
    )
    expect(d.errors).toEqual([])
    expect(d.asns).toHaveLength(1)
    expect(d.asns[0].lines).toHaveLength(2)
  })

  it('sinh đủ kiện và ghép barcode cho kho Bao Bì', () => {
    const d = buildDataSet(inbound(ROW_BB), outbound())
    const pkgs = d.asns[0].lines[0].packages
    expect(pkgs.map((p) => p.code)).toEqual(['0008083', '0008084', '0008085'])
    expect(pkgs[0].barcode).toBe('9082228|3000|PCE|0008083')
    expect(pkgs[2].barcode).toBe('9082228|3000|PCE|0008085')
  })

  it('kho NVL quét thẳng DrumID nên không ghép barcode', () => {
    const d = buildDataSet(
      inbound(
        'NVL,26000000010,MDNVL2400115,SK Enmove,20/08/2024,Nhập Nhà cung cấp,,7101500,540,2711050000,12/06/2026,12/06/2029,3,180,DRM100001,',
      ),
      outbound(),
    )
    const pkgs = d.asns[0].lines[0].packages
    expect(pkgs.map((p) => p.code)).toEqual(['DRM100001', 'DRM100002', 'DRM100003'])
    expect(pkgs[0].barcode).toBeUndefined()
  })

  it('bỏ trống ba cột kiện nghĩa là hàng chưa dán tem', () => {
    const d = buildDataSet(
      inbound('BB,25000000003,PNK,NCC,20/08/2024,Nhập Nhà cung cấp,,9083101,1200,LOT,14/07/2026,14/07/2028,,,,'),
      outbound(),
    )
    expect(d.errors).toEqual([])
    expect(d.asns[0].lines[0].packages).toEqual([])
  })

  it('DA_NHAN dựng sẵn công việc cất hàng', () => {
    const d = buildDataSet(inbound(ROW_BB.replace(/,$/, ',9000')), outbound())
    expect(d.asns[0].status).toBe('RECEIVED')
    expect(d.asns[0].lines[0].packages.every((p) => p.received)).toBe(true)
    expect(d.putaways).toHaveLength(1)
    expect(d.putaways[0].pallets[0].qty).toBe(9000)
  })

  it('kho NVL cất từng phuy một', () => {
    const d = buildDataSet(
      inbound(
        'NVL,26000000009,PNK,NCC,19/08/2024,Nhập Nhà cung cấp,,7101150,528,LOT,08/05/2026,08/05/2029,3,176,DRM090001,528',
      ),
      outbound(),
    )
    expect(d.putaways[0].pallets.map((p) => p.palletId)).toEqual([
      'DRM090001',
      'DRM090002',
      'DRM090003',
    ])
  })
})

describe('buildDataSet — báo lỗi từng dòng', () => {
  const firstError = (row: string) => buildDataSet(inbound(row), outbound()).errors[0]

  it('mã kho lạ', () => {
    expect(firstError(ROW_BB.replace('BB,', 'XX,'))).toMatchObject({
      column: 'KHO',
      row: 2,
      message: expect.stringContaining('BB hoặc NVL'),
    })
  })

  it('mã hàng không có trong danh mục', () => {
    expect(firstError(ROW_BB.replace(',9082228,', ',9999999,'))).toMatchObject({
      column: 'MA_HANG',
      message: expect.stringContaining('không có trong danh mục'),
    })
  })

  it('mã hàng đặt nhầm kho', () => {
    expect(firstError(ROW_BB.replace(',9082228,', ',7101500,'))).toMatchObject({
      column: 'MA_HANG',
      message: expect.stringContaining('thuộc kho NVL'),
    })
  })

  it('ngày sai định dạng', () => {
    expect(firstError(ROW_BB.replace('20/08/2024', '20 thang 8'))).toMatchObject({
      column: 'NGAY_GIAO',
    })
  })

  it('số lượng không phải số dương', () => {
    expect(firstError(ROW_BB.replace(',9000,', ',0,'))).toMatchObject({ column: 'SO_LUONG' })
  })

  it('kho BB cần mã kiện 7 chữ số', () => {
    expect(firstError(ROW_BB.replace(',0008083,', ',ABC123,'))).toMatchObject({
      column: 'MA_KIEN_DAU',
    })
  })

  it('điền thiếu một trong ba cột kiện', () => {
    expect(firstError(ROW_BB.replace(',3,3000,0008083,', ',3,,0008083,'))).toMatchObject({
      column: 'SO_KIEN',
    })
  })

  it('DA_NHAN vượt số lượng đặt', () => {
    expect(firstError(ROW_BB.replace(/,$/, ',99999'))).toMatchObject({ column: 'DA_NHAN' })
  })

  it('dòng lỗi bị bỏ qua nhưng dòng đúng vẫn tải', () => {
    const d = buildDataSet(inbound(ROW_BB.replace('BB,', 'XX,'), ROW_BB), outbound())
    expect(d.errors).toHaveLength(1)
    expect(d.asns).toHaveLength(1)
  })
})

describe('buildDataSet — đơn xuất', () => {
  const ROW_OUT =
    'BB,25000000002,MDTRDS2220241,Line 2,20/08/2024,,1001,A2.1,PLT000101,9082228,LOTNCC,LOT,27/09/2026,27/09/2028,6000,CÁI,'

  it('suy ra tồn tại vị trí gấp đôi số lượng yêu cầu khi bỏ trống', () => {
    const d = buildDataSet(inbound(), outbound(ROW_OUT))
    expect(d.errors).toEqual([])
    expect(d.inventory[0].qty).toBe(12000)
  })

  it('dùng tồn được chỉ định khi có điền', () => {
    const d = buildDataSet(inbound(), outbound(ROW_OUT.replace(/,$/, ',7000')))
    expect(d.inventory[0].qty).toBe(7000)
  })

  it('vị trí không thuộc kho thì báo lỗi', () => {
    const d = buildDataSet(inbound(), outbound(ROW_OUT.replace(',A2.1,', ',D2.1,')))
    expect(d.errors[0]).toMatchObject({ column: 'VI_TRI' })
  })

  it('đơn vị tính không hợp lệ với nhóm hàng', () => {
    const d = buildDataSet(inbound(), outbound(ROW_OUT.replace(',CÁI,', ',KG,')))
    expect(d.errors[0]).toMatchObject({ column: 'DVT' })
  })
})

describe('dữ liệu mẫu', () => {
  it('không có dòng nào lỗi', () => {
    expect(sampleDataSet().errors).toEqual([])
  })

  it('có đủ việc cho cả bốn luồng ở cả hai kho', () => {
    const d = sampleDataSet()
    const bb = (x: { whId: string }) => x.whId === 'w-bb'
    const nvl = (x: { whId: string }) => x.whId === 'w-nvl'
    expect(d.asns.filter(bb).some((a) => a.status === 'NEW')).toBe(true)
    expect(d.asns.filter(nvl).some((a) => a.status === 'NEW')).toBe(true)
    expect(d.putaways.filter(bb)).not.toHaveLength(0)
    expect(d.putaways.filter(nvl)).not.toHaveLength(0)
    expect(d.pickOrders.filter(bb)).not.toHaveLength(0)
    expect(d.pickOrders.filter(nvl)).not.toHaveLength(0)
  })

  it('giữ đúng số liệu bộ test case Phần 5 của HDSD', () => {
    const asn = sampleDataSet().asns.find((a) => a.code === '25000000002')!
    expect(asn.pnk).toBe('MDTRDS2220240')
    expect(asn.supplierName).toBe('Motul Asia Pacific')
    expect(asn.lines[0].qtyExpected).toBe(9000)
    expect(asn.lines[0].lot).toBe('2613030000')
    expect(asn.lines[0].packages[0].barcode).toBe('9082228|3000|PCE|0008083')
  })

  it('CSV mẫu và bộ dữ liệu dựng ra khớp nhau', () => {
    expect(buildDataSet(SAMPLE_INBOUND_CSV, SAMPLE_OUTBOUND_CSV).asns).toEqual(sampleDataSet().asns)
  })
})
