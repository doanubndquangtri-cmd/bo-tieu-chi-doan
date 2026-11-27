/**
 * ============================================================================
 * TỰ ĐỘNG THẨM ĐỊNH LINK FACEBOOK & ĐIỀN KẾT QUẢ TRÊN GOOGLE SHEETS
 * Kết nối trực tiếp tới máy chủ: https://kini-ai.onrender.com/api/fb-check
 * ============================================================================
 * Cột D (4): NHẬP LINK
 * Cột E (5): Tên trang cá nhân / Chủ tài khoản
 * Cột F (6): Trạng thái hiển thị (Công khai / Riêng tư / Link lỗi)
 * Cột G (7): Kết quả (✅ Hợp lệ / ❌ Không hợp lệ + Lý do)
 */

const FB_API_ENDPOINT = "https://kini-ai.onrender.com/api/fb-check";

// Từ khóa bắt buộc (phân tách bằng dấu phẩy). Để rỗng "" nếu chỉ kiểm tra Công khai & lấy Tên chủ tài khoản.
const REQUIRED_KEYWORDS = []; // Ví dụ: ["Bình dân học vụ số", "Đoàn UBND", "tập huấn"]
const KEYWORD_MODE = "any";   // "any" = khớp ít nhất 1 từ khóa, "all" = khớp tất cả
const REQUIRE_PUBLIC = true;

/**
 * Tạo menu tiện ích trên thanh công cụ Google Sheets
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("🔍 Thẩm Định FB")
    .addItem("🚀 Quét tất cả link chưa kiểm tra", "scanAllPendingRows")
    .addItem("🔄 Quét lại toàn bộ bảng từ đầu", "rescanAllRows")
    .addToUi();
}

/**
 * Hàm chạy tự động khi có người sửa/dán link vào cột D (NHẬP LINK)
 * LƯU Ý: Phải cài đặt Trigger "Khi chỉnh sửa" (On edit) cho hàm này trong mục Kích hoạt (Triggers)!
 */
function onSheetEditTrigger(e) {
  if (!e || !e.range) return;
  const sheet = e.range.getSheet();
  const startRow = e.range.getRow();
  const numRows = e.range.getNumRows();
  const startCol = e.range.getColumn();
  const endCol = startCol + e.range.getNumColumns() - 1;

  // Chỉ xử lý nếu vùng chỉnh sửa có đụng tới cột D (cột 4) và từ dòng 3 trở xuống
  if (startCol <= 4 && endCol >= 4) {
    for (let r = Math.max(3, startRow); r < startRow + numRows; r++) {
      const linkVal = String(sheet.getRange(r, 4).getValue() || "").trim();
      if (!linkVal) {
        // Nếu người dùng xóa link -> xóa trắng 3 cột kết quả
        sheet.getRange(r, 5, 1, 3).clearContent();
        continue;
      }
      if (/^https?:\/\//i.test(linkVal) || /facebook\.com|fb\.com|fb\.watch/i.test(linkVal)) {
        processSingleRow_(sheet, r, linkVal);
      }
    }
  }
}

/**
 * Quét tất cả các dòng có link ở cột D nhưng chưa có kết quả ở cột E/F/G
 */
function scanAllPendingRows() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const lastRow = sheet.getLastRow();
  if (lastRow < 3) return;

  const data = sheet.getRange(3, 4, lastRow - 2, 4).getValues(); // D, E, F, G
  let count = 0;
  for (let i = 0; i < data.length; i++) {
    const rowIdx = i + 3;
    const linkVal = String(data[i][0] || "").trim();
    const colE = String(data[i][1] || "").trim();
    const colG = String(data[i][3] || "").trim();

    if (linkVal && /facebook\.com|fb\.com|fb\.watch/i.test(linkVal) && (!colE || !colG || colE === "⏳ Đang kiểm tra...")) {
      processSingleRow_(sheet, rowIdx, linkVal);
      count++;
      Utilities.sleep(300); // Giãn nhịp nhẹ tránh nghẽn
    }
  }
  SpreadsheetApp.getActiveSpreadsheet().toast(`Đã kiểm tra xong ${count} link mới!`, "✅ Hoàn tất", 5);
}

/**
 * Quét lại toàn bộ các dòng có link ở cột D (ghi đè kết quả cũ)
 */
function rescanAllRows() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const lastRow = sheet.getLastRow();
  if (lastRow < 3) return;

  const links = sheet.getRange(3, 4, lastRow - 2, 1).getValues();
  let count = 0;
  for (let i = 0; i < links.length; i++) {
    const rowIdx = i + 3;
    const linkVal = String(links[i][0] || "").trim();
    if (linkVal && /facebook\.com|fb\.com|fb\.watch/i.test(linkVal)) {
      processSingleRow_(sheet, rowIdx, linkVal);
      count++;
      Utilities.sleep(300);
    }
  }
  SpreadsheetApp.getActiveSpreadsheet().toast(`Đã quét lại xong ${count} link!`, "✅ Hoàn tất", 5);
}

/**
 * Gọi API KINI AI và ghi kết quả vào 3 cột E (5), F (6), G (7)
 */
function processSingleRow_(sheet, rowIdx, linkVal) {
  sheet.getRange(rowIdx, 5, 1, 3).setValues([["⏳ Đang kiểm tra...", "Đang quét...", "⏳"]]);
  SpreadsheetApp.flush();

  try {
    const payload = {
      url: linkVal,
      required_keywords: REQUIRED_KEYWORDS,
      keyword_mode: KEYWORD_MODE,
      require_public: REQUIRE_PUBLIC
    };

    const res = UrlFetchApp.fetch(FB_API_ENDPOINT, {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });

    if (res.getResponseCode() !== 200) {
      sheet.getRange(rowIdx, 5, 1, 3).setValues([
        ["(Lỗi máy chủ)", "HTTP " + res.getResponseCode(), "❌ Không thể kết nối"]
      ]);
      return;
    }

    const data = JSON.parse(res.getContentText());
    const accountText = data.account_id && data.account_name && data.account_name !== "(Không xác định)"
      ? `${data.account_name} (ID: ${data.account_id})`
      : (data.account_name || "(Không xác định)");

    const visibilityText = data.visibility || "Không rõ";
    const resultText = data.is_valid
      ? "✅ Hợp lệ"
      : `❌ Không hợp lệ (${data.reason || "Kiểm tra lại"})`;

    sheet.getRange(rowIdx, 5, 1, 3).setValues([[accountText, visibilityText, resultText]]);

    // Tô màu trực quan nhẹ cho cột Kết quả (Cột G)
    const cellG = sheet.getRange(rowIdx, 7);
    if (data.is_valid) {
      cellG.setBackground("#dcfce7").setFontColor("#15803d").setFontWeight("bold");
    } else {
      cellG.setBackground("#fee2e2").setFontColor("#b91c1c").setFontWeight("bold");
    }
  } catch (err) {
    sheet.getRange(rowIdx, 5, 1, 3).setValues([
      ["(Lỗi)", "Lỗi kết nối", "❌ " + err.message]
    ]);
  }
}
