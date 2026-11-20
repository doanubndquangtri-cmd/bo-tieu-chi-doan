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
