// ============================================================
// Masterdata hàng hoá — DỮ LIỆU DEMO
//
// Hai kho trong hệ thống quản lý bao bì và nguyên vật liệu, không quản lý thành
// phẩm, nên danh mục dưới đây không lấy từ Masterdata-HangHoa-Vilube.xlsx (file
// đó là danh mục dầu nhờn thành phẩm). Mã 9082228 lấy từ tem carton in trong
// HDSD; các mã còn lại dựng theo quy cách thực tế của ngành để chạy demo.
//
// Thay toàn bộ bằng danh mục thật khi khách gửi — xem Phần 6 của HDSD.
// ============================================================
import type { WarehouseKind } from './types'

export interface ItemMaster {
  id: string
  wh: WarehouseKind // kho quản lý mặt hàng này
  code: string // mã hàng (itemCode ERP)
  name: string // tên hàng
  group: 'CARTON' | 'DRUM' // CARTON → CÁI/THÙNG/PALLET · DRUM → KG/DRUM/PALLET
  packingCode: string // quy cách chuẩn hoá
  unitsPerCarton: number // số đơn vị cơ sở trong 1 kiện
  cartonsPerPallet: number // số kiện xếp được trên 1 pallet
  kgPerCarton: number // trọng lượng 1 kiện (kg) · nhóm DRUM là kg 1 phuy
}

export const items: ItemMaster[] = [
  // ---------------- Kho Bao Bì ----------------
  { id: '9082228', wh: 'BB', code: '9082228', name: 'Thùng carton Motul 315L', group: 'CARTON', packingCode: 'BB-CTN315', unitsPerCarton: 3000, cartonsPerPallet: 4, kgPerCarton: 255 },
  { id: '9082230', wh: 'BB', code: '9082230', name: 'Thùng carton Motul 4X4L', group: 'CARTON', packingCode: 'BB-CTN4X4', unitsPerCarton: 1500, cartonsPerPallet: 4, kgPerCarton: 240 },
  { id: '9082235', wh: 'BB', code: '9082235', name: 'Thùng carton Motul 12X1L', group: 'CARTON', packingCode: 'BB-CTN12X1', unitsPerCarton: 2000, cartonsPerPallet: 4, kgPerCarton: 232 },
  { id: '9083101', wh: 'BB', code: '9083101', name: 'Chai nhựa HDPE 1L Motul', group: 'CARTON', packingCode: 'BB-BTL1L', unitsPerCarton: 1200, cartonsPerPallet: 8, kgPerCarton: 78 },
  { id: '9083104', wh: 'BB', code: '9083104', name: 'Chai nhựa HDPE 4L Motul', group: 'CARTON', packingCode: 'BB-BTL4L', unitsPerCarton: 400, cartonsPerPallet: 8, kgPerCarton: 92 },
  { id: '9083108', wh: 'BB', code: '9083108', name: 'Chai nhựa HDPE 0.8L Motul', group: 'CARTON', packingCode: 'BB-BTL08L', unitsPerCarton: 1400, cartonsPerPallet: 8, kgPerCarton: 74 },
  { id: '9084010', wh: 'BB', code: '9084010', name: 'Nắp chai 1L có màng seal', group: 'CARTON', packingCode: 'BB-CAP1L', unitsPerCarton: 5000, cartonsPerPallet: 6, kgPerCarton: 45 },
  { id: '9084012', wh: 'BB', code: '9084012', name: 'Nắp chai 4L có quai', group: 'CARTON', packingCode: 'BB-CAP4L', unitsPerCarton: 2500, cartonsPerPallet: 6, kgPerCarton: 52 },
  { id: '9084020', wh: 'BB', code: '9084020', name: 'Nắp phuy 200L', group: 'CARTON', packingCode: 'BB-CAP200', unitsPerCarton: 400, cartonsPerPallet: 6, kgPerCarton: 60 },
  { id: '9085220', wh: 'BB', code: '9085220', name: 'Nhãn decal 1L Motul', group: 'CARTON', packingCode: 'BB-LBL1L', unitsPerCarton: 10000, cartonsPerPallet: 5, kgPerCarton: 32 },
  { id: '9085224', wh: 'BB', code: '9085224', name: 'Nhãn decal 4L Motul', group: 'CARTON', packingCode: 'BB-LBL4L', unitsPerCarton: 6000, cartonsPerPallet: 5, kgPerCarton: 38 },
  { id: '9085230', wh: 'BB', code: '9085230', name: 'Nhãn thùng carton', group: 'CARTON', packingCode: 'BB-LBLCTN', unitsPerCarton: 8000, cartonsPerPallet: 5, kgPerCarton: 30 },
  { id: '9086015', wh: 'BB', code: '9086015', name: 'Can nhựa 20L rỗng', group: 'CARTON', packingCode: 'BB-JC20', unitsPerCarton: 60, cartonsPerPallet: 6, kgPerCarton: 66 },
  { id: '9086018', wh: 'BB', code: '9086018', name: 'Can nhựa 18L rỗng', group: 'CARTON', packingCode: 'BB-JC18', unitsPerCarton: 60, cartonsPerPallet: 6, kgPerCarton: 62 },
  { id: '9087001', wh: 'BB', code: '9087001', name: 'Màng co PE quấn pallet', group: 'CARTON', packingCode: 'BB-FILM', unitsPerCarton: 24, cartonsPerPallet: 10, kgPerCarton: 48 },
  { id: '9088001', wh: 'BB', code: '9088001', name: 'Pallet gỗ 1200x1000', group: 'CARTON', packingCode: 'BB-PLTW', unitsPerCarton: 20, cartonsPerPallet: 1, kgPerCarton: 340 },

  // ---------------- Kho Nguyên vật liệu ----------------
  { id: '7101150', wh: 'NVL', code: '7101150', name: 'Dầu gốc SN 150 - phuy 200L', group: 'DRUM', packingCode: 'NVL-DRUM200', unitsPerCarton: 1, cartonsPerPallet: 4, kgPerCarton: 176 },
  { id: '7101500', wh: 'NVL', code: '7101500', name: 'Dầu gốc SN 500 - phuy 200L', group: 'DRUM', packingCode: 'NVL-DRUM200', unitsPerCarton: 1, cartonsPerPallet: 4, kgPerCarton: 180 },
  { id: '7101900', wh: 'NVL', code: '7101900', name: 'Dầu gốc BS 150 - phuy 200L', group: 'DRUM', packingCode: 'NVL-DRUM200', unitsPerCarton: 1, cartonsPerPallet: 4, kgPerCarton: 186 },
  { id: '7102060', wh: 'NVL', code: '7102060', name: 'Dầu gốc nhóm II 150N - phuy 200L', group: 'DRUM', packingCode: 'NVL-DRUM200', unitsPerCarton: 1, cartonsPerPallet: 4, kgPerCarton: 178 },
  { id: '7102150', wh: 'NVL', code: '7102150', name: 'Dầu gốc nhóm II 600N - phuy 200L', group: 'DRUM', packingCode: 'NVL-DRUM200', unitsPerCarton: 1, cartonsPerPallet: 4, kgPerCarton: 182 },
  { id: '7103004', wh: 'NVL', code: '7103004', name: 'Dầu gốc nhóm III YUBASE 4 - phuy 200L', group: 'DRUM', packingCode: 'NVL-DRUM200', unitsPerCarton: 1, cartonsPerPallet: 4, kgPerCarton: 172 },
  { id: '7103006', wh: 'NVL', code: '7103006', name: 'Dầu gốc nhóm III YUBASE 6 - phuy 200L', group: 'DRUM', packingCode: 'NVL-DRUM200', unitsPerCarton: 1, cartonsPerPallet: 4, kgPerCarton: 174 },
  { id: '7202133', wh: 'NVL', code: '7202133', name: 'Phụ gia DI Infineum P5133 - phuy 200L', group: 'DRUM', packingCode: 'NVL-DRUM200', unitsPerCarton: 1, cartonsPerPallet: 4, kgPerCarton: 190 },
  { id: '7202140', wh: 'NVL', code: '7202140', name: 'Phụ gia DI Infineum C9425 - phuy 200L', group: 'DRUM', packingCode: 'NVL-DRUM200', unitsPerCarton: 1, cartonsPerPallet: 4, kgPerCarton: 188 },
  { id: '7207750', wh: 'NVL', code: '7207750', name: 'Phụ gia DI Lubrizol LZ 7750 - phuy 200L', group: 'DRUM', packingCode: 'NVL-DRUM200', unitsPerCarton: 1, cartonsPerPallet: 4, kgPerCarton: 188 },
  { id: '7203910', wh: 'NVL', code: '7203910', name: 'Phụ gia VII Viscoplex 8-310 - phuy 200L', group: 'DRUM', packingCode: 'NVL-DRUM200', unitsPerCarton: 1, cartonsPerPallet: 4, kgPerCarton: 175 },
  { id: '7301330', wh: 'NVL', code: '7301330', name: 'Phụ gia PPD Viscoplex 1-330 - phuy 60L', group: 'DRUM', packingCode: 'NVL-DRUM60', unitsPerCarton: 1, cartonsPerPallet: 9, kgPerCarton: 55 },
  { id: '7401001', wh: 'NVL', code: '7401001', name: 'Chất tạo màu dầu nhờn - phuy 60L', group: 'DRUM', packingCode: 'NVL-DRUM60', unitsPerCarton: 1, cartonsPerPallet: 9, kgPerCarton: 60 },

  // Dầu nhờn Motul đóng phuy 200L — tem dán trên phuy là DrumID bốn phần
  // (MTL001|2609101|200|DR0000001), xem shared/barcode.ts
  { id: 'MTL001', wh: 'NVL', code: 'MTL001', name: 'Motul 300V Competition 5W-40 - phuy 200L', group: 'DRUM', packingCode: 'NVL-DRUM200', unitsPerCarton: 1, cartonsPerPallet: 4, kgPerCarton: 200 },
  { id: 'MTL002', wh: 'NVL', code: 'MTL002', name: 'Motul 8100 X-clean 5W-40 - phuy 200L', group: 'DRUM', packingCode: 'NVL-DRUM200', unitsPerCarton: 1, cartonsPerPallet: 4, kgPerCarton: 200 },
  { id: 'MTL003', wh: 'NVL', code: 'MTL003', name: 'Motul H-Tech 100 Plus 5W-30 - phuy 200L', group: 'DRUM', packingCode: 'NVL-DRUM200', unitsPerCarton: 1, cartonsPerPallet: 4, kgPerCarton: 200 },
  { id: 'MTL004', wh: 'NVL', code: 'MTL004', name: 'Motul Multipower 20W-50 - phuy 200L', group: 'DRUM', packingCode: 'NVL-DRUM200', unitsPerCarton: 1, cartonsPerPallet: 4, kgPerCarton: 200 },
  { id: 'MTL005', wh: 'NVL', code: 'MTL005', name: 'Motul Gear 300 75W-90 - phuy 200L', group: 'DRUM', packingCode: 'NVL-DRUM200', unitsPerCarton: 1, cartonsPerPallet: 4, kgPerCarton: 200 },
]

export const itemById = Object.fromEntries(items.map((x) => [x.id, x]))
export const itemByCode = Object.fromEntries(items.map((x) => [x.code, x]))

/** Masterdata theo kho đang thao tác */
export const itemsOf = (wh: WarehouseKind) => items.filter((x) => x.wh === wh)
