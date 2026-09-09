// ============================================================
// Masterdata hàng hoá — trích từ Masterdata-HangHoa-Vilube.xlsx
// (ITEM_MASTER + PACKING_STANDARDS, lọc inTruckingSchedule = Y)
// ============================================================

export interface ItemMaster {
  id: string
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
  { id: '103207', code: '103207', name: 'SPECIFIC CRDI DIESEL 5W40 12X1L', group: 'CARTON', packingCode: 'C12B1', unitsPerCarton: 12, litres: 1.0, cartonsPerPallet: 48, kgPerCarton: 12.0 },
  { id: '103796', code: '103796', name: 'SPECIFIC CRDi PLUS 5W30 12X1L', group: 'CARTON', packingCode: 'C12B1', unitsPerCarton: 12, litres: 1.0, cartonsPerPallet: 48, kgPerCarton: 12.0 },
  { id: '103897', code: '103897', name: 'TRANSOIL 10W30 12X1L', group: 'CARTON', packingCode: 'C12B1', unitsPerCarton: 12, litres: 1.0, cartonsPerPallet: 48, kgPerCarton: 12.0 },
  { id: '103900', code: '103900', name: 'TRANSOIL EXPERT 10W40 12X1L', group: 'CARTON', packingCode: 'C12B1', unitsPerCarton: 12, litres: 1.0, cartonsPerPallet: 48, kgPerCarton: 12.0 },
  { id: '103208', code: '103208', name: 'SPECIFIC CRDi DIESEL 5W40 4X4L', group: 'CARTON', packingCode: 'C4B4', unitsPerCarton: 4, litres: 4.0, cartonsPerPallet: 36, kgPerCarton: 15.5 },
  { id: '103285', code: '103285', name: 'TWIN SYN 20W50 4X4L', group: 'CARTON', packingCode: 'C4B4', unitsPerCarton: 4, litres: 4.0, cartonsPerPallet: 36, kgPerCarton: 15.5 },
  { id: '103797', code: '103797', name: 'SPECIFIC CRDi PLUS 5W30 4X4L', group: 'CARTON', packingCode: 'C4B4', unitsPerCarton: 4, litres: 4.0, cartonsPerPallet: 36, kgPerCarton: 15.5 },
  { id: '103898', code: '103898', name: 'TRANSOIL 10W30 4X4L', group: 'CARTON', packingCode: 'C4B4', unitsPerCarton: 4, litres: 4.0, cartonsPerPallet: 36, kgPerCarton: 15.5 },
  { id: '104919', code: '104919', name: 'TEKMA MEGA X 15W40 4X5L', group: 'CARTON', packingCode: 'C4B5', unitsPerCarton: 4, litres: 5.0, cartonsPerPallet: 24, kgPerCarton: 19.5 },
  { id: '105035', code: '105035', name: 'TEKMA TURBO POWER 15W40 4X5L', group: 'CARTON', packingCode: 'C4B5', unitsPerCarton: 4, litres: 5.0, cartonsPerPallet: 24, kgPerCarton: 19.5 },
  { id: '105544', code: '105544', name: '8100 X-CESS 5W40 4X5L', group: 'CARTON', packingCode: 'C4B5', unitsPerCarton: 4, litres: 5.0, cartonsPerPallet: 24, kgPerCarton: 19.5 },
  { id: '103283', code: '103283', name: 'TWIN SYN 20W50 20X1L', group: 'CARTON', packingCode: 'C20B1', unitsPerCarton: 20, litres: 1.0, cartonsPerPallet: 32, kgPerCarton: 20.0 },
  { id: '108964', code: '108964', name: 'H-TECH 100 4T 10W40 20X1L', group: 'CARTON', packingCode: 'C20B1', unitsPerCarton: 20, litres: 1.0, cartonsPerPallet: 32, kgPerCarton: 19.5 },
  { id: '830003', code: '830003', name: 'KATANA SCOOT 5W-40 - 15X1L', group: 'CARTON', packingCode: 'C15B1-IPONE4T', unitsPerCarton: 15, litres: 1.0, cartonsPerPallet: 40, kgPerCarton: 14.5 },
  { id: '830005', code: '830005', name: 'R4000 10W-40 - 15X1L', group: 'CARTON', packingCode: 'C15B1-IPONE4T', unitsPerCarton: 15, litres: 1.0, cartonsPerPallet: 40, kgPerCarton: 14.5 },
  { id: '108144', code: '108144', name: '3000 PLUS 4T 20W50 20X0.8L VN', group: 'CARTON', packingCode: 'C20B0.8', unitsPerCarton: 20, litres: 0.8, cartonsPerPallet: 32, kgPerCarton: 16.5 },
  { id: '112793', code: '112793', name: '5100 4T 10W30 20X0.8L VN', group: 'CARTON', packingCode: 'C20B0.8', unitsPerCarton: 20, litres: 0.8, cartonsPerPallet: 32, kgPerCarton: 16.5 },
  { id: '114610', code: '114610', name: 'DPF CLEAN 12X0.300L', group: 'CARTON', packingCode: 'C12B0.3', unitsPerCarton: 12, litres: 0.3, cartonsPerPallet: 120, kgPerCarton: 3.5 },
  { id: '111552', code: '111552', name: 'MULTIPOWER D-TURBO 10W30 CK 3X7L', group: 'CARTON', packingCode: 'C3B7', unitsPerCarton: 3, litres: 7.0, cartonsPerPallet: 30, kgPerCarton: 20.5 },
  { id: '102797', code: '102797', name: 'RUBRIC HM 68 200L', group: 'DRUM', packingCode: 'DRUM200', unitsPerCarton: 1, litres: 200.0, cartonsPerPallet: 4, kgPerCarton: 189.0 },
  { id: '102798', code: '102798', name: 'RUBRIC HM 46 200L', group: 'DRUM', packingCode: 'DRUM200', unitsPerCarton: 1, litres: 200.0, cartonsPerPallet: 4, kgPerCarton: 187.8 },
  { id: '103171', code: '103171', name: 'TWIN SYN 20W50 200L', group: 'DRUM', packingCode: 'DRUM200', unitsPerCarton: 1, litres: 200.0, cartonsPerPallet: 4, kgPerCarton: 189.5 },
  { id: '103798', code: '103798', name: 'SPECIFIC CRDi PLUS 5W30 200L', group: 'DRUM', packingCode: 'DRUM200', unitsPerCarton: 1, litres: 200.0, cartonsPerPallet: 4, kgPerCarton: 186.0 },
  { id: '104767', code: '104767', name: 'TEKMA TURBO POWER 15W40 200L VN', group: 'DRUM', packingCode: 'DRUM200', unitsPerCarton: 1, litres: 200.0, cartonsPerPallet: 4, kgPerCarton: 190.0 },
  { id: '109877', code: '109877', name: 'HDX 80W90 60L', group: 'DRUM', packingCode: 'DRUM60', unitsPerCarton: 1, litres: 60.0, cartonsPerPallet: 9, kgPerCarton: 58.0 },
  { id: '110185', code: '110185', name: 'MULTIPOWER PLUS 5W30 SP 60L', group: 'DRUM', packingCode: 'DRUM60', unitsPerCarton: 1, litres: 60.0, cartonsPerPallet: 9, kgPerCarton: 56.5 },
  { id: '110190', code: '110190', name: 'MULTIPOWER PLUS 5W40 SP 60L', group: 'DRUM', packingCode: 'DRUM60', unitsPerCarton: 1, litres: 60.0, cartonsPerPallet: 9, kgPerCarton: 56.0 },
  { id: '104179', code: '104179', name: '5100 4T 10W40 20L', group: 'PAIL', packingCode: 'PAIL20', unitsPerCarton: 1, litres: 20.0, cartonsPerPallet: 36, kgPerCarton: 18.5 },
  { id: '104206', code: '104206', name: '7100 4T 10W40 20L', group: 'PAIL', packingCode: 'PAIL20', unitsPerCarton: 1, litres: 20.0, cartonsPerPallet: 36, kgPerCarton: 18.5 },
  { id: '104215', code: '104215', name: '7100 4T 10W60 20L', group: 'PAIL', packingCode: 'PAIL20', unitsPerCarton: 1, litres: 20.0, cartonsPerPallet: 36, kgPerCarton: 18.5 },
  { id: '105703', code: '105703', name: 'TEKMA TURBO POWER 15W40 18L VN', group: 'PAIL', packingCode: 'PAIL18', unitsPerCarton: 1, litres: 18.0, cartonsPerPallet: 36, kgPerCarton: 17.0 },
  { id: '107262', code: '107262', name: 'HDX 80W90 20L', group: 'JCAN', packingCode: 'JCAN20', unitsPerCarton: 1, litres: 20.0, cartonsPerPallet: 48, kgPerCarton: 19.0 },
  { id: '107264', code: '107264', name: 'ATF VI 20L', group: 'JCAN', packingCode: 'JCAN20', unitsPerCarton: 1, litres: 20.0, cartonsPerPallet: 48, kgPerCarton: 18.5 },
  { id: '107265', code: '107265', name: 'TEKMA MEGA FLEET 15W40 20L', group: 'JCAN', packingCode: 'JCAN20', unitsPerCarton: 1, litres: 20.0, cartonsPerPallet: 48, kgPerCarton: 19.0 },
  { id: '107271', code: '107271', name: 'TEKMA TURBO POWER 15W40 20L', group: 'JCAN', packingCode: 'JCAN20', unitsPerCarton: 1, litres: 20.0, cartonsPerPallet: 48, kgPerCarton: 18.5 }
]

export const itemById = Object.fromEntries(items.map((x) => [x.id, x]))
export const itemByCode = Object.fromEntries(items.map((x) => [x.code, x]))
