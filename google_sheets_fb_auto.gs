/**
 * ============================================================================
 * TỰ ĐỘNG THẨM ĐỊNH LINK FACEBOOK & ĐỒNG BỘ 2 CHIỀU VỚI PHẦN MỀM BỘ TIÊU CHÍ
 * Kết nối tới máy chủ: https://kini-ai.onrender.com/api/fb-check
 * ============================================================================
 * Cột A (1): TT
 * Cột B (2): Số link
 * Cột C (3): Tổ chức cơ sở Đoàn trực thuộc
 * Cột D (4): NHẬP LINK
 * Cột E (5): Tên trang cá nhân / Chủ tài khoản
 * Cột F (6): Trạng thái hiển thị (Công khai / Riêng tư / Link lỗi)
 * Cột G (7): Kết quả (✅ Hợp lệ / ❌ Không hợp lệ + Lý do)
 */

const FB_API_ENDPOINT = "https://kini-ai.onrender.com/api/fb-check";
const PROP_KEY_EXCLUDED_ACCOUNTS = "FB_EXCLUDED_ACCOUNT_KEYWORDS";
const REQUIRED_KEYWORDS = [];
const KEYWORD_MODE = "any";
const REQUIRE_PUBLIC = true;

function getMainSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheets()[0];
}

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
    refreshDuplicateAccountsInColE_(getMainSheet_());
    ui.alert(val ? `✅ Đã lưu và áp dụng từ khóa Cột E:\n"${val}"` : "✅ Đã xóa danh sách từ khóa loại trừ Cột E.");
  }
}

function getExcludedAccountKeywords_() {
  const raw = PropertiesService.getDocumentProperties().getProperty(PROP_KEY_EXCLUDED_ACCOUNTS) || "";
  return raw.split(/[,;\n]+/).map(s => s.trim().toLowerCase()).filter(Boolean);
}

function enableAutoScanTrigger() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  ScriptApp.getProjectTriggers().forEach(t => {
    const fn = t.getHandlerFunction();
    if (fn === "onSheetEditTrigger" || fn === "autoScanPendingEveryMinute") {
      ScriptApp.deleteTrigger(t);
    }
  });
  ScriptApp.newTrigger("onSheetEditTrigger").forSpreadsheet(ss).onEdit().create();
  ScriptApp.newTrigger("autoScanPendingEveryMinute").timeBased().everyMinutes(1).create();
  SpreadsheetApp.getUi().alert(
    "✅ ĐÃ BẬT CHẾ ĐỘ TỰ ĐỘNG QUÉT 24/7!\n\n" +
    "• Hễ có cơ sở Đoàn nào vừa dán link vào Cột D, hệ thống sẽ tự động quét và điền ngay vào Cột E, F, G trong 1–2 giây.\n" +
    "• Có thêm bộ quét bù tự động mỗi phút để không bao giờ bỏ sót link."
  );
}

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

function autoScanPendingEveryMinute() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(3000)) return;
  try { scanAllPendingRows_(true); } finally { lock.releaseLock(); }
}

function scanAllPendingRows() {
  const count = scanAllPendingRows_(false);
  SpreadsheetApp.getActiveSpreadsheet().toast(`Đã kiểm tra xong ${count} link mới!`, "✅ Hoàn tất", 5);
}

function scanAllPendingRows_(silent) {
  const sheet = getMainSheet_();
  const lastRow = sheet.getLastRow();
  if (lastRow < 3) return 0;
  const data = sheet.getRange(3, 4, lastRow - 2, 4).getValues();
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

function rescanAllRows() {
  const count = rescanAllRows_();
  SpreadsheetApp.getActiveSpreadsheet().toast(`Đã quét lại xong ${count} link!`, "✅ Hoàn tất", 5);
}

function rescanAllRows_() {
  const sheet = getMainSheet_();
  const lastRow = sheet.getLastRow();
  if (lastRow < 3) return 0;
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
  return count;
}

function getAccountIdentityKey_(colEText) {
  const raw = String(colEText || "").trim();
  if (!raw || raw.startsWith("⏳") || raw.startsWith("(Không xác định)") || raw.startsWith("(Lỗi")) {
    return "";
  }
  const mId = raw.match(/\(ID:\s*([^)]+)\)/i);
  if (mId && mId[1]) return "id:" + mId[1].trim().toLowerCase();
  return "name:" + raw.toLowerCase().replace(/\s+/g, " ");
}

function refreshDuplicateAccountsInColE_(sheet) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 3) return;
  const numRows = lastRow - 2;
  const values = sheet.getRange(3, 5, numRows, 3).getValues();
  const seenKeys = new Set();
  const excludedKws = getExcludedAccountKeywords_();

  for (let i = 0; i < values.length; i++) {
    const colE = String(values[i][0] || "").trim();
    const colF = String(values[i][1] || "").trim();
    const colG = String(values[i][2] || "").trim();
    if (!colE || colE === "⏳ Đang kiểm tra...") continue;

    const key = getAccountIdentityKey_(colE);
    const cellG = sheet.getRange(i + 3, 7);
    const matchedExcluded = excludedKws.find(kw => colE.toLowerCase().includes(kw));

    if (matchedExcluded) {
      cellG.setValue("❌ Không hợp lệ (Dùng lại link bài gốc)")
           .setBackground("#fee2e2").setFontColor("#b91c1c").setFontWeight("bold");
      if (key) seenKeys.add(key);
    } else if (key && seenKeys.has(key)) {
      cellG.setValue("❌ Không hợp lệ (Trùng tài khoản)")
           .setBackground("#fee2e2").setFontColor("#b91c1c").setFontWeight("bold");
    } else {
      if (key) seenKeys.add(key);
      if (colG === "❌ Không hợp lệ (Trùng tài khoản)" || colG === "❌ Không hợp lệ (Dùng lại link bài gốc)") {
        if (colF === "Công khai") {
          cellG.setValue("✅ Hợp lệ")
               .setBackground("#dcfce7").setFontColor("#15803d").setFontWeight("bold");
        }
      }
    }
  }
}

function processSingleRow_(sheet, rowIdx, linkVal, skipDupRefresh) {
  sheet.getRange(rowIdx, 5, 1, 3).setValues([["⏳ Đang kiểm tra...", "Đang quét...", "⏳"]]);
  SpreadsheetApp.flush();
  try {
    const res = UrlFetchApp.fetch(FB_API_ENDPOINT, {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify({ url: linkVal, required_keywords: REQUIRED_KEYWORDS, keyword_mode: KEYWORD_MODE, require_public: REQUIRE_PUBLIC }),
      muteHttpExceptions: true
    });
    if (res.getResponseCode() !== 200) {
      sheet.getRange(rowIdx, 5, 1, 3).setValues([["(Lỗi máy chủ)", "HTTP " + res.getResponseCode(), "❌ Không thể kết nối"]]);
      return;
    }
    const data = JSON.parse(res.getContentText());
    const rawAccountName = (data.account_name || "").trim();
    const accountText = data.account_id && rawAccountName && rawAccountName !== "(Không xác định)"
      ? `${rawAccountName} (ID: ${data.account_id})`
      : (rawAccountName || "(Không xác định)");
    const visibilityText = data.visibility || "Không rõ";
    const excludedKws = getExcludedAccountKeywords_();
    const matchedExcluded = excludedKws.find(kw => accountText.toLowerCase().includes(kw));
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
    if (isFinalValid) cellG.setBackground("#dcfce7").setFontColor("#15803d").setFontWeight("bold");
    else cellG.setBackground("#fee2e2").setFontColor("#b91c1c").setFontWeight("bold");
    if (!skipDupRefresh) refreshDuplicateAccountsInColE_(sheet);
  } catch (err) {
    sheet.getRange(rowIdx, 5, 1, 3).setValues([["(Lỗi)", "Lỗi kết nối", "❌ " + err.message]]);
  }
}

/**
 * ============================================================================
 * WEB APP API CHO PHẦN MỀM BỘ TIÊU CHÍ (doGet / doPost)
 * ============================================================================
 */
function buildSheetJsonPayload_() {
  const sheet = getMainSheet_();
  const lastRow = sheet.getLastRow();
  const lastCol = Math.max(7, Math.min(12, sheet.getLastColumn()));
  const sheetTitle = String(sheet.getRange(1, 1).getValue() || "ĐƯỜNG LINK FACEBOOK").trim();
  const excludedKeywords = PropertiesService.getDocumentProperties().getProperty(PROP_KEY_EXCLUDED_ACCOUNTS) || "";

  const units = [];
  const scoreBoard = []; // Bảng ĐIỂM AI CHẤM (cột I, J, K)
  if (lastRow >= 3) {
    const vals = sheet.getRange(3, 1, lastRow - 2, lastCol).getValues();
    let currentUnit = null;

    for (let i = 0; i < vals.length; i++) {
      const rowIdx = i + 3;
      const colA = String(vals[i][0] || "").trim();
      const colB = String(vals[i][1] || "").trim();
      const colC = String(vals[i][2] || "").replace(/\s+/g, " ").trim();
      const colD = String(vals[i][3] || "").trim();
      const colE = String(vals[i][4] || "").trim();
      const colF = String(vals[i][5] || "").trim();
      const colG = String(vals[i][6] || "").trim();
      const colH = lastCol >= 8 ? vals[i][7] : "";
      const colI = lastCol >= 9 ? String(vals[i][8] || "").trim() : "";
      const colJ = lastCol >= 10 ? String(vals[i][9] || "").replace(/\s+/g, " ").trim() : "";
      const colK = lastCol >= 11 ? vals[i][10] : "";

      if (colI && /^donvi\d+$/i.test(colI) && colJ) {
        scoreBoard.push({
          code: colI,
          unitName: colJ,
          score: colK !== "" && colK !== null && colK !== undefined ? Number(colK) : 0
        });
      }

      if (colC) {
        currentUnit = {
          tt: colA || String(units.length + 1),
          unitName: colC,
          startRow: rowIdx,
          endRow: rowIdx,
          maxSlots: 0,
          sheetScore: colH !== "" && colH !== null && colH !== undefined ? colH : "",
          links: [],
          slots: []
        };
        units.push(currentUnit);
      }

      if (currentUnit && (colB || colD || colC)) {
        currentUnit.endRow = rowIdx;
        currentUnit.maxSlots += 1;
        const slotObj = {
          rowIdx: rowIdx,
          slotNo: colB || String(currentUnit.maxSlots),
          url: colD,
          accountName: colE,
          visibility: colF,
          resultText: colG,
          linkScore: colH !== "" && colH !== null && colH !== undefined ? colH : "",
          isValid: colG.startsWith("✅")
        };
        currentUnit.slots.push(slotObj);
        if (colD) {
          currentUnit.links.push(slotObj);
        }
      }
    }
  }

  return {
    ok: true,
    sheetTitle: sheetTitle,
    excludedKeywords: excludedKeywords,
    updatedAt: new Date().toISOString(),
    units: units,
    scoreBoard: scoreBoard
  };
}

function _jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  try {
    return _jsonResponse(buildSheetJsonPayload_());
  } catch (err) {
    return _jsonResponse({ ok: false, error: err.message });
  }
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(25000);
  try {
    const rawBody = e && e.postData && e.postData.contents ? e.postData.contents : "{}";
    const body = JSON.parse(rawBody);
    const action = body.action || "get";
    const sheet = getMainSheet_();

    if (action === "submit_links") {
      const targetRow = Number(body.rowIdx || 0);
      const links = Array.isArray(body.links)
        ? body.links.map(s => String(s || "").trim()).filter(Boolean)
        : (body.url ? [String(body.url).trim()] : []);

      if (targetRow >= 3 && links.length === 1) {
        sheet.getRange(targetRow, 4).setValue(links[0]);
        processSingleRow_(sheet, targetRow, links[0], true);
        refreshDuplicateAccountsInColE_(sheet);
      } else if (links.length > 0) {
        const unitNameReq = String(body.unitName || "").replace(/\s+/g, " ").trim().toLowerCase();
        const payload = buildSheetJsonPayload_();
        const unitObj = payload.units.find(u => {
          const uLow = u.unitName.toLowerCase();
          return uLow === unitNameReq || uLow.includes(unitNameReq) || unitNameReq.includes(uLow);
        });

        if (!unitObj) {
          return _jsonResponse({ ok: false, error: "Không tìm thấy đơn vị '" + body.unitName + "' trên Google Sheet." });
        }

        // Tìm các dòng còn trống ở Cột D trong phạm vi đơn vị
        const valsD = sheet.getRange(unitObj.startRow, 4, unitObj.maxSlots, 1).getValues();
        const emptyRows = [];
        for (let i = 0; i < valsD.length; i++) {
          if (!String(valsD[i][0] || "").trim()) {
            emptyRows.push(unitObj.startRow + i);
          }
        }

        const maxCount = Math.min(links.length, emptyRows.length);
        for (let k = 0; k < maxCount; k++) {
          const rIdx = emptyRows[k];
          sheet.getRange(rIdx, 4).setValue(links[k]);
          processSingleRow_(sheet, rIdx, links[k], true);
        }
        refreshDuplicateAccountsInColE_(sheet);
      }
      return _jsonResponse(buildSheetJsonPayload_());
    }

    if (action === "delete_link") {
      const rowIdx = Number(body.rowIdx || 0);
      if (rowIdx >= 3) {
        sheet.getRange(rowIdx, 4, 1, 4).clearContent();
        sheet.getRange(rowIdx, 7).setBackground(null);
        refreshDuplicateAccountsInColE_(sheet);
      }
      return _jsonResponse(buildSheetJsonPayload_());
    }

    if (action === "set_excluded_keywords") {
      const kw = String(body.keywords || "").trim();
      PropertiesService.getDocumentProperties().setProperty(PROP_KEY_EXCLUDED_ACCOUNTS, kw);
      refreshDuplicateAccountsInColE_(sheet);
      return _jsonResponse(buildSheetJsonPayload_());
    }

    if (action === "scan_pending") {
      scanAllPendingRows_(true);
      return _jsonResponse(buildSheetJsonPayload_());
    }

    if (action === "rescan_all") {
      rescanAllRows_();
      return _jsonResponse(buildSheetJsonPayload_());
    }

    if (action === "clear_all_links") {
      const lastRow = sheet.getLastRow();
      if (lastRow >= 3) {
        const numRows = lastRow - 2;
        sheet.getRange(3, 4, numRows, 4).clearContent();
        sheet.getRange(3, 7, numRows, 1).setBackground(null);
      }
      return _jsonResponse(buildSheetJsonPayload_());
    }

    return _jsonResponse(buildSheetJsonPayload_());
  } catch (err) {
    return _jsonResponse({ ok: false, error: err.message });
  } finally {
    lock.releaseLock();
  }
}
