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
  - **Tối ưu giao diện Nộp Điểm Danh cho Cơ Sở Đoàn (Khớp chuẩn phân loại tiêu chí)**:
    1. Đổi tiêu đề modal và nút xác nhận thành dạng: `🙋 Nộp Điểm Danh / Kê Khai Số Lượng (${crit.col_label})` và `🙋 Xác Nhận Nộp Điểm Danh Online` (đối với tiêu chí Điểm danh `is_report === 3`), thay vì chữ "báo cáo".
    2. Đổi ô link Facebook thành ô **Nhập số lượng đoàn viên tham gia thực tế** (`id="sub-attendance-pres"`, ví dụ: 2, 5, 6...) có đối soát công thức `= (Đến / Phân bổ) * max_score`.
    3. Chuyển đổi khung đính kèm tệp thành chuyên biệt **"📷 Đính kèm hình ảnh minh chứng"** (`accept="image/*"`): đoàn viên chọn và gửi các hình ảnh chụp hoạt động / ảnh tập thể có mặt để chứng minh số lượng người tham gia thực tế cho Admin đối chiếu duyệt điểm.
    4. Đồng bộ nhãn nút theo vai trò: Với đoàn cơ sở luôn hiển thị `[🙋 Nộp Điểm Danh]`, chỉ với Admin mới hiển thị `[✏️ Sửa điểm danh]`.
    5. Cập nhật modal Chi tiết báo cáo (`openSubmissionDetailModal`) hiển thị số lượng kê khai và album ảnh minh chứng trực quan khi xem tiêu chí Điểm danh.
    6. Chuẩn hóa ô điểm trên Bảng Tổng Hợp Chấm Điểm (`renderMasterScoreCell`): Loại bỏ khối render dị biệt ở tiêu chí điểm danh, đồng bộ hiển thị các ô điểm Cột 5 chuẩn đẹp 100% như các cột trước (Cột 1, 2, 3, 4, 6), căn chuẩn kích thước input, hiển thị điểm số chính xác.
    7. Chuẩn hóa hiển thị biểu tượng liên kết trên Bảng Tổng Hợp Chấm Điểm (`renderMasterScoreCell`):
       - **Chỉ hiển thị biểu tượng khi ô CÓ ĐIỂM** (khác trống và khác 0) hoặc có bài nộp chờ duyệt. Các ô không có điểm (ô trống, điểm 0) hoàn toàn không gắn bất kỳ biểu tượng nào.
       - **Tiêu chí Điểm Danh thực sự (`is_report === 3`)**: Ô có điểm mới hiển thị biểu tượng `🙋`, bấm vào mở bảng đối soát điểm danh 40 đơn vị.
       - **Khôi phục nguyên vẹn biểu tượng tệp (`📎` hoặc `+📎`) cho tất cả tiêu chí nộp tệp/báo cáo thông thường**: Gỡ bỏ kiểm tra chuỗi `title.includes('điểm danh')`, đảm bảo các tiêu chí phong trào/hoạt động nộp tệp minh chứng thông thường (như Cột 4 "Điểm danh tham gia Ngày Chủ nhật xanh...") không bị nhận diện nhầm thành bảng điểm danh, khôi phục lại 100% biểu tượng tệp `📎` và chức năng xem tệp đã nộp của các cơ sở Đoàn.
       - **Áp dụng đồng bộ cho cả Quản trị viên và Đoàn cơ sở**: Đoàn cơ sở cũng thấy `🙋` ở ô có điểm của tiêu chí điểm danh và thấy `📎` ở ô có điểm của tiêu chí thường để bấm vào xem liên kết chi tiết.
    8. Mở quyền xem Bảng Điểm Danh 40 đơn vị cho tất cả Cơ sở Đoàn: Cho phép toàn bộ các đơn vị cơ sở Đoàn mở xem giao diện bảng đối soát điểm danh chuẩn theo mẫu Ảnh (`STT | Mã ĐV | Tên Tổ Chức Cơ Sở Đoàn | Phân bổ | Số lượng Đến | Tỷ lệ tham gia | Điểm đạt được`), xem số liệu tổng quan của tất cả 40 đơn vị, tự động làm nổi bật (highlight) dòng đơn vị của mình và cuộn đến vị trí tương ứng. Chế độ xem của cơ sở Đoàn là trực quan, read-only an toàn và không có nút chỉnh sửa của Admin.
    9. Loại bỏ hoàn toàn lớp mờ/tối mờ xung quanh mục Thông báo: Cập nhật CSS `.notification-backdrop` và inline style sang `background: transparent !important; backdrop-filter: none !important;`, giữ cho giao diện nền luôn sắc nét, trong suốt và thanh lịch khi mở chuông Thông Báo Hệ Thống.
    10. Loại bỏ hoàn toàn lớp bóng đen mờ / tối mờ xung quanh khi mở xem Tệp Đính Kèm và các Modal:
        - Cập nhật `.modal-backdrop` trong `styles.css` và inline style của `openCriterionAttachmentsModal`, modal xem trước tệp sang `background: transparent !important; backdrop-filter: none !important; -webkit-backdrop-filter: none !important;`.
        - Gắn trực tiếp container của modal tệp đính kèm vào `document.body` để không bị cắt xén hoặc lệch khung nhìn.
        - Thêm viền nổi và đổ bóng thanh lịch cho `.modal-box`, giữ cho toàn bộ màn hình phía sau hoàn toàn sắc nét, sáng rõ 100%, xóa bỏ dứt điểm hiện tượng bóng đen mờ xung quanh.
    11. Khắc phục dứt điểm nhận diện tệp minh chứng và đồng bộ hiển thị biểu tượng `📎` (xanh lá):
        - **Bảo toàn 100% dữ liệu:** Toàn bộ 59 hồ sơ/minh chứng của các cơ sở đoàn trên `data-v2` (`cloud_db.json`) và các tệp đính kèm của Ban Thường vụ trên các tiêu chí (161, 166, 167...) đều nguyên vẹn hoàn toàn.
        - **Sửa nguyên nhân cốt lõi hiển thị `+📎` và báo "Chưa có tệp":**
          - Mở rộng kiểm tra `hasAttachment` trong `renderMasterScoreCell` và `onAdminInlineScoreChange`: Tính toán cả tệp do đơn vị nộp (`sc.files`, `sc.file_path`, `sc.evidence_link`) và tệp do Ban Thường vụ đính kèm ở tiêu chí (`crit.attachments`).
          - Khi tiêu chí đã có tệp đính kèm từ Ban Thường vụ (như Cột 1, Cột 2, Cột 3 với 2 tệp PDF & Excel phát động lan tỏa), ô điểm luôn hiển thị biểu tượng **`📎`** (ontime - màu xanh lá cây chuẩn), tuyệt đối không hiển thị `+📎` (nét đứt cam).
          - Trong modal chi tiết bài nộp/minh chứng (`openSubmissionDetailModal`): Nếu đơn vị chưa có tệp riêng nhưng tiêu chí đã có `crit.attachments`, hiển thị thông báo trạng thái `✅ Đã có tệp minh chứng chuẩn từ Ban Thường vụ (Đính kèm theo tiêu chí)` kèm danh sách tệp đầy đủ nút `[👁️ Xem file]` và `[📥 Tải về]`, giải thích rõ ràng không bắt đơn vị nộp lại. Với Admin hiển thị nhãn thân thiện bổ sung tệp nếu cần thay vì thông báo lỗi hoặc bắt nộp lại.
