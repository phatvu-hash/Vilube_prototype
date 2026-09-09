// ============================================================
// Masterdata hàng hoá
//  - Nhóm thành phẩm  : trích từ Masterdata-HangHoa-Vilube.xlsx
//                       (ITEM_MASTER + PACKING_STANDARDS, inTruckingSchedule = Y)
//  - Nhóm bao bì (BB) : dựng theo tem carton trong HDSD (vd 9082228)
//  - Nhóm NVL         : dầu gốc / phụ gia đóng phuy — chờ masterdata thật của khách
// ============================================================
import type { WarehouseKind } from '@/types'

export interface ItemMaster {
  id: string
  wh: WarehouseKind // kho quản lý mặt hàng này
  code: string // mã hàng (itemCode ERP)
  name: string // tên hàng
  group: 'CARTON' | 'DRUM' | 'PAIL' | 'JCAN'
  packingCode: string // quy cách chuẩn hoá
  unitsPerCarton: number // số chai/can trong 1 thùng
  litres: number // dung tích 1 đơn vị (L)
  cartonsPerPallet: number // số kiện xếp được trên 1 pallet
  kgPerCarton: number // trọng lượng 1 kiện (kg)
}

export const items: ItemMaster[] = [
  { id: '103207', wh: 'BB', code: '103207', name: 'SPECIFIC CRDI DIESEL 5W40 12X1L', group: 'CARTON', packingCode: 'C12B1', unitsPerCarton: 12, litres: 1.0, cartonsPerPallet: 48, kgPerCarton: 12.0 },
  { id: '103796', wh: 'BB', code: '103796', name: 'SPECIFIC CRDi PLUS 5W30 12X1L', group: 'CARTON', packingCode: 'C12B1', unitsPerCarton: 12, litres: 1.0, cartonsPerPallet: 48, kgPerCarton: 12.0 },
  { id: '103897', wh: 'BB', code: '103897', name: 'TRANSOIL 10W30 12X1L', group: 'CARTON', packingCode: 'C12B1', unitsPerCarton: 12, litres: 1.0, cartonsPerPallet: 48, kgPerCarton: 12.0 },
  { id: '103900', wh: 'BB', code: '103900', name: 'TRANSOIL EXPERT 10W40 12X1L', group: 'CARTON', packingCode: 'C12B1', unitsPerCarton: 12, litres: 1.0, cartonsPerPallet: 48, kgPerCarton: 12.0 },
  { id: '103208', wh: 'BB', code: '103208', name: 'SPECIFIC CRDi DIESEL 5W40 4X4L', group: 'CARTON', packingCode: 'C4B4', unitsPerCarton: 4, litres: 4.0, cartonsPerPallet: 36, kgPerCarton: 15.5 },
  { id: '103285', wh: 'BB', code: '103285', name: 'TWIN SYN 20W50 4X4L', group: 'CARTON', packingCode: 'C4B4', unitsPerCarton: 4, litres: 4.0, cartonsPerPallet: 36, kgPerCarton: 15.5 },
  { id: '103797', wh: 'BB', code: '103797', name: 'SPECIFIC CRDi PLUS 5W30 4X4L', group: 'CARTON', packingCode: 'C4B4', unitsPerCarton: 4, litres: 4.0, cartonsPerPallet: 36, kgPerCarton: 15.5 },
  { id: '103898', wh: 'BB', code: '103898', name: 'TRANSOIL 10W30 4X4L', group: 'CARTON', packingCode: 'C4B4', unitsPerCarton: 4, litres: 4.0, cartonsPerPallet: 36, kgPerCarton: 15.5 },
  { id: '104919', wh: 'BB', code: '104919', name: 'TEKMA MEGA X 15W40 4X5L', group: 'CARTON', packingCode: 'C4B5', unitsPerCarton: 4, litres: 5.0, cartonsPerPallet: 24, kgPerCarton: 19.5 },
  { id: '105035', wh: 'BB', code: '105035', name: 'TEKMA TURBO POWER 15W40 4X5L', group: 'CARTON', packingCode: 'C4B5', unitsPerCarton: 4, litres: 5.0, cartonsPerPallet: 24, kgPerCarton: 19.5 },
  { id: '105544', wh: 'BB', code: '105544', name: '8100 X-CESS 5W40 4X5L', group: 'CARTON', packingCode: 'C4B5', unitsPerCarton: 4, litres: 5.0, cartonsPerPallet: 24, kgPerCarton: 19.5 },
  { id: '103283', wh: 'BB', code: '103283', name: 'TWIN SYN 20W50 20X1L', group: 'CARTON', packingCode: 'C20B1', unitsPerCarton: 20, litres: 1.0, cartonsPerPallet: 32, kgPerCarton: 20.0 },
  { id: '108964', wh: 'BB', code: '108964', name: 'H-TECH 100 4T 10W40 20X1L', group: 'CARTON', packingCode: 'C20B1', unitsPerCarton: 20, litres: 1.0, cartonsPerPallet: 32, kgPerCarton: 19.5 },
  { id: '830003', wh: 'BB', code: '830003', name: 'KATANA SCOOT 5W-40 - 15X1L', group: 'CARTON', packingCode: 'C15B1-IPONE4T', unitsPerCarton: 15, litres: 1.0, cartonsPerPallet: 40, kgPerCarton: 14.5 },
  { id: '830005', wh: 'BB', code: '830005', name: 'R4000 10W-40 - 15X1L', group: 'CARTON', packingCode: 'C15B1-IPONE4T', unitsPerCarton: 15, litres: 1.0, cartonsPerPallet: 40, kgPerCarton: 14.5 },
  { id: '108144', wh: 'BB', code: '108144', name: '3000 PLUS 4T 20W50 20X0.8L VN', group: 'CARTON', packingCode: 'C20B0.8', unitsPerCarton: 20, litres: 0.8, cartonsPerPallet: 32, kgPerCarton: 16.5 },
  { id: '112793', wh: 'BB', code: '112793', name: '5100 4T 10W30 20X0.8L VN', group: 'CARTON', packingCode: 'C20B0.8', unitsPerCarton: 20, litres: 0.8, cartonsPerPallet: 32, kgPerCarton: 16.5 },
  { id: '114610', wh: 'BB', code: '114610', name: 'DPF CLEAN 12X0.300L', group: 'CARTON', packingCode: 'C12B0.3', unitsPerCarton: 12, litres: 0.3, cartonsPerPallet: 120, kgPerCarton: 3.5 },
  { id: '111552', wh: 'BB', code: '111552', name: 'MULTIPOWER D-TURBO 10W30 CK 3X7L', group: 'CARTON', packingCode: 'C3B7', unitsPerCarton: 3, litres: 7.0, cartonsPerPallet: 30, kgPerCarton: 20.5 },
  { id: '102797', wh: 'BB', code: '102797', name: 'RUBRIC HM 68 200L', group: 'DRUM', packingCode: 'DRUM200', unitsPerCarton: 1, litres: 200.0, cartonsPerPallet: 4, kgPerCarton: 189.0 },
  { id: '102798', wh: 'BB', code: '102798', name: 'RUBRIC HM 46 200L', group: 'DRUM', packingCode: 'DRUM200', unitsPerCarton: 1, litres: 200.0, cartonsPerPallet: 4, kgPerCarton: 187.8 },
  { id: '103171', wh: 'BB', code: '103171', name: 'TWIN SYN 20W50 200L', group: 'DRUM', packingCode: 'DRUM200', unitsPerCarton: 1, litres: 200.0, cartonsPerPallet: 4, kgPerCarton: 189.5 },
  { id: '103798', wh: 'BB', code: '103798', name: 'SPECIFIC CRDi PLUS 5W30 200L', group: 'DRUM', packingCode: 'DRUM200', unitsPerCarton: 1, litres: 200.0, cartonsPerPallet: 4, kgPerCarton: 186.0 },
  { id: '104767', wh: 'BB', code: '104767', name: 'TEKMA TURBO POWER 15W40 200L VN', group: 'DRUM', packingCode: 'DRUM200', unitsPerCarton: 1, litres: 200.0, cartonsPerPallet: 4, kgPerCarton: 190.0 },
  { id: '109877', wh: 'BB', code: '109877', name: 'HDX 80W90 60L', group: 'DRUM', packingCode: 'DRUM60', unitsPerCarton: 1, litres: 60.0, cartonsPerPallet: 9, kgPerCarton: 58.0 },
  { id: '110185', wh: 'BB', code: '110185', name: 'MULTIPOWER PLUS 5W30 SP 60L', group: 'DRUM', packingCode: 'DRUM60', unitsPerCarton: 1, litres: 60.0, cartonsPerPallet: 9, kgPerCarton: 56.5 },
  { id: '110190', wh: 'BB', code: '110190', name: 'MULTIPOWER PLUS 5W40 SP 60L', group: 'DRUM', packingCode: 'DRUM60', unitsPerCarton: 1, litres: 60.0, cartonsPerPallet: 9, kgPerCarton: 56.0 },
  { id: '104179', wh: 'BB', code: '104179', name: '5100 4T 10W40 20L', group: 'PAIL', packingCode: 'PAIL20', unitsPerCarton: 1, litres: 20.0, cartonsPerPallet: 36, kgPerCarton: 18.5 },
  { id: '104206', wh: 'BB', code: '104206', name: '7100 4T 10W40 20L', group: 'PAIL', packingCode: 'PAIL20', unitsPerCarton: 1, litres: 20.0, cartonsPerPallet: 36, kgPerCarton: 18.5 },
  { id: '104215', wh: 'BB', code: '104215', name: '7100 4T 10W60 20L', group: 'PAIL', packingCode: 'PAIL20', unitsPerCarton: 1, litres: 20.0, cartonsPerPallet: 36, kgPerCarton: 18.5 },
  { id: '105703', wh: 'BB', code: '105703', name: 'TEKMA TURBO POWER 15W40 18L VN', group: 'PAIL', packingCode: 'PAIL18', unitsPerCarton: 1, litres: 18.0, cartonsPerPallet: 36, kgPerCarton: 17.0 },
  { id: '107262', wh: 'BB', code: '107262', name: 'HDX 80W90 20L', group: 'JCAN', packingCode: 'JCAN20', unitsPerCarton: 1, litres: 20.0, cartonsPerPallet: 48, kgPerCarton: 19.0 },
  { id: '107264', wh: 'BB', code: '107264', name: 'ATF VI 20L', group: 'JCAN', packingCode: 'JCAN20', unitsPerCarton: 1, litres: 20.0, cartonsPerPallet: 48, kgPerCarton: 18.5 },
  { id: '107265', wh: 'BB', code: '107265', name: 'TEKMA MEGA FLEET 15W40 20L', group: 'JCAN', packingCode: 'JCAN20', unitsPerCarton: 1, litres: 20.0, cartonsPerPallet: 48, kgPerCarton: 19.0 },
  { id: '107271', wh: 'BB', code: '107271', name: 'TEKMA TURBO POWER 15W40 20L', group: 'JCAN', packingCode: 'JCAN20', unitsPerCarton: 1, litres: 20.0, cartonsPerPallet: 48, kgPerCarton: 18.5 },

  // ---------- Bao bì (Kho Bao Bì) — bám tem carton trong HDSD ----------
  { id: '9082228', wh: 'BB', code: '9082228', name: 'Thùng carton Motul 315L', group: 'CARTON', packingCode: 'BB-CTN315', unitsPerCarton: 3000, litres: 0, cartonsPerPallet: 4, kgPerCarton: 255.0 },
  { id: '9082230', wh: 'BB', code: '9082230', name: 'Thùng carton Motul 4X4L', group: 'CARTON', packingCode: 'BB-CTN4X4', unitsPerCarton: 1500, litres: 0, cartonsPerPallet: 4, kgPerCarton: 240.0 },
  { id: '9083101', wh: 'BB', code: '9083101', name: 'Chai nhựa HDPE 1L Motul', group: 'CARTON', packingCode: 'BB-BTL1L', unitsPerCarton: 1200, litres: 0, cartonsPerPallet: 8, kgPerCarton: 78.0 },
  { id: '9083104', wh: 'BB', code: '9083104', name: 'Chai nhựa HDPE 4L Motul', group: 'CARTON', packingCode: 'BB-BTL4L', unitsPerCarton: 400, litres: 0, cartonsPerPallet: 8, kgPerCarton: 92.0 },
  { id: '9084010', wh: 'BB', code: '9084010', name: 'Nắp chai 1L có màng seal', group: 'CARTON', packingCode: 'BB-CAP1L', unitsPerCarton: 5000, litres: 0, cartonsPerPallet: 6, kgPerCarton: 45.0 },
  { id: '9085220', wh: 'BB', code: '9085220', name: 'Nhãn decal 1L Motul', group: 'CARTON', packingCode: 'BB-LBL1L', unitsPerCarton: 10000, litres: 0, cartonsPerPallet: 5, kgPerCarton: 32.0 },
  { id: '9086015', wh: 'BB', code: '9086015', name: 'Can nhựa 20L rỗng', group: 'CARTON', packingCode: 'BB-JC20', unitsPerCarton: 60, litres: 0, cartonsPerPallet: 6, kgPerCarton: 66.0 },

  // ---------- Nguyên vật liệu (Kho NVL) — dầu gốc / phụ gia đóng phuy ----------
  { id: '7101500', wh: 'NVL', code: '7101500', name: 'Dầu gốc SN 500 - phuy 200L', group: 'DRUM', packingCode: 'NVL-DRUM200', unitsPerCarton: 1, litres: 200.0, cartonsPerPallet: 4, kgPerCarton: 180.0 },
  { id: '7101150', wh: 'NVL', code: '7101150', name: 'Dầu gốc SN 150 - phuy 200L', group: 'DRUM', packingCode: 'NVL-DRUM200', unitsPerCarton: 1, litres: 200.0, cartonsPerPallet: 4, kgPerCarton: 176.0 },
  { id: '7101900', wh: 'NVL', code: '7101900', name: 'Dầu gốc BS 150 - phuy 200L', group: 'DRUM', packingCode: 'NVL-DRUM200', unitsPerCarton: 1, litres: 200.0, cartonsPerPallet: 4, kgPerCarton: 186.0 },
  { id: '7103004', wh: 'NVL', code: '7103004', name: 'Dầu gốc nhóm III YUBASE 4 - phuy 200L', group: 'DRUM', packingCode: 'NVL-DRUM200', unitsPerCarton: 1, litres: 200.0, cartonsPerPallet: 4, kgPerCarton: 172.0 },
  { id: '7202133', wh: 'NVL', code: '7202133', name: 'Phụ gia Infineum P5133 - phuy 200L', group: 'DRUM', packingCode: 'NVL-DRUM200', unitsPerCarton: 1, litres: 200.0, cartonsPerPallet: 4, kgPerCarton: 190.0 },
  { id: '7207750', wh: 'NVL', code: '7207750', name: 'Phụ gia Lubrizol LZ 7750 - phuy 200L', group: 'DRUM', packingCode: 'NVL-DRUM200', unitsPerCarton: 1, litres: 200.0, cartonsPerPallet: 4, kgPerCarton: 188.0 },
  { id: '7203910', wh: 'NVL', code: '7203910', name: 'Phụ gia VII Viscoplex 8-310 - phuy 200L', group: 'DRUM', packingCode: 'NVL-DRUM200', unitsPerCarton: 1, litres: 200.0, cartonsPerPallet: 4, kgPerCarton: 175.0 },
  { id: '7301330', wh: 'NVL', code: '7301330', name: 'Phụ gia PPD Viscoplex 1-330 - phuy 60L', group: 'DRUM', packingCode: 'NVL-DRUM60', unitsPerCarton: 1, litres: 60.0, cartonsPerPallet: 9, kgPerCarton: 55.0 }
]

export const itemById = Object.fromEntries(items.map((x) => [x.id, x]))
export const itemByCode = Object.fromEntries(items.map((x) => [x.code, x]))

/** Masterdata theo kho đang thao tác */
export const itemsOf = (wh: WarehouseKind) => items.filter((x) => x.wh === wh)
