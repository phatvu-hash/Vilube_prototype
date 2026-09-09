// Xuất dữ liệu cần cho file template .xlsx ra JSON (chạy qua esbuild + node).
// Lấy thẳng từ shared/ nên template không bao giờ lệch với code.
import { SAMPLE_INBOUND_CSV, SAMPLE_OUTBOUND_CSV } from '../shared/sample'
import { items } from '../shared/items'
import { inboundTypes, locations, warehouses } from '../shared/catalog'

console.log(
  JSON.stringify({
    inboundCsv: SAMPLE_INBOUND_CSV,
    outboundCsv: SAMPLE_OUTBOUND_CSV,
    items: items.map((i) => ({ code: i.code, name: i.name, wh: i.wh, packing: i.packingCode, perCarton: i.unitsPerCarton, perPallet: i.cartonsPerPallet, kg: i.kgPerCarton })),
    locations: locations.filter((l) => l.type === 'storage').map((l) => ({ wh: warehouses.find((w) => w.id === l.whId)!.kind, zone: l.zone, code: l.code })),
    inboundTypes,
    warehouses: warehouses.map((w) => ({ kind: w.kind, code: w.code, name: w.name })),
  }),
)
