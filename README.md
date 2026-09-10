# WMS Vilube — Prototype app handheld

> Repo phục vụ mục đích proposal.

Prototype mobile app WMS cho **Kho Bao Bì** và **Kho Nguyên vật liệu** Vilube, dựng theo
`HDSD-WMS-VILUBE.docx`. Giao diện đồng bộ prototype WMS Hương Thủy (cùng design system
Smartlog WMS).

## Link demo

https://vilube-prototype.phat-vu.workers.dev

## Chạy thử

```bash
npm install
npm run dev      # Vite ở http://localhost:5173
npm run dev:api  # Worker ở http://localhost:8787 (cửa sổ terminal thứ hai)
```

Vite proxy `/api` sang Worker nên chạy đủ hai lệnh mới có dữ liệu đơn hàng thật; thiếu Worker
thì app tự rơi về bộ dữ liệu mẫu. Muốn thử đúng như production thì `npm run build` rồi
`npx wrangler dev` — Worker phục vụ cả file tĩnh lẫn API trên cổng 8787.

```bash
npm test         # vitest — kiểm bộ đọc Google Sheet
```

Trên desktop app hiển thị trong khung máy handheld kho và nằm chính giữa cửa sổ; mở bằng điện
thoại thật thì bỏ khung, app chiếm trọn màn hình.

## Hai kho, hai giao diện

Mở app là vào màn hình **Chọn kho thao tác** (`/kho`) trước, cũng là nơi đổi ngôn ngữ Việt/Anh
và xem trạng thái dữ liệu. Chưa chọn kho thì không vào được màn hình chính.

| Hạng mục | Kho Bao Bì | Kho Nguyên vật liệu |
|---|---|---|
| Mã quản lý tồn | Pallet ID | Drum ID |
| Đơn vị tính | CÁI · THÙNG · PALLET | KG · DRUM · PALLET |
| Nhận hàng | 2 thẻ NHÃN / KHÁC NHÃN | 1 luồng quét DRUMID |
| Cất hàng | quét PALLETID → vị trí | quét MÃ HÀNG → DRUMID → vị trí |
| Soạn hàng | quét Pallet ID | quét Drum ID |
| Khu vực | 1001–1003 (A · B · C) | 2001–2002 (D · E) |

## Bốn luồng trong HDSD

| Phần HDSD | Màn hình | Route |
|---|---|---|
| 1. Nhận hàng | Danh sách công việc → Chi tiết nhập hàng | `/m` → `/m/nhap/:asnId` |
| 2. Cất hàng | Danh sách công việc → Cất hàng | `/m` → `/m/cat/:taskId` |
| 3. Nhập hàng chủ động | Khác → Nhập hàng | `/m/khac` → `/m/nhan-hang` |
| 4. Soạn hàng | Danh sách công việc → Chi tiết soạn hàng | `/m` → `/m/soan/:orderId` |

```
Nhận hàng  → sinh pallet/phuy chờ cất → Cất hàng → cộng tồn kho
                                                        ↓
Nhập hàng chủ động → sinh pallet chờ cất ─────────────┘
                                                        ↓
                                          Soạn hàng → trừ tồn kho
```

## Nguồn dữ liệu đơn hàng

Đơn nhập và đơn xuất **không nhập trên app** — chúng được soạn trên một Google Sheet dùng
chung, giống hệ thống thật nơi đơn được tạo trên web trước rồi mới tới bước thao tác handheld.

```
Google Sheet (DON_NHAP, DON_XUAT)
        ↓  gviz CSV
Worker  /api/donhang          ← đọc hộ ở phía server: tránh CORS, tránh cache
        ↓  JSON               của link publish-to-web, và không lộ id Sheet
App     màn hình Chọn kho
```

Cấu hình: đặt `SHEET_ID` trong `vars` của `wrangler.jsonc`, Sheet chia sẻ ở mức *ai có link
đều xem được*. Để trống thì Worker trả bộ dữ liệu mẫu trong `shared/sample.ts` — app vẫn chạy
đầy đủ, tiện khi phát triển hoặc mất mạng giữa buổi demo.

File template cho team nhập liệu: `Template-DonHang-WMS-Vilube.xlsx` (sinh bằng
`scripts/make-template.py`, nội dung lấy thẳng từ `shared/sample.ts` nên không lệch với code).

**Dòng nào sai thì bị bỏ qua, phần còn lại vẫn tải** và app báo rõ tab / dòng / cột sai ở màn
hình Chọn kho. Chọn vậy để giữa buổi demo một ô gõ nhầm không làm chết cả app.

## Masterdata

`shared/items.ts` là **dữ liệu demo**: 16 mã bao bì và 13 mã dầu gốc / phụ gia, quy cách đóng
gói và quy đổi đơn vị nhất quán. Chỉ mã `9082228` lấy từ tem carton thật in trong HDSD; phần
còn lại dựng theo quy cách phổ biến của ngành, chờ danh mục thật của khách.

Danh mục dầu nhờn thành phẩm trong `Masterdata-HangHoa-Vilube.xlsx` không dùng ở đây: hai kho
này quản lý bao bì và nguyên vật liệu, không quản lý thành phẩm.

## Barcode tem carton (kho Bao Bì)

```
9082228 | 3000 | PCE | 0008083
mã hàng   SL     ĐVT   mã kiểm tra trùng
```

Thứ tự kiểm tra khi quét: sai định dạng → trùng mã kiểm tra → mã hàng không thuộc đơn → đơn vị
chưa khai báo → vượt số còn lại. Việc kiểm tra chạy khi **bắn xong mã** (Enter, rời ô, hoặc
chọn trong danh sách mô phỏng) chứ không theo từng ký tự gõ tay — giống máy quét thật nạp trọn
chuỗi rồi mới gửi Enter.

## Barcode tem phuy (kho NVL)

```
MTL001 / 2609101 / 200 / DR0000001
mã hàng   số lô    SL kg  mã phuy
```

Khác tem carton ở chỗ số lô nằm ngay trên tem: phuy nguyên liệu bắt buộc truy xuất theo lô.
App cắt chuỗi rồi đối chiếu từng phần với đơn nhập, sai phần nào báo đúng phần đó — mã hàng
không thuộc đơn → số lô lệch với đơn → mã phuy không có trên đơn → phuy đã quét rồi → số lượng
lệch với phuy đã đăng ký → vượt số còn lại.

Tem của mỗi phuy được dựng từ chính dòng đơn nhập trong Sheet (`MA_HANG`, `SO_LO`,
`SL_MOI_KIEN`, `MA_KIEN_DAU` tăng dần), nên Sheet không cần thêm cột nào. Vì dấu `/` là ký tự
ngăn cách, mã phuy trong `MA_KIEN_DAU` không được chứa dấu này, và dòng NVL có phuy dán tem
bắt buộc phải có `SO_LO`.

## Cấu trúc

```
shared/          dùng chung app + Worker, chỉ import tương đối
  types.ts       kiểu miền
  items.ts       masterdata hàng hoá (demo)
  catalog.ts     kho, vị trí, loại đơn
  uom.ts         quy đổi đơn vị theo quy cách
  barcode.ts     đọc / dựng barcode tem carton (BB) và tem phuy (NVL)
  sheet.ts       parse CSV → đơn nhập, đơn xuất, tồn, công việc cất hàng
  sheet.test.ts  vitest cho toàn bộ shared/sheet.ts
  sample.ts      CSV mẫu — vừa là bản dự phòng, vừa là nội dung template
worker/index.ts  đọc Google Sheet, phục vụ /api/donhang
src/
  store.ts       zustand — nghiệp vụ 4 luồng + tải dữ liệu
  i18n.ts        từ điển Việt → Anh
  components/    khung máy, app bar, bottom nav, sheet, popup, field
  screens/mobile ChonKho, WorkList, NhapDetail, CatDetail, SoanDetail, Khac, NhanHang, CaNhan
scripts/         sinh file template .xlsx
```

## Giả định đã bổ sung (ngoài HDSD)

1. **Mô phỏng máy quét** — chạm icon quét mở danh sách mã hợp lệ để chọn. Ô nhập tay vẫn dùng
   được, và gõ tay rồi Enter cũng chạy đúng luồng kiểm tra.
2. **Số lô nội bộ** tự sinh theo mẫu trong HDSD: `ddMMyy(NSX)-ddMMyy(ngày nhập)`.
3. **Pallet cho Thẻ nhãn** — HDSD chỉ quét carton, không nhập Pallet ID; prototype gom carton
   cùng dòng hàng vào một pallet `PLT-<mã đơn>-<số dòng>` để có cái mà cất.
4. **Nhập hàng chủ động** sau khi nhận sẽ tạo luôn công việc Cất hàng.
5. **Cột `DA_NHAN`** trong Sheet cho phép dựng sẵn hàng đã nhận, để demo Cất hàng mà không phải
   bấm nhận hàng trước.
6. Hai ô **Tồn Kho / Di Chuyển** ở màn Khác có trong ảnh HDSD nhưng chưa có mô tả thao tác →
   hiển thị đúng vị trí, bấm vào báo "chưa có trong tài liệu".

Danh sách đầy đủ những điểm cần khách chốt nằm ở Phần 5.6 và Phần 6 của `HDSD-WMS-VILUBE.docx`.

## Deploy

```bash
npx wrangler login   # lần đầu
npm run deploy       # wrangler tự chạy Vite build rồi deploy
```

Đẩy code lên nhánh `main` của `phatvu-hash/Vilube_prototype` thì Cloudflare Workers Builds tự
build và deploy. Lệnh build nằm trong `wrangler.jsonc` (`build.command`) chứ không đặt ở
dashboard, nên CI chạy được với ô *Build command* để `None`.

`assets.not_found_handling = "single-page-application"` để link sâu (vd `/m/nhap/asn-1`) và F5
không bị 404; `assets.run_worker_first = ["/api/*"]` để riêng `/api/*` đi vào Worker.
