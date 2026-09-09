# WMS Vilube — Prototype app handheld (Kho Bao Bì)

> Repo phục vụ mục đích proposal.

Prototype mobile app WMS cho **Kho Bao Bì Vilube**, dựng theo:

- Nghiệp vụ: `HDSD-WMS-kho-bao-bi.docx` (4 phần thao tác trên handheld)
- Dữ liệu: `Masterdata-HangHoa-Vilube.xlsx` (ITEM_MASTER + PACKING_STANDARDS)
- Giao diện / UX: đồng bộ prototype **WMS Hương Thủy** (cùng design system Smartlog WMS)

## Chạy thử

```bash
npm install
npm run dev      # mở http://localhost:5173/m
```

Trên desktop app hiển thị trong **khung máy handheld kho** (bezel dày, nút quét vàng bên hông,
thanh trạng thái giả lập) và luôn nằm chính giữa cửa sổ trình duyệt — khung tự co lại khi
cửa sổ thấp. Mở bằng điện thoại thật thì bỏ khung, app chiếm trọn màn hình.

## Phạm vi — đúng 4 luồng trong HDSD

| Phần HDSD | Màn hình | Route |
|---|---|---|
| 1. Nhận hàng | Danh sách công việc → Chi tiết nhập hàng (Thẻ nhãn / Thẻ khác nhãn) | `/m` → `/m/nhap/:asnId` |
| 2. Cất hàng | Danh sách công việc → Cất hàng | `/m` → `/m/cat/:taskId` |
| 3. Nhập hàng chủ động | Khác → Nhập hàng | `/m/khac` → `/m/nhan-hang` |
| 4. Soạn hàng theo phiếu soạn tổng | Danh sách công việc → Chi tiết soạn hàng | `/m` → `/m/soan/:orderId` |

Thanh điều hướng dưới: **Công việc · Khác · Cá nhân**.
Bộ lọc tính năng (icon bên phải ô tìm kiếm): **Nhận hàng / Cất hàng / Soạn hàng**.

## Luồng dữ liệu (state thật, không phải màn hình tĩnh)

```
Nhận hàng  → sinh pallet chờ cất → Cất hàng → cộng tồn kho
                                                   ↓
Nhập hàng chủ động → sinh pallet chờ cất ─────────┘
                                                   ↓
                                     Soạn hàng → trừ tồn kho
```

- Nhận từng carton / từng pallet, cộng dồn theo dòng hàng, đơn tự chuyển trạng thái
  `Mới → Nhận một phần → Đã nhận`.
- Cất hàng: quét PalletID → hiện **vị trí đề xuất** cỡ lớn, nút `»` lấy vị trí khác,
  quét *Đến vị trí* rồi xác nhận.
- Soạn hàng: đi lần lượt từng dòng của phiếu soạn tổng (Khu vực → Vị trí → quét Pallet ID
  → nhập số lượng), soạn xong dòng nào tự nhảy dòng kế tiếp.
- Màn **Cá nhân** có nút *Khôi phục dữ liệu demo* để chạy lại từ đầu.

## Dữ liệu hàng hoá

`src/data/items.ts` được sinh từ `Masterdata-HangHoa-Vilube.xlsx`: 35 mã hàng thật
(lọc `inTruckingSchedule = Y`), trải đều các nhóm quy cách CARTON / DRUM / PAIL / JCAN,
kèm số lượng/thùng, số kiện/pallet, trọng lượng kiện.

Đơn vị tính hiển thị bám theo nhóm quy cách — đúng như HDSD:

| Nhóm quy cách | Đơn vị tính |
|---|---|
| CARTON (12X1L, 4X4L…) | CÁI · THÙNG · PALLET |
| DRUM (200L, 60L) | KG · DRUM · PALLET |
| PAIL / JCAN (18–20L) | CÁI · PALLET |

Quy đổi giữa các đơn vị dùng đúng quy cách trong masterdata (ví dụ đổi THÙNG ↔ CÁI
theo `unitsPerCarton`, PALLET theo `cartonsPerPallet`).

## Giả định đã bổ sung (ngoài HDSD)

HDSD chỉ mô tả thao tác của nhân viên kho nên vài chỗ cần bổ sung để prototype chạy liền mạch:

1. **Mô phỏng máy quét** — handheld thật thì bắn máy quét. Ở đây chạm icon quét sẽ mở
   danh sách mã hợp lệ để chọn (carton, pallet, vị trí, mã hàng). Ô nhập tay vẫn dùng được.
2. **Số lô nội bộ** tự sinh theo mẫu trong HDSD: `ddMMyy(NSX)-ddMMyy(ngày nhập)`.
3. **Pallet cho Thẻ nhãn** — HDSD chỉ quét carton, không nhập Pallet ID. Prototype tự gom
   carton cùng dòng hàng vào một pallet `PLT-<mã đơn>-<số dòng>` để có cái mà cất.
4. **Nhập hàng chủ động** sau khi nhận sẽ tạo luôn công việc *Cất hàng* (HDSD không nói rõ
   bước kế tiếp).
5. Hai ô **Tồn Kho / Di Chuyển** ở màn *Khác* có trong ảnh HDSD nhưng chưa có mô tả thao tác
   → hiển thị đúng vị trí, bấm vào báo "chưa có trong tài liệu".

## Cấu trúc

```
src/
  data/items.ts        masterdata hàng hoá (sinh từ file Excel)
  data/mock.ts         kho, vị trí, đối tác, đơn nhập, phiếu soạn, tồn
  store.ts             zustand — toàn bộ nghiệp vụ 4 luồng
  lib/uom.ts           quy đổi đơn vị theo quy cách
  components/mobile/   khung điện thoại, app bar, bottom nav, sheet, popup
  components/ui/       Button, InputField, SelectField, ScanField, UomSegment…
  screens/mobile/      WorkList, NhapDetail, CatDetail, SoanDetail, Khac, NhanHang, CaNhan
docs/screenshots/      ảnh chụp các màn đã dựng
```

Ảnh màn hình các bước xem trong `docs/screenshots/`.
