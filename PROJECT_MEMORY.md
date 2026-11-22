# PROJECT MEMORY - BỘ TIÊU CHÍ CÁC TỔ CHỨC CƠ SỞ ĐOÀN TRỰC THUỘC (2026)

## 1. Thông Tin Tổng Quan & Kiến Trúc Dự Án
- **Tên dự án:** Hệ thống Quản lý & Tổng hợp Bộ Tiêu chí Thi đua Cơ sở Đoàn - Tỉnh Đoàn Quảng Trị / Đoàn UBND Tỉnh.
- **Repository:** `https://github.com/doanubndquangtri-cmd/bo-tieu-chi-doan.git`
- **Nhánh chính (Production):** `main`
- **Nhánh dữ liệu đám mây (Cloud DB):** `data-v2` (`cloud_db.json`)
- **Công nghệ sử dụng:** HTML5, CSS3 hiện đại, Vanilla JavaScript SPA, Web Push Notifications, GitHub API Git Trees & Blobs (hỗ trợ database >1MB, bypass CDN cache với ETag 304).
- **Cấu trúc thư mục:**
  - `index.html`: Entrypoint production (chứa bản bundle hoặc link file).
  - `app.js`: Toàn bộ logic frontend SPA.
  - `styles.css`: CSS styling toàn bộ ứng dụng.
  - `static/`: Chứa file tĩnh dự phòng `app.js`, `styles.css`, `index.html`.
  - `BoTieuChiDoan2026_Online.html`, `BoTieuChiDoan_Online.html`: Các phiên bản standalone online tích hợp sẵn.
  - `scratch/bundle_all.js`: Script đồng bộ và bundle tự động các file HTML và bump timestamp `CURRENT_BUILD_TS`.

## 2. Vùng Bất Khả Xâm Phạm (Đã Hoàn Thành & Đang Hoạt Động Ổn Định)
- Bảng xếp hạng và Bảng tổng hợp chấm điểm 40 cơ sở đoàn.
- Nộp báo cáo online, chấm điểm, duyệt điểm, gửi minh chứng đính kèm.
- Nhật ký minh chứng, Hệ thống văn bản chỉ đạo.
- Bản Tin & Thư Viện Ảnh:
  - Đăng bài 0ms, không giới hạn ảnh, video background, bố cục ảnh dạng Facebook collage.
  - Tách riêng 3 luồng đăng bài: 🎬 Video, 🖼️ Ảnh hoạt động, 😊 Cảm xúc/Hoạt động.
  - Bộ phản ứng cảm xúc đa dạng (❤️, 👍, 🥰, 😆, 😮, 😢, 😡, 👏).
  - Hỗ trợ gõ tắt biểu cảm (ví dụ `:)` -> `😊`, `<3` -> `❤️`), bảng chọn biểu tượng cảm xúc.
  - Đồng bộ tự động thời gian thực (no-F5) khi có tương tác mới (tim, bình luận, bài mới).
  - Web Push Notification thông báo về điện thoại/máy tính khi có bài đăng mới.
- Cụm 4 nút Header trọng tâm: `[🔄 Đồng bộ]` - `[🔔 Thông báo]` - `[💛 Bảng Vàng Ủng Hộ]` - `[💬 Trao Đổi Đoàn]`.
- Bảng vàng tri ân ủng hộ (VietQR, sao kê, trạng thái duyệt).
- Khung Trao đổi Đoàn (chat nổi) với chế độ Toàn khối & Riêng tư, AI trợ lý.

## 3. Nhật Ký Lệnh & Quyết Định Nâng Cấp Gần Nhất
- **20/11/2026**:
  - Khắc phục 2 lỗi ở khung Thông báo chuông (`🔔 Thông báo`):
    1. Lỗi thanh chữ chạy ngang (`marquee-ticker-bar`) cắt xuyên qua bảng thông báo: Chuyển `.notification-dropdown` ra root level của `#app`, loại bỏ `backdrop-filter` trên `.header-featured-hub`, đặt `z-index: 99999999` trên root stacking context.
    2. Lỗi bảng thông báo bị lệch thụt vào trong màn hình: Căn chỉnh vị trí cố định `top: 56px; right: 14px; left: auto; width: 620px;`, sát mép phải màn hình ngay ngắn, chuẩn xác cả trên Desktop lẫn Mobile.
  - Sửa lỗi màn hình trắng tinh khi tải trang: Khai báo biến `isGuest` trong phạm vi hàm `renderApp()`, loại bỏ hoàn toàn `ReferenceError: isGuest is not defined`.
  - Khắc phục lỗi thanh chat Trao đổi Đoàn và chữ chạy thông báo:
    1. Đưa `z-index: 99999995 !important;` cho `.chat-widget-box`, đảm bảo kéo khung chat lên đỉnh màn hình luôn nằm phía trước thanh header xanh, không bao giờ bị che/ẩn sau header.
    2. Gỡ bỏ trạng thái dừng chạy `:hover` trên `.marquee-ticker-bar`, đảm bảo dòng chữ thông báo luôn cuộn liên tục mượt mà, không bị khựng lại hay chặn đứng khi người dùng kéo rê khung chat qua lại.
- **22/11/2026**:
  - Chuyển đổi phân loại tiêu chí "Nội dung trống" thành phân loại chuẩn: **"🙋 Điểm danh (Nhập file Excel / Số lượng tham gia - Tự tính điểm)"** (`is_report === 3`).
  - Xây dựng tính năng Tiêu chí Điểm Danh tự động tính điểm theo công thức: `= (Đến / Phân bổ) * Điểm tối đa` (chuẩn theo mẫu Ảnh 2: ví dụ `= F4 / E4 * 5`, xử lý biên an toàn tránh lỗi `#DIV/0!`, điểm tối đa không vượt quá `max_score`).
  - Tích hợp tính năng Nhập file Excel Điểm Danh & Đối soát 40 đơn vị:
    - Nút `[🙋 Điểm danh Excel]` ngay tại tiêu đề cột trên Bảng Tổng Hợp Chấm Điểm và bảng Quản Lý Tiêu Chí.
    - Modal Điểm Danh 40 đơn vị tương tác trực tiếp: xem và chỉnh sửa số lượng phân bổ, số người đến theo thời gian thực (tự động tính lại điểm và cập nhật thanh % tiến độ tham gia tức thì), tìm kiếm nhanh cơ sở Đoàn, công cụ `[⚡ Điền nhanh phân bổ]`.
    - Tải tệp Excel mẫu chuẩn 40 đơn vị có sẵn công thức tính điểm (`downloadAttendanceExcelTemplate`).
    - Đọc và bóc tách tệp Excel điểm danh tải lên (`parseAttendanceExcelFile`), tự động khớp tên 40 cơ sở Đoàn bằng `matchUnitByName`.
    - Tùy chọn nhập file Excel điểm danh ngay khi tạo tiêu chí mới trong modal Thêm Tiêu Chí.
    - Lưu điểm số và chi tiết số lượng vào `cloud_db.json`, tự động tính vào tổng điểm của đơn vị trên Bảng Tổng Hợp Chấm Điểm và Bảng Xếp Hạng đầy đủ như một mục tiêu chí chuẩn của hệ thống.
  - **Tối ưu tốc độ mở trang cực hạn (Instant Load 0ms / Mở là vào liền)**:
    1. Giảm 75% dung lượng tải ban đầu: Tách các thư viện nặng (XLSX 3MB, PDF.js 1MB, JSZip, Mammoth) ra khỏi `<head>`, chuyển sang nạp ngầm (background lazy-load) sau khi giao diện đã hiển thị hoặc khi người dùng thao tác.
    2. Thêm `<link rel="preload">` tải song song `app.js` và `styles.css` ở mức ưu tiên cao nhất của trình duyệt.
    3. Thêm Màn hình Khởi động tức thì (Instant App Shell Skeleton) ngay trong `#app` bằng CSS thuần, hiển thị giao diện thanh Header và hiệu ứng nạp thương hiệu chỉ sau 0.05 giây, xóa bỏ hoàn toàn hiện tượng màn hình trắng chờ đợi.
    4. Kích hoạt vòng đời `startAppLifecycle()` ngay lập tức (0ms) mà không phải chờ đợi sự kiện `DOMContentLoaded` bị chặn bởi các file script bên ngoài.
    5. Gỡ bỏ lệnh `window.location.reload()` gây tải đúp 2 lần không cần thiết trong hàm tự cập nhật PWA, cho phép mở và F5 mượt mà, phản hồi ngay lập tức.
