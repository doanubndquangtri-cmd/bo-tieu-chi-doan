# HỒ SƠ LƯU TRỮ: "BẢN CHUẨN PRO"
**Hệ Thống Quản Lý & Tổng Hợp Bộ Tiêu Chí Đoàn Cấp Cơ Sở 2026**
*Thời điểm thiết lập:* 15:45 ngày 08/10/2026
*Trạng thái:* **BẢN CHUẨN CAO CẤP NHẤT (PRO PRODUCTION MILESTONE)**

---

## 1. Định Nghĩa & Ý Nghĩa "Bản Chuẩn Pro"
"**Bản Chuẩn Pro**" là phiên bản hoàn thiện nhất, chuẩn mực nhất về cả giao diện, tính năng, phân quyền và độ chính xác tính toán của hệ thống:
- Mọi khi cần khôi phục lại trạng thái chuẩn hoàn hảo này, người dùng chỉ cần yêu cầu:
> **"Khôi phục về bản chuẩn pro"**

Hệ thống sẽ ngay lập tức khôi phục chuẩn xác 100% giao diện và mã nguồn của Bản Chuẩn Pro.

---

## 2. Nguyên Tắc Bảo Toàn Dữ Liệu Tuyệt Đối
> [!IMPORTANT]
> **DỮ LIỆU ĐĂNG TẢI ĐƯỢC BẢO TOÀN TUYỆT ĐỐI 100%:**
> Khi khôi phục về Bản Chuẩn Pro, hệ thống **CHỈ khôi phục lại mã nguồn và giao diện phần mềm**.
> Toàn bộ dữ liệu trên đám mây (Google Drive, Cloud DB, GitHub Cloud Data):
> - Điểm số của 40 cơ sở Đoàn.
> - Các file minh chứng, tài liệu, văn bản, ảnh, video đã nộp.
> - Lịch sử tin nhắn phòng Chat (Chat Chung và Chat Riêng).
> - Danh sách thông báo hệ thống và nhật ký hoạt động.
> 
> **TUYỆT ĐỐI KHÔNG BỊ MẤT, KHÔNG BỊ HỎNG VÀ KHÔNG BỊ XÓA**!

---

## 3. Các Đặc Điểm Đỉnh Cao Của "Bản Chuẩn Pro"

### 1. Thanh Header Khoa Học & Bố Cục Chuẩn Mực
- **Cặp đôi tương tác ở đầu**: `[ 🔔 Thông báo ]` nằm cạnh `[ 💬 Trao Đổi Đoàn ]`, cả 2 đều có huy hiệu số đếm đỏ khi có tin mới.
- **Cặp đôi đồng bộ dữ liệu**: `[ 🔄 Đồng bộ ]` và `[ 🔄 Tải bản mới ]` (xóa cache triệt để, cập nhật ngay lập tức).
- **Hệ thống & Phân quyền**: `[ 📅 Ngày hiệu lực ]` + `[ Dropdown chuyển đổi góc nhìn cơ sở Đoàn (Admin) ]`.
- **Tiện ích xuất**: `[ 📊 Xuất Excel ]` + `[ ☁️ Lưu Drive (Admin) ]` + `[ 📲 Cài App ]` + `[ Đăng xuất ]`.
- **Góc phải**: Trạng thái `🟢 Online` và đồng hồ thực `⏱️`.

### 2. Khung Bảng Dài Sát Đáy Màn Hình (Chuẩn Mẫu Số 3)
Tất cả các bảng trong hệ thống đều co giãn tự động theo chiều cao màn hình (`flex: 1 1 auto; height: calc(100vh - 128px) !important`), xóa sạch khoảng trống thừa bên dưới:
- **Bảng Tổng Hợp Chấm Điểm** (`#master-spreadsheet-wrapper`)
- **Bảng 1: Theo Dõi Nộp Báo Cáo & Hoạt Động** (`#reports-spreadsheet-wrapper`)
- **Bảng 2: Nhật Ký Nộp Báo Cáo & Minh Chứng** (`.reports-log-container`)
- **Hệ Thống Văn Bản** (`.admin-docs-panel`)
- **Lịch Sử Đã Nộp Của Đơn Vị** (`.unit-history-panel`)

### 3. Chuẩn Xác 100% Điểm Hàng Ngang & Mẫu Số 325 Điểm
- Bóc tách chuẩn xác số điểm từng cột mà Admin cài đặt trong nội dung:
  - 17 cột 5 điểm = 85 điểm
  - 22 cột 10 điểm = 220 điểm
  - 1 cột 20 điểm = 20 điểm
  - **Tổng điểm tối đa chuẩn: 325 điểm**
- Điểm hàng ngang của mỗi đơn vị cộng dồn đúng 100% các cột đạt điểm.
- Thanh tiến độ tích lũy `%` = `(Điểm đạt / 325) * 100%`.
- Cập nhật tức thì khi có điểm hoặc sửa điểm trực tiếp.

### 4. Đồng Nhất 3 Trạng Thái & Xóa Bỏ Nộp Trễ Hạn
- Xóa bỏ hoàn toàn nhãn `Nộp trễ hạn` và trạng thái trễ hạn.
- Đồng nhất 3 trạng thái duy nhất:
  - `✅ Đã duyệt` (Xanh lá)
  - `⏳ Chờ Admin duyệt` (Vàng cam)
  - `❌ Chưa nộp` (Đỏ / dấu `—`)

### 5. Phân Quyền Hoàn Chỉnh
- **Admin**: Nhập/sửa điểm trực tiếp, nút `⚡Chấm` nhanh, duyệt/từ chối báo cáo, công cụ độc quyền `[ 🤖 AI Soát Lỗi Minh Chứng ]`.
- **Đoàn cơ sở**: Chế độ Chỉ Xem (Read-only), không chỉnh sửa điểm hay tiêu chí, ẩn nút AI Soát Lỗi Minh Chứng.

### 6. Khung Chat Trao Đổi Đoàn & Studio Tiện Ích
- Di chuyển kéo thả (Draggable), đổi kích cỡ (Resizable), phóng to toàn màn hình (Maximize ⛶).
- Tab **Tạo Mã QR** (có logo Đoàn ở giữa, tải PNG về máy, chia sẻ QR).
- Tab **Giọng Nói AI** (AI Text-to-Speech Studio).

---

## 4. Phương Thức Khôi Phục Nhanh
- Lệnh chạy:
  ```powershell
  python restore_ban_chuan_pro.py
  ```
- Hoặc chỉ cần nhắn cho AI:
  > *"Khôi phục về bản chuẩn pro"*
