# HỒ SƠ LƯU TRỮ: "BẢN CHUẨN 1"
**Hệ Thống Quản Lý & Tổng Hợp Bộ Tiêu Chí Đoàn Cấp Cơ Sở 2026**
*Thời điểm thiết lập:* 19:40 ngày 07/10/2026

---

## 1. Định Nghĩa & Ý Nghĩa
"**Bản Chuẩn 1**" là phiên bản mốc tiêu chuẩn cao nhất của hệ thống được Ban Thường vụ / Quản trị viên duyệt và chốt làm tiêu chuẩn tham chiếu tuyệt đối.
Bất kỳ khi nào trong tương lai xảy ra lỗi, sai lệch bố cục hoặc nâng cấp không ưng ý, người dùng chỉ cần yêu cầu:
> **"Khôi phục về bản chuẩn 1"**

Hệ thống sẽ ngay lập tức kích hoạt quy trình phục hồi chính xác 100% giao diện và mã nguồn của Bản Chuẩn 1.

---

## 2. Nguyên Tắc Bất Di Bất Dịch Về Dữ Liệu
> [!IMPORTANT]
> **DỮ LIỆU ĐĂNG TẢI ĐƯỢC BẢO TOÀN TUYỆT ĐỐI 100%:**
> Khi khôi phục về Bản Chuẩn 1, hệ thống **CHỈ khôi phục lại mã nguồn và giao diện phần mềm**.
> Toàn bộ nội dung dữ liệu trên đám mây (Google Sheets, Google Drive, Cloud DB):
> - Điểm số tự chấm, điểm Admin duyệt của 40 cơ sở Đoàn.
> - Các file minh chứng, tài liệu, văn bản, ảnh, video đã nộp.
> - Toàn bộ lịch sử tin nhắn phòng Chat (Chat Chung và Chat Riêng).
> - Danh sách thông báo hệ thống và nhật ký hoạt động.
> 
> **TUYỆT ĐỐI KHÔNG BỊ MẤT, KHÔNG BỊ HỎNG VÀ KHÔNG BỊ XÓA** khi chuyển đổi hoặc khôi phục về Bản Chuẩn 1!

---

## 3. Các Đặc Điểm Chuẩn Của "Bản Chuẩn 1"
1. **Thanh Header Cố Định & Tinh Gọn**:
   - Logo Đoàn và tiêu đề Tỉnh Đoàn Quảng Trị.
   - Nút `🔔 Thông báo` độc lập, rõ ràng, dropdown thông báo mượt mà.
   - Các nút công cụ: `🔄 Đồng bộ`, `📅 Ngày hệ thống`, `Quản trị viên`, `📊 Xuất Excel`, `☁️ Lưu Drive`, `📲 Cài App`, `💬 Trao Đổi Đoàn`, `Đăng xuất` nằm trực tiếp trên nền thanh Header, không bị bọc khung xanh mờ, không bị thanh cuộn phụ hay bó trong bất kỳ "khuôn" nào khi phóng to/thu nhỏ.
   - Trạng thái `🟢 Online` và đồng hồ thực `⏱️` ở góc phải.
2. **Khung Chat Trao Đổi Đoàn Thông Minh**:
   - **Kéo thả di chuyển (Draggable)**: Bấm giữ thanh tiêu đề để di chuyển đến bất kỳ vị trí nào trên màn hình.
   - **Kéo dãn đa chiều (Resizable)**: Kéo dãn to, rộng tùy ý từ các cạnh và góc dưới phải (⤡).
   - **Kích thước nhỏ nhất chuẩn nguyên mẫu**: Bị chặn ở mức nhỏ nhất **440px x 590px** (không bị thu nhỏ quá mức).
   - **Phóng to toàn màn hình (Maximize ⛶ / Restore ❐)**: Bấm nút trên góc hoặc nhấp đúp tiêu đề để mở rộng 100% toàn màn hình, bấm lần nữa để thu về kích thước ban đầu.
   - **Bố cục cố định đẹp mắt**: Khi kéo to toàn màn hình, **phần nội dung tin nhắn tự động mở rộng theo**, còn thanh tìm kiếm và thanh gõ phím ở dưới vẫn giữ nguyên vị trí cố định chắc chắn.
3. **Bảng Tổng Hợp & Chấm Điểm Chuẩn**:
   - 34 tiêu chí hiển thị đầy đủ, thanh cuộn bảng mượt mà.
   - Thanh phân chia kéo dãn (Split Resizer) giữa bảng nộp báo cáo và nhật ký.
   - Giao diện chuẩn tỷ lệ không bị thanh cuộn thừa bên mép phải màn hình.

---

## 4. Phương Thức Khôi Phục Nhanh
- Lệnh trực tiếp:
  ```powershell
  python restore_ban_chuan_1.py
  ```
- Hoặc người dùng chỉ cần nhắn:
  > *"Khôi phục về bản chuẩn 1"*
  Antigravity AI sẽ tự động chạy quy trình khôi phục và đồng bộ lên GitHub `main`.
