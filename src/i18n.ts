import { create } from 'zustand'

export type Lang = 'vi' | 'en'

interface LangState {
  lang: Lang
  setLang: (l: Lang) => void
}

/** Ngôn ngữ hiển thị — đổi ở màn hình Chọn kho thao tác, áp dụng cho toàn app */
export const useLang = create<LangState>((set) => ({
  lang: 'vi',
  setLang: (lang) => set({ lang }),
}))

/**
 * Từ điển Việt → Anh. Khoá chính là câu tiếng Việt để code đọc vẫn hiểu ngay,
 * chỗ nào có tham số thì dùng {0}, {1}… theo thứ tự truyền vào.
 */
const EN: Record<string, string> = {
  // ---------- Chung ----------
  'Tiếng Việt': 'Vietnamese',
  'English': 'English',
  'Ngôn ngữ': 'Language',
  'ĐỒNG Ý': 'OK',
  'Đóng': 'Close',
  'Quay lại': 'Back',
  'Quét mã': 'Scan',
  'Quét {0}': 'Scan {0}',
  'Chi tiết công việc': 'Job document',
  'Làm mới': 'Refresh',
  'Bộ lọc tính năng': 'Feature filter',
  'Tính năng': 'Feature',
  'Không có dữ liệu': 'No data',
  'Không còn mã nào để quét': 'No code left to scan',
  'Mô phỏng máy quét — chạm vào mã bên dưới để "quét".':
    'Scanner simulation — tap a code below to "scan" it.',

  // ---------- Quét bằng camera ----------
  'Quét bằng camera': 'Scan with camera',
  'Đang mở camera…': 'Opening camera…',
  'Đưa mã vạch nằm gọn trong khung, cách máy khoảng một gang tay.':
    'Line the barcode up inside the frame, about a hand span from the device.',
  'Chọn mã trong danh sách': 'Pick a code from the list',
  'Bạn đã từ chối quyền dùng camera. Bật lại trong cài đặt trình duyệt rồi thử lại.':
    'Camera access was denied. Enable it in your browser settings and try again.',
  'Máy này không có camera dùng được.': 'No usable camera on this device.',
  'Camera đang được ứng dụng khác dùng. Đóng ứng dụng đó rồi thử lại.':
    'The camera is in use by another app. Close it and try again.',
  'Không mở được camera trên máy này.': 'The camera could not be opened on this device.',
  'Trình duyệt này không mở được camera. Dùng Safari hoặc Chrome bản mới.':
    'This browser cannot open the camera. Use an up-to-date Safari or Chrome.',
  'Danh sách dòng hàng': 'Order lines',
  'Danh sách trống': 'No records',

  // ---------- Chọn kho ----------
  'Chọn kho thao tác': 'Select warehouse',
  'Chọn kho bạn sẽ làm việc. Mỗi kho có màn hình và nghiệp vụ riêng.':
    'Choose the warehouse you will work in. Each warehouse has its own screens and operations.',
  'Kho Bao Bì': 'Packaging Warehouse',
  'Kho Nguyên vật liệu': 'Raw Material Warehouse',
  'Nhận theo tem carton · quản lý bằng Pallet ID · CÁI / THÙNG / PALLET':
    'Receive by carton label · tracked by Pallet ID · PCE / CTN / PALLET',
  'Nhận theo phuy · quản lý bằng Drum ID · KG / DRUM / PALLET':
    'Receive by drum · tracked by Drum ID · KG / DRUM / PALLET',
  'Đang chọn': 'Current',
  'VÀO KHO': 'ENTER',
  'Đổi kho': 'Switch warehouse',
  'Đã vào {0}': 'Entered {0}',
  'Chọn kho trước khi vào màn hình chính': 'Select a warehouse before entering the app',

  // ---------- Điều hướng dưới ----------
  'Công việc': 'Work',
  'Khác': 'Other',
  'Cá nhân': 'Profile',

  // ---------- Danh sách công việc ----------
  'Danh sách công việc': 'Work list',
  'TÌM KIẾM': 'SEARCH',
  'Chờ nhập': 'Pending',
  'Của Tôi': 'Mine',
  'Đã hoàn thành': 'Completed',
  'Nhận hàng': 'Receiving',
  'Cất hàng': 'Putaway',
  'Soạn hàng': 'Picking',
  'NHẬP HÀNG': 'INBOUND',
  'CẤT HÀNG': 'PUTAWAY',
  'ĐƠN HÀNG BÁN': 'SALES ORDER',
  'Mới': 'New',
  'Nhận một phần': 'Partially received',
  'Đã nhận': 'Received',
  'Hoàn thành': 'Completed',
  'Đang cất': 'Putting away',
  'Đang soạn': 'Picking',
  'Chấp nhận': 'Accept',
  'Tiếp tục': 'Continue',
  'Xem lại': 'Review',
  'Nhà cung cấp': 'Supplier',
  'Ngày giao hàng': 'Delivery date',
  'Mã đơn': 'Order code',
  'Số đơn nhập': 'Inbound no.',
  'Loại đơn nhập': 'Inbound type',
  'Ghi chú': 'Note',
  'Mã WMS': 'WMS code',
  'Ngày nhập hàng': 'Receipt date',
  'Loại đơn': 'Order type',
  'Pallet chờ cất': 'Pallets to put away',
  'Tổng pallet': 'Total pallets',
  'Phuy chờ cất': 'Drums to put away',
  'Tổng phuy': 'Total drums',
  'Số đơn hàng': 'SO number',
  'Khách hàng': 'Customer',
  'Mã đơn hàng': 'Order no.',
  'Số dòng hàng': 'Lines',
  'Mặt hàng đầu': 'First item',
  'Đã nhận {0}% khối lượng đơn': 'Received {0}% of order volume',
  '{0} dòng': '{0} lines',
  '{0} pallet': '{0} pallets',
  '{0} phuy': '{0} drums',
  'Bật máy quét — quét mã đơn để lọc nhanh công việc':
    'Scanner on — scan an order code to filter the work list',

  // ---------- Chi tiết nhập hàng ----------
  'Chi tiết nhập hàng': 'Inbound detail',
  'Thẻ nhãn': 'Labelled',
  'Thẻ khác nhãn': 'Unlabelled',
  'Quét mã carton': 'Scan carton code',
  'Quét mã pallet': 'Scan pallet code',
  'Quét mã phuy': 'Scan drum code',
  'Quét tem Pallet ID': 'Scan Pallet ID label',
  'Đơn {0} · {1}': 'Order {0} · {1}',
  '{0}% đã nhận': '{0}% received',
  'SKU - Tên hàng': 'SKU - Item name',
  'Mã hàng': 'Item code',
  'Số lô': 'Lot no.',
  'Số lô nội bộ': 'Internal lot no.',
  'Ngày sản xuất': 'MFG date',
  'Hạn sử dụng': 'EXP date',
  'Số lượng xác nhận ({0})': 'Confirmed qty ({0})',
  'NHẬN HÀNG': 'RECEIVE',
  'Chi tiết đơn nhập': 'Inbound order detail',
  'Số lô {0}': 'Lot {0}',
  'Đơn này không còn carton dán nhãn chờ nhận': 'No labelled carton left on this order',
  'Đơn này không còn phuy chờ nhận': 'No drum left to receive on this order',
  'Tem pallet dán mới': 'New pallet label',
  'Còn phải nhận {0} {1}': '{0} {1} still to receive',
  'Quét mã carton trước': 'Scan the carton code first',
  'Quét mã phuy trước': 'Scan the drum code first',
  'Quét mã pallet và chọn mã hàng': 'Scan the pallet code and pick an item',
  'Quét mã Pallet ID trước khi nhận hàng': 'Scan the Pallet ID before receiving',
  'Nhập số lượng xác nhận': 'Enter the confirmed quantity',
  'Số lô đang trống — nhập hoặc chọn số lô': 'Lot no. is empty — enter or pick a lot',
  'Đã nhận xong toàn bộ đơn — chuyển sang công việc Cất hàng':
    'Order fully received — a putaway job has been created',
  'Đã nhận {0} {1} · còn {2} {1} trên dòng này':
    'Received {0} {1} · {2} {1} left on this line',
  'Đã nhận {0} {1} · quét mã tiếp theo': 'Received {0} {1} · scan the next code',

  // ---------- Lỗi quét barcode ----------
  'Barcode sai định dạng — cần dạng MãHàng|SốLượng|ĐVT|MãKiểmTra':
    'Invalid barcode format — expected ItemCode|Qty|UoM|CheckCode',
  'Mã carton {0} đã được quét — không nhận trùng':
    'Carton code {0} has already been scanned — duplicate not accepted',
  'Mã hàng {0} không thuộc đơn nhập này': 'Item {0} does not belong to this inbound order',
  'Số lượng {0} vượt số còn lại {1} của đơn': 'Quantity {0} exceeds the remaining {1} on the order',
  'Đơn vị {0} trong barcode chưa được khai báo': 'Barcode unit {0} is not mapped',
  'Tem phuy sai định dạng — cần dạng MãHàng|SốLô|SốLượng|MãPhuy':
    'Invalid drum label — expected ItemCode|Lot|Qty|DrumID',
  'Số lô {0} trên tem không khớp số lô {1} của đơn':
    'Lot {0} on the label does not match lot {1} on the order',
  'Mã phuy {0} không có trên đơn nhập này': 'Drum {0} is not registered on this inbound order',
  'Mã phuy {0} đã được quét — không nhận trùng':
    'Drum {0} has already been scanned — duplicate not accepted',
  'Số lượng {0} trên tem không khớp {1} của phuy trên đơn':
    'Quantity {0} on the label does not match {1} registered for this drum',

  // ---------- Cất hàng ----------
  'Không tìm thấy công việc': 'Job not found',
  'Không tìm thấy đơn nhập': 'Inbound order not found',
  'Không tìm thấy phiếu soạn': 'Pick list not found',
  'Công việc này đã cất xong.': 'This job is fully put away.',
  'PalletID': 'PalletID',
  'DrumID': 'DrumID',
  'Vị trí đề xuất': 'Suggested location',
  'Khu vực {0} · chạm vào mã để điền nhanh': 'Zone {0} · tap the code to fill it in',
  'Lấy vị trí khác': 'Get another location',
  'Đến vị trí': 'To location',
  'Quét mã vị trí': 'Scan location code',
  'Khu vực {0}': 'Zone {0}',
  'XÁC NHẬN': 'CONFIRM',
  'Chi tiết công việc cất hàng': 'Putaway job detail',
  'Chờ cất': 'To put away',
  'Quét mã PALLETID trước': 'Scan the PALLETID first',
  'Quét mã DRUMID trước': 'Scan the DRUMID first',
  'Quét mã vị trí ở ô ĐẾN VỊ TRÍ': 'Scan a location code in TO LOCATION',
  'Không tồn tại vị trí "{0}"': 'Location "{0}" does not exist',
  'Đã cất {0} vào {1} — hoàn tất công việc': 'Put {0} into {1} — job completed',
  'Đã cất {0} vào {1} · còn {2} chờ cất': 'Put {0} into {1} · {2} left to put away',

  // ---------- Soạn hàng ----------
  'Chi tiết soạn hàng': 'Picking detail',
  'Phiếu này đã soạn xong.': 'This pick list is complete.',
  'Khu vực': 'Zone',
  'Vị trí': 'Location',
  'Pallet ID': 'Pallet ID',
  'Drum ID': 'Drum ID',
  'Tại vị trí {0}': 'At location {0}',
  'Mã hàng - Tên hàng': 'Item code - name',
  'Số lô NCC': 'Supplier lot',
  'Xác nhận số lượng ({0})': 'Confirm quantity ({0})',
  'Chi tiết phiếu soạn tổng': 'Consolidated pick list',
  'Đã làm mới — hiển thị dòng chờ soạn kế tiếp': 'Refreshed — showing the next line to pick',
  'Quét mã PALLET ID tại vị trí trước khi soạn': 'Scan the PALLET ID at the location before picking',
  'Quét mã DRUM ID tại vị trí trước khi soạn': 'Scan the DRUM ID at the location before picking',
  'Pallet không khớp — cần quét {0}': 'Wrong pallet — {0} is required',
  'Phuy không khớp — cần quét {0}': 'Wrong drum — {0} is required',

  // Quét tem phuy ở màn soạn hàng — lỗi chặn
  'Phuy {0} không tồn tại trong kho': 'Drum {0} does not exist in the warehouse',
  'Phuy {0} thuộc mã hàng {1} — không nằm trong phiếu soạn này':
    'Drum {0} holds item {1} — it is not on this pick list',
  'Phuy {0} đang ở vị trí {1} — không phải vị trí đang soạn':
    'Drum {0} sits at location {1} — not the location being picked',
  'Quét lại tem phuy — mã hiện tại chưa được hệ thống chấp nhận':
    'Scan the drum label again — the current code has not been accepted',
  'Số lượng soạn {0} vượt {1} ghi trên tem phuy {2}':
    'Picked quantity {0} exceeds the {1} printed on drum label {2}',

  // Lô không đáp ứng — popup Có / Không rồi đổi lô
  'Phuy {0}: {1}. Vẫn soạn phuy này?': 'Drum {0}: {1}. Pick this drum anyway?',
  'lô {0} đã hết hạn ngày {1}': 'lot {0} expired on {1}',
  'lô {0} chỉ còn {1} ngày sử dụng (HSD {2})': 'lot {0} has only {1} days left (expiry {2})',
  'lô {0} khác lô đề xuất {1}': 'lot {0} differs from the suggested lot {1}',
  'còn lô {0} hạn dùng sớm hơn ({1}) chưa xuất':
    'lot {0} expires earlier ({1}) and has not been issued yet',
  'Đã đổi sang phuy {0} · phuy {1} trả về tồn':
    'Swapped to drum {0} · drum {1} released back to stock',
  'lô {0}': 'lot {0}',
  'lô đề xuất': 'suggested lot',
  'khác lô': 'other lot',
  'Nhập số lượng đã soạn ở ô XÁC NHẬN SỐ LƯỢNG': 'Enter the picked quantity in CONFIRM QUANTITY',
  'Số lượng soạn {0} vượt số còn lại {1} của dòng':
    'Picked quantity {0} exceeds the remaining {1} on this line',
  'Đã soạn xong phiếu soạn tổng — về Danh sách công việc':
    'Pick list completed — back to the work list',
  'Đã soạn xong dòng này · còn {0} dòng trên phiếu': 'Line completed · {0} lines left on the list',
  'Đã soạn {0} · còn thiếu {1}': 'Picked {0} · {1} short',
  'còn {0}': '{0} left',

  // ---------- Màn Khác / Nhập hàng chủ động ----------
  'Tồn Kho': 'Inventory',
  'Di Chuyển': 'Movement',
  'Nhập hàng': 'Inbound',
  'Hướng dẫn sử dụng': 'User guide',
  'Bảng tính nhập đơn': 'Order spreadsheet',
  'Bản Google Docs': 'Google Docs copy',
  'Chức năng này chưa có trong tài liệu HDSD — sẽ bổ sung sau':
    'This function is not described in the user guide yet',
  'Loại đơn hàng nhập': 'Inbound order type',
  'Postingdate': 'Posting date',
  'Chọn mặt hàng ở ô SKU - Tên hàng': 'Pick an item in SKU - Item name',
  'Quét mã PALLET ID': 'Scan the PALLET ID',
  'Quét mã DRUM ID': 'Scan the DRUM ID',
  'Nhập hoặc chọn số lô': 'Enter or pick a lot no.',
  'Đã nhận {0} {1} · pallet {2} đã chuyển sang công việc Cất hàng':
    'Received {0} {1} · pallet {2} moved to the putaway job',
  'Đã nhận {0} {1} · phuy {2} đã chuyển sang công việc Cất hàng':
    'Received {0} {1} · drum {2} moved to the putaway job',
  'Bạn có muốn in barcode không?': 'Do you want to print the barcode?',
  'Đã gửi lệnh in barcode': 'Barcode print job sent',
  'Bỏ qua in barcode': 'Barcode printing skipped',
  'Hoàn tất đơn': 'Complete order',
  'CÓ': 'YES',
  'KHÔNG': 'NO',
  'Tem pallet': 'Pallet label',
  'Tem phuy': 'Drum label',

  // ---------- Nhập hàng chủ động: 2 trường hợp có / chưa có mã kiện ----------
  'Quét tem phuy': 'Scan the drum label',
  'Quét tem phuy hoặc bấm nút sinh mã DRUM ID': 'Scan a drum label or tap the button to generate a DRUM ID',
  'Quét tem pallet hoặc bấm nút sinh mã PALLET ID': 'Scan a pallet label or tap the button to generate a PALLET ID',
  'Sinh {0} mới': 'Generate a new {0}',
  'Chọn mặt hàng ở ô SKU - Tên hàng trước khi sinh mã': 'Pick an item in SKU - Item name before generating a code',
  'Đã sinh {0} {1}': '{0} {1} generated',
  'Đã đọc tem {0} · {1} · {2} {3} — sửa số lượng nếu tồn thực tế khác':
    'Label {0} read · {1} · {2} {3} — adjust the quantity if the actual stock differs',
  'Mã hàng {0} trên tem không có trong danh mục kho này':
    'Item code {0} on the label is not in this warehouse catalogue',
  '{0} {1} đã có trong hệ thống — kiểm tra lại trước khi nhận':
    '{0} {1} already exists in the system — double-check before receiving',
  'Thông tin lấy từ tem — chỉ sửa số lượng cho khớp tồn thực tế.':
    'Data comes from the label — only the quantity can be adjusted to the actual stock.',
  'Đã có tem thì quét thẳng; chưa có tem thì chọn SKU rồi bấm ⟳ để sinh mã.':
    'Already labelled: scan it. Not labelled yet: pick the SKU then tap ⟳ to generate a code.',
  'Khớp số lượng in trên tem ({0} {1})': 'Matches the quantity printed on the label ({0} {1})',
  'Tem ghi {0} {1} · lệch {2} {3}': 'Label says {0} {1} · difference {2} {3}',

  // ---------- Chiết rót ----------
  'Chiết rót': 'Decanting',
  'Đơn soạn hàng (Mã phiếu soạn WMS)': 'Pick order (WMS pick ticket)',
  'Kho này chưa có phiếu soạn nào': 'This warehouse has no pick ticket yet',
  'Quét mã phiếu soạn WMS trước': 'Scan the WMS pick ticket first',
  'Quét DRUM ID đã soạn': 'Scan the picked DRUM ID',
  'Phuy {0} không có trên phiếu soạn {1}': 'Drum {0} is not on pick ticket {1}',
  'Phiếu này không còn phuy nào soạn vượt': 'No drum on this ticket is over-picked any more',
  'Phuy này không có SL soạn vượt — không cần chiết rót':
    'This drum has no over-picked quantity — no decanting needed',
  'SL trên tem phuy ({0})': 'Quantity on the drum label ({0})',
  'SL đơn cần soạn ({0})': 'Quantity the order needs ({0})',
  'Số lượng cần chiết rót ({0})': 'Quantity to decant ({0})',
  'Nhập số lượng cần chiết rót': 'Enter the quantity to decant',
  'SL chiết rót {0} vượt SL soạn vượt {1} của phuy':
    'Decanting {0} exceeds the drum over-pick of {1}',
  'Kho này chưa khai báo vị trí confirm': 'This warehouse has no confirm location set up',
  'Đã chiết rót {0} {1} · unpick về vị trí {2}': 'Decanted {0} {1} · unpicked to location {2}',
  'XÁC NHẬN CHIẾT RÓT': 'CONFIRM DECANTING',
  'Vị trí confirm': 'Confirm location',
  'cần soạn {0}': 'needs {0}',
  'tem phuy {0}': 'label {0}',
  'vượt {0}': 'over {0}',

  // ---------- Loại đơn nhập ----------
  'Nhập Nhà cung cấp': 'Supplier receipt',
  'Nhập BTP từ Sản xuất': 'Semi-finished from production',
  'Tái nhập từ sản xuất': 'Return from production',
  'Nhập trả hàng bán': 'Sales return',
  'Nhập điều chuyển kho': 'Warehouse transfer',

  // ---------- Cá nhân ----------
  'Thủ kho': 'Warehouse keeper',
  'Nhân viên soạn hàng': 'Picker',
  'Nhân viên nhận hàng': 'Receiver',
  'Dòng tồn kho': 'Inventory lines',
  'Lần nhập chủ động': 'Direct receipts',
  'Tải lại dữ liệu đơn hàng': 'Reload order data',
  'Đã tải lại dữ liệu đơn hàng': 'Order data reloaded',

  // ---------- Nguồn dữ liệu ----------
  'Đang tải dữ liệu đơn hàng…': 'Loading order data…',
  'Đang tải…': 'Loading…',
  'Dữ liệu đơn hàng': 'Order data',
  'Dữ liệu mẫu': 'Sample data',
  'Dữ liệu mẫu trong app': 'Built-in sample data',
  'Google Sheet': 'Google Sheet',
  'Nguồn': 'Source',
  'Cập nhật lúc': 'Updated at',
  'Đơn nhập': 'Inbound orders',
  'Đơn xuất': 'Outbound orders',
  '{0} nhập · {1} xuất': '{0} in · {1} out',
  'Tải lại lấy bản mới nhất từ bảng tính và bỏ thao tác đang làm dở.':
    'Reloading fetches the latest data from the spreadsheet and discards work in progress.',
  'Tải lại': 'Reload',
  'Bỏ qua {0} dòng do lỗi': '{0} rows skipped because of errors',
  'Xem chi tiết': 'View details',
  'Dòng bị bỏ qua': 'Skipped rows',
  'Tab {0} · dòng {1} · cột {2}': 'Tab {0} · row {1} · column {2}',
}

/** Thay {0}, {1}… bằng tham số truyền vào */
function fill(s: string, args: unknown[]): string {
  return args.length ? s.replace(/\{(\d+)\}/g, (m, i) => String(args[Number(i)] ?? m)) : s
}

export function translate(vi: string, lang: Lang, args: unknown[] = []): string {
  return fill(lang === 'vi' ? vi : (EN[vi] ?? vi), args)
}

export type TFn = (vi: string, ...args: unknown[]) => string

/** Hook dịch — dùng trong component: const t = useT(); t('Chọn kho thao tác') */
export function useT(): TFn {
  const lang = useLang((s) => s.lang)
  return (vi, ...args) => translate(vi, lang, args)
}

/** Dịch ngoài React (toast trong hàm sự kiện vẫn gọi được qua useT, hàm này cho store) */
export const tr: TFn = (vi, ...args) => translate(vi, useLang.getState().lang, args)
