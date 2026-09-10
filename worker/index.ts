// ============================================================
// Worker đọc Google Sheet đơn nhập / đơn xuất rồi trả JSON cho app.
//
// Đọc hộ ở phía server thay vì để trình duyệt gọi thẳng Google, nhờ vậy tránh
// được ba thứ cùng lúc: lỗi CORS, độ trễ cache của link publish-to-web, và lộ
// id Sheet trong file JS công khai.
// ============================================================
import { buildDataSet, type DataSet } from '../shared/sheet'
import { SAMPLE_INBOUND_CSV, SAMPLE_OUTBOUND_CSV } from '../shared/sample'

interface Env {
  SHEET_ID?: string
}

export interface DonHangResponse extends DataSet {
  generatedAt: string
  /** 'sheet' = đọc từ Google · 'sample' = bộ mẫu trong code */
  source: 'sheet' | 'sample'
  /** Lý do phải dùng bộ mẫu, hiện lên app để biết đường sửa */
  notice?: string
}

const TAB_INBOUND = 'DON_NHAP'
const TAB_OUTBOUND = 'DON_XUAT'
const CACHE_SECONDS = 60

/**
 * headers=1 là bắt buộc: thiếu nó, Google tự đoán số dòng tiêu đề và khi cả bảng
 * toàn ô chữ (số nhập dạng text) nó gộp luôn mấy chục dòng đầu vào tiêu đề —
 * app nhận về bảng rỗng mà không có lỗi nào để báo.
 */
const csvUrl = (sheetId: string, tab: string) =>
  `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&headers=1&sheet=${encodeURIComponent(tab)}`

/** Google trả trang HTML khi Sheet chưa được chia sẻ — nhận ra để báo cho đúng */
const looksLikeHtml = (text: string) => text.trimStart().startsWith('<')

async function fetchTab(sheetId: string, tab: string): Promise<string> {
  const res = await fetch(csvUrl(sheetId, tab), {
    headers: { 'user-agent': 'vilube-prototype-worker' },
  })
  if (!res.ok) throw new Error(`Tab ${tab}: Google trả mã ${res.status}`)
  const text = await res.text()
  if (looksLikeHtml(text))
    throw new Error(`Tab ${tab}: Sheet chưa được chia sẻ ở mức "ai có link đều xem được"`)
  return text
}

function sampleResponse(notice?: string): DonHangResponse {
  return {
    ...buildDataSet(SAMPLE_INBOUND_CSV, SAMPLE_OUTBOUND_CSV),
    generatedAt: new Date().toISOString(),
    source: 'sample',
    notice,
  }
}

async function loadDonHang(env: Env): Promise<DonHangResponse> {
  const sheetId = (env.SHEET_ID ?? '').trim()
  if (!sheetId)
    return sampleResponse('Chưa cấu hình SHEET_ID nên đang dùng bộ dữ liệu mẫu trong code.')

  try {
    const [inbound, outbound] = await Promise.all([
      fetchTab(sheetId, TAB_INBOUND),
      fetchTab(sheetId, TAB_OUTBOUND),
    ])
    return {
      ...buildDataSet(inbound, outbound),
      generatedAt: new Date().toISOString(),
      source: 'sheet',
    }
  } catch (err) {
    // Không đọc được Sheet thì vẫn cho demo chạy bằng bộ mẫu, kèm lý do rõ ràng
    return sampleResponse(
      `Không đọc được Google Sheet nên đang dùng bộ dữ liệu mẫu. ${(err as Error).message}`,
    )
  }
}

const json = (body: unknown, cacheSeconds: number) =>
  new Response(JSON.stringify(body), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': cacheSeconds > 0 ? `public, max-age=${cacheSeconds}` : 'no-store',
    },
  })

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url)
    if (url.pathname !== '/api/donhang')
      return json({ error: 'Không có endpoint này' }, 0)

    // Nút "Tải lại" trong app gửi refresh=1 để lấy bản mới nhất từ Sheet
    const refresh = url.searchParams.get('refresh') === '1'
    const cache = caches.default
    const cacheKey = new Request(new URL('/api/donhang', url.origin).toString(), { method: 'GET' })

    if (!refresh) {
      const hit = await cache.match(cacheKey)
      if (hit) return hit
    }

    const data = await loadDonHang(env)
    // Chỉ cache khi đọc được Sheet thật. Bộ mẫu đi kèm thông báo lỗi nên phải
    // trả no-store, không thì sửa xong cấu hình vẫn thấy lỗi cũ suốt một phút.
    const fromSheet = data.source === 'sheet'
    const res = json(data, fromSheet ? CACHE_SECONDS : 0)
    if (fromSheet) ctx.waitUntil(cache.put(cacheKey, res.clone()))
    return res
  },
}
