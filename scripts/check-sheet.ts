// Kiểm tra nhanh một cặp CSV tải từ Google Sheet có parse sạch không.
// Dùng: esbuild bundle rồi node, truyền đường dẫn hai file CSV.
import { readFileSync } from 'node:fs'
import { buildDataSet } from '../shared/sheet'

const d = buildDataSet(readFileSync(process.argv[2], 'utf8'), readFileSync(process.argv[3], 'utf8'))
console.log('errors    :', d.errors.length)
d.errors.forEach((e) =>
  console.log('  !', e.sheet, 'dòng', e.row, 'cột', e.column, '=', JSON.stringify(e.value), '→', e.message),
)
console.log('asns      :', d.asns.length, d.asns.map((a) => `${a.code}(${a.status},${a.lines.length}d)`).join(' '))
console.log('putaways  :', d.putaways.length, d.putaways.map((t) => `${t.asnCode}(${t.pallets.length}p)`).join(' '))
console.log('pickOrders:', d.pickOrders.length, d.pickOrders.map((o) => `${o.code}(${o.lines.length}d)`).join(' '))
console.log('inventory :', d.inventory.length)
const a = d.asns.find((x) => x.code === '25000000002')
if (a) console.log('TC-BB-IN-01:', a.supplierName, '|', a.lines[0].qtyExpected, '|', a.lines[0].packages.map((p) => p.barcode).join(' '))
