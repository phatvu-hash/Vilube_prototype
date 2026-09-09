/**
 * Bộ mã hoá Code 128 (bảng B) — chỉ dùng để dựng ảnh mã vạch trong test, nhờ vậy
 * kiểm chứng được thư viện giải mã đọc đúng tem của kho mà không cần camera.
 * Không dùng trong app chạy thật.
 */

// Bề rộng các vạch của 107 ký hiệu Code 128, theo bảng chuẩn.
// Mỗi chuỗi đọc từ trái sang phải, xen kẽ vạch đen rồi khoảng trắng.
const PATTERNS = [
  '212222', '222122', '222221', '121223', '121322', '131222', '122213', '122312',
  '132212', '221213', '221312', '231212', '112232', '122132', '122231', '113222',
  '123122', '123221', '223211', '221132', '221231', '213212', '223112', '312131',
  '311222', '321122', '321221', '312212', '322112', '322211', '212123', '212321',
  '232121', '111323', '131123', '131321', '112313', '132113', '132311', '211313',
  '231113', '231311', '112133', '112331', '132131', '113123', '113321', '133121',
  '313121', '211331', '231131', '213113', '213311', '213131', '311123', '311321',
  '331121', '312113', '312311', '332111', '314111', '221411', '431111', '111224',
  '111422', '121124', '121421', '141122', '141221', '112214', '112412', '122114',
  '122411', '142112', '142211', '241211', '221114', '413111', '241112', '134111',
  '111242', '121142', '121241', '114212', '124112', '124211', '411212', '421112',
  '421211', '212141', '214121', '412121', '111143', '111341', '131141', '114113',
  '114311', '411113', '411311', '113141', '114131', '311141', '411131', '211412',
  '211214', '211232', '2331112',
]

const START_B = 104
const STOP = 106

/** Chuỗi ký tự → dãy bề rộng vạch, kèm vùng lặng hai đầu */
export function encodeCode128B(text: string): number[] {
  for (const ch of text) {
    const v = ch.charCodeAt(0)
    if (v < 32 || v > 126) throw new Error(`Code 128 bảng B không mã hoá được ký tự "${ch}"`)
  }

  const values = [START_B, ...[...text].map((c) => c.charCodeAt(0) - 32)]
  // Mã kiểm tra: start + tổng (giá trị × vị trí), lấy dư 103
  let sum = START_B
  values.slice(1).forEach((v, i) => (sum += v * (i + 1)))
  values.push(sum % 103, STOP)

  const widths: number[] = [10] // vùng lặng trái (khoảng trắng)
  values.forEach((v) => {
    for (const d of PATTERNS[v]) widths.push(Number(d))
  })
  widths.push(10) // vùng lặng phải
  return widths
}

/**
 * Dựng ảnh xám của mã vạch. Trả về mảng độ sáng từng điểm ảnh (0 đen, 255 trắng)
 * cùng kích thước — vừa đủ để đưa vào bộ giải mã.
 */
export function renderCode128(
  text: string,
  opts: { module?: number; height?: number } = {},
): { luminances: Uint8ClampedArray; width: number; height: number } {
  const module = opts.module ?? 3
  const height = opts.height ?? 60
  const widths = encodeCode128B(text)

  const row: number[] = []
  // widths[0] là vùng lặng nên bắt đầu bằng khoảng trắng, sau đó xen kẽ
  widths.forEach((w, i) => {
    const dark = i % 2 === 1
    for (let px = 0; px < w * module; px++) row.push(dark ? 0 : 255)
  })

  const width = row.length
  const luminances = new Uint8ClampedArray(width * height)
  for (let y = 0; y < height; y++) luminances.set(row, y * width)
  return { luminances, width, height }
}
