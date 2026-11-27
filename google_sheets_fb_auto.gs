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
const PROP_KEY_EXCLUDED_ACCOUNTS = "FB_EXCLUDED_ACCOUNT_KEYWORDS";

// Từ khóa nội dung bắt buộc (để [] nếu chỉ kiểm tra Công khai & chống dùng lại link bài gốc)
const REQUIRED_KEYWORDS = [];
const KEYWORD_MODE = "any";
const REQUIRE_PUBLIC = true;

/**
 * Tạo menu tiện ích trên thanh công cụ Google Sheets
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("🔍 Thẩm Định FB")
    .addItem("⚙️ Nhập từ khóa Cột E (chống link bài gốc)", "openExcludedKeywordsPrompt")
    .addSeparator()
    .addItem("⚡ Bật TỰ ĐỘNG quét khi có người nhập link", "enableAutoScanTrigger")
    .addItem("🚀 Quét tất cả link chưa kiểm tra", "scanAllPendingRows")
    .addItem("🔄 Quét lại toàn bộ bảng từ đầu", "rescanAllRows")
    .addToUi();
}

/**
 * Hộp thoại nhập danh sách từ khóa Cột E (nếu Cột E trùng từ khóa -> Không hợp lệ: Dùng lại link bài gốc)
 */
function openExcludedKeywordsPrompt() {
  const ui = SpreadsheetApp.getUi();
  const props = PropertiesService.getDocumentProperties();
  const current = props.getProperty(PROP_KEY_EXCLUDED_ACCOUNTS) || "";

  const resp = ui.prompt(
    "⚙️ Cài Đặt Từ Khóa Chống Dùng Lại Link Bài Gốc (Cột E)",
    "Nhập tên trang / chủ tài khoản bài gốc (phân tách nhiều từ khóa bằng dấu phẩy `,`).\n" +
    "Nếu Cột E trùng với bất kỳ từ khóa nào dưới đây, Cột G sẽ tự động báo: ❌ Không hợp lệ (Dùng lại link bài gốc).\n\n" +
    "Ví dụ: Đoàn TNCS Hồ Chí Minh UBND tỉnh, Ngọc Khanh\n" +
    "Từ khóa hiện tại: " + (current || "(Chưa cài đặt)"),
    ui.ButtonSet.OK_CANCEL
  );

  if (resp.getSelectedButton() === ui.Button.OK) {
    const val = (resp.getResponseText() || "").trim();
    props.setProperty(PROP_KEY_EXCLUDED_ACCOUNTS, val);
    ui.alert(
      val
        ? `✅ Đã lưu từ khóa kiểm tra Cột E:\n"${val}"\n\nNếu muốn áp dụng ngay cho các dòng đã quét trước đó, anh bấm mục "🔄 Quét lại toàn bộ bảng từ đầu".`
        : "✅ Đã xóa danh sách từ khóa loại trừ Cột E."
    );
  }
}

/**
 * Lấy mảng từ khóa loại trừ ở Cột E (đã chuẩn hóa chữ thường)
 */
function getExcludedAccountKeywords_() {
  const raw = PropertiesService.getDocumentProperties().getProperty(PROP_KEY_EXCLUDED_ACCOUNTS) || "";
  return raw
    .split(/[,;\n]+/)
    .map(s => s.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Bấm 1 lần duy nhất (bằng tài khoản Chủ sở hữu) để tự động cài Trigger quét tức thì + quét bù mỗi phút
 */
function enableAutoScanTrigger() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(t => {
    const fn = t.getHandlerFunction();
    if (fn === "onSheetEditTrigger" || fn === "autoScanPendingEveryMinute") {
      ScriptApp.deleteTrigger(t);
    }
  });

  // 1. Trigger chạy ngay lập tức khi có bất kỳ ai dán/sửa link ở Cột D
  ScriptApp.newTrigger("onSheetEditTrigger")
    .forSpreadsheet(ss)
    .onEdit()
    .create();

  // 2. Trigger chạy ngầm mỗi 1 phút để quét bù nếu nhiều đơn vị dán cùng lúc
  ScriptApp.newTrigger("autoScanPendingEveryMinute")
    .timeBased()
    .everyMinutes(1)
    .create();

  SpreadsheetApp.getUi().alert(
    "✅ ĐÃ BẬT CHẾ ĐỘ TỰ ĐỘNG QUÉT 24/7!\n\n" +
    "• Từ giờ, hễ có cơ sở Đoàn nào vừa dán link vào Cột D, hệ thống sẽ tự động quét và điền ngay vào Cột E, F, G trong 1–2 giây.\n" +
    "• Ngoài ra có thêm bộ quét bù tự động mỗi phút để không bao giờ bỏ sót link khi nhiều người nhập cùng lúc."
  );
}

/**
 * Hàm chạy tự động ngay khi có người sửa/dán link vào Cột D (NHẬP LINK)
 */
function onSheetEditTrigger(e) {
  if (!e || !e.range) return;
  const sheet = e.range.getSheet();
  const startRow = e.range.getRow();
  const numRows = e.range.getNumRows();
  const startCol = e.range.getColumn();
  const endCol = startCol + e.range.getNumColumns() - 1;

  if (startCol <= 4 && endCol >= 4) {
    for (let r = Math.max(3, startRow); r < startRow + numRows; r++) {
      const linkVal = String(sheet.getRange(r, 4).getValue() || "").trim();
      if (!linkVal) {
        sheet.getRange(r, 5, 1, 3).clearContent().setBackground(null);
        refreshDuplicateAccountsInColE_(sheet);
        continue;
      }
      if (/^https?:\/\//i.test(linkVal) || /facebook\.com|fb\.com|fb\.watch/i.test(linkVal)) {
        processSingleRow_(sheet, r, linkVal);
      }
    }
  }
}

/**
 * Trigger chạy ngầm mỗi 1 phút quét các dòng mới chưa có kết quả (chống sót khi nhiều người dán đồng thời)
 */
function autoScanPendingEveryMinute() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(3000)) return;
  try {
    scanAllPendingRows_(true);
  } finally {
    lock.releaseLock();
  }
}

/**
 * Quét tất cả các dòng có link ở Cột D nhưng chưa có kết quả ở Cột E/G
 */
function scanAllPendingRows() {
  const count = scanAllPendingRows_(false);
  SpreadsheetApp.getActiveSpreadsheet().toast(`Đã kiểm tra xong ${count} link mới!`, "✅ Hoàn tất", 5);
}

function scanAllPendingRows_(silent) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const lastRow = sheet.getLastRow();
  if (lastRow < 3) return 0;

  const data = sheet.getRange(3, 4, lastRow - 2, 4).getValues(); // D, E, F, G
  let count = 0;
  for (let i = 0; i < data.length; i++) {
    const rowIdx = i + 3;
    const linkVal = String(data[i][0] || "").trim();
    const colE = String(data[i][1] || "").trim();
    const colG = String(data[i][3] || "").trim();

    if (linkVal && /facebook\.com|fb\.com|fb\.watch/i.test(linkVal) && (!colE || !colG || colE === "⏳ Đang kiểm tra...")) {
      processSingleRow_(sheet, rowIdx, linkVal, true);
      count++;
      Utilities.sleep(250);
    }
  }
  if (count > 0) refreshDuplicateAccountsInColE_(sheet);
  return count;
}

/**
 * Quét lại toàn bộ các dòng có link ở Cột D (ghi đè kết quả cũ)
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
      processSingleRow_(sheet, rowIdx, linkVal, true);
      count++;
      Utilities.sleep(250);
    }
  }
  if (count > 0) refreshDuplicateAccountsInColE_(sheet);
  SpreadsheetApp.getActiveSpreadsheet().toast(`Đã quét lại xong ${count} link!`, "✅ Hoàn tất", 5);
}

/**
 * Trích xuất khóa định danh tài khoản từ Cột E để kiểm tra trùng lặp chính xác
 * (Ưu tiên ID nếu có; nếu không có ID thì dùng tên tài khoản)
 */
function getAccountIdentityKey_(colEText) {
  const raw = String(colEText || "").trim();
  if (!raw || raw.startsWith("⏳") || raw.startsWith("(Không xác định)") || raw.startsWith("(Lỗi")) {
    return "";
  }
  const mId = raw.match(/\(ID:\s*([^)]+)\)/i);
  if (mId && mId[1]) {
    return "id:" + mId[1].trim().toLowerCase();
  }
  return "name:" + raw.toLowerCase().replace(/\s+/g, " ");
}

/**
 * Rà soát toàn bộ Cột E: nếu xuất hiện trùng tài khoản (từ lần thứ 2 trở đi) -> Cột G báo ❌ Không hợp lệ (Trùng tài khoản)
 */
function refreshDuplicateAccountsInColE_(sheet) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 3) return;

  const numRows = lastRow - 2;
  const rangeEFG = sheet.getRange(3, 5, numRows, 3);
  const values = rangeEFG.getValues(); // [E, F, G]
  const seenKeys = new Set();
  const excludedKws = getExcludedAccountKeywords_();

  for (let i = 0; i < values.length; i++) {
    const colE = String(values[i][0] || "").trim();
    const colF = String(values[i][1] || "").trim();
    const colG = String(values[i][2] || "").trim();
    if (!colE || colE === "⏳ Đang kiểm tra...") continue;

    const key = getAccountIdentityKey_(colE);
    const cellG = sheet.getRange(i + 3, 7);

    if (key && seenKeys.has(key)) {
      // Tài khoản bị trùng lặp từ dòng thứ 2 trở đi
      if (!colG.includes("Dùng lại link bài gốc")) {
        cellG.setValue("❌ Không hợp lệ (Trùng tài khoản)")
             .setBackground("#fee2e2")
             .setFontColor("#b91c1c")
             .setFontWeight("bold");
      }
    } else {
      if (key) seenKeys.add(key);
      // Nếu trước đây bị đánh dấu trùng tài khoản nhưng nay không còn trùng (do dòng trên đã xóa/đổi) -> khôi phục lại trạng thái Hợp lệ nếu đủ điều kiện
      if (colG === "❌ Không hợp lệ (Trùng tài khoản)") {
        const matchedExcluded = excludedKws.find(kw => colE.toLowerCase().includes(kw));
        if (matchedExcluded) {
          cellG.setValue("❌ Không hợp lệ (Dùng lại link bài gốc)")
               .setBackground("#fee2e2").setFontColor("#b91c1c").setFontWeight("bold");
        } else if (colF === "Công khai") {
          cellG.setValue("✅ Hợp lệ")
               .setBackground("#dcfce7").setFontColor("#15803d").setFontWeight("bold");
        }
      }
    }
  }
}

/**
 * Gọi API KINI AI, kiểm tra từ khóa Cột E và ghi kết quả vào 3 cột E (5), F (6), G (7)
 */
function processSingleRow_(sheet, rowIdx, linkVal, skipDupRefresh) {
  sheet.getRange(rowIdx, 5, 1, 3).setValues([["⏳ Đang kiểm tra...", "Đang quét...", "⏳"]]);
  SpreadsheetApp.flush();

  try {
    const res = UrlFetchApp.fetch(FB_API_ENDPOINT, {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify({
        url: linkVal,
        required_keywords: REQUIRED_KEYWORDS,
        keyword_mode: KEYWORD_MODE,
        require_public: REQUIRE_PUBLIC
      }),
      muteHttpExceptions: true
    });

    if (res.getResponseCode() !== 200) {
      sheet.getRange(rowIdx, 5, 1, 3).setValues([
        ["(Lỗi máy chủ)", "HTTP " + res.getResponseCode(), "❌ Không thể kết nối"]
      ]);
      return;
    }

    const data = JSON.parse(res.getContentText());
    const rawAccountName = (data.account_name || "").trim();
    const accountText = data.account_id && rawAccountName && rawAccountName !== "(Không xác định)"
      ? `${rawAccountName} (ID: ${data.account_id})`
      : (rawAccountName || "(Không xác định)");

    const visibilityText = data.visibility || "Không rõ";

    // Kiểm tra Cột E có trùng với từ khóa bài gốc hay không
    const excludedKws = getExcludedAccountKeywords_();
    const accountHaystack = accountText.toLowerCase();
    const matchedExcluded = excludedKws.find(kw => accountHaystack.includes(kw));

    let isFinalValid = Boolean(data.is_valid);
    let resultText = "";

    if (matchedExcluded) {
      isFinalValid = false;
      resultText = "❌ Không hợp lệ (Dùng lại link bài gốc)";
    } else if (isFinalValid) {
      resultText = "✅ Hợp lệ";
    } else {
      resultText = `❌ Không hợp lệ (${data.reason || "Kiểm tra lại"})`;
    }

    sheet.getRange(rowIdx, 5, 1, 3).setValues([[accountText, visibilityText, resultText]]);

    const cellG = sheet.getRange(rowIdx, 7);
    if (isFinalValid) {
      cellG.setBackground("#dcfce7").setFontColor("#15803d").setFontWeight("bold");
    } else {
      cellG.setBackground("#fee2e2").setFontColor("#b91c1c").setFontWeight("bold");
    }

    if (!skipDupRefresh) {
      refreshDuplicateAccountsInColE_(sheet);
    }
  } catch (err) {
    sheet.getRange(rowIdx, 5, 1, 3).setValues([
      ["(Lỗi)", "Lỗi kết nối", "❌ " + err.message]
    ]);
  }
}
