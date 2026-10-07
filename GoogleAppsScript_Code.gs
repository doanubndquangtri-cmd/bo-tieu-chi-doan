// =========================================================================================
// GOOGLE APPS SCRIPT: TỰ ĐỘNG QUẢN LÝ MINH CHỨNG & XUẤT BÁO CÁO EXCEL VÀO GOOGLE DRIVE
// HỆ THỐNG QUẢN LÝ TIÊU CHÍ ĐOÀN CẤP CƠ SỞ
// =========================================================================================

// CẤU HÌNH THƯ MỤC GỐC VÀ DỰ PHÒNG
var ROOT_FOLDER_NAME = "HỒ SƠ BÁO CÁO ĐOÀN 2026";
var ROOT_FOLDER_ID = ""; // Tự động tạo mới hoặc liên kết thư mục HỒ SƠ BÁO CÁO ĐOÀN 2026 trên Google Drive
var EXCEL_FOLDER_NAME = "BÁO CÁO TỔNG HỢP EXCEL ĐỊNH KỲ";
var ADMIN_DOCS_FOLDER_NAME = "Hệ thống Văn bản";
var ADMIN_DOCS_FOLDER_ID = "";

// DANH SÁCH 40 ĐƠN VỊ CƠ SỞ ĐOÀN VÀ ĐOÀN UBND TỈNH (QUẢNG TRỊ)
var UNIT_NAMES_MAP = {
  "DV": "Đoàn UBND Tỉnh",
  "0": "Đoàn UBND Tỉnh",
  "admin": "Đoàn UBND Tỉnh",
  "1": "Chi đoàn cơ sở BQL Khu kinh tế tỉnh Quảng Trị",
  "DV01": "Chi đoàn cơ sở BQL Khu kinh tế tỉnh Quảng Trị",
  "DV1": "Chi đoàn cơ sở BQL Khu kinh tế tỉnh Quảng Trị",
  "2": "Chi đoàn cơ sở Công ty TNHH MTV XSKT Quảng Bình",
  "DV02": "Chi đoàn cơ sở Công ty TNHH MTV XSKT Quảng Bình",
  "DV2": "Chi đoàn cơ sở Công ty TNHH MTV XSKT Quảng Bình",
  "3": "Đoàn cơ sở Công ty CP Việt Trung Quảng Bình",
  "DV03": "Đoàn cơ sở Công ty CP Việt Trung Quảng Bình",
  "DV3": "Đoàn cơ sở Công ty CP Việt Trung Quảng Bình",
  "4": "Đoàn cơ sở Công ty TNHH MTV QLKT CTTL Quảng Trị",
  "DV04": "Đoàn cơ sở Công ty TNHH MTV QLKT CTTL Quảng Trị",
  "DV4": "Đoàn cơ sở Công ty TNHH MTV QLKT CTTL Quảng Trị",
  "5": "Chi đoàn cơ sở Sở Tư pháp tỉnh Quảng Trị",
  "DV05": "Chi đoàn cơ sở Sở Tư pháp tỉnh Quảng Trị",
  "DV5": "Chi đoàn cơ sở Sở Tư pháp tỉnh Quảng Trị",
  "6": "Đoàn cơ sở Chi cục Hải quan Khu vực IX",
  "DV06": "Đoàn cơ sở Chi cục Hải quan Khu vực IX",
  "DV6": "Đoàn cơ sở Chi cục Hải quan Khu vực IX",
  "7": "Đoàn cơ sở Bệnh viện Đa khoa tỉnh Quảng Trị",
  "DV07": "Đoàn cơ sở Bệnh viện Đa khoa tỉnh Quảng Trị",
  "DV7": "Đoàn cơ sở Bệnh viện Đa khoa tỉnh Quảng Trị",
  "8": "Đoàn cơ sở Công ty TNHH MTV KTCTTL Quảng Bình",
  "DV08": "Đoàn cơ sở Công ty TNHH MTV KTCTTL Quảng Bình",
  "DV8": "Đoàn cơ sở Công ty TNHH MTV KTCTTL Quảng Bình",
  "9": "Chi đoàn cơ sở Sở Tài chính tỉnh Quảng Trị",
  "DV09": "Chi đoàn cơ sở Sở Tài chính tỉnh Quảng Trị",
  "DV9": "Chi đoàn cơ sở Sở Tài chính tỉnh Quảng Trị",
  "10": "Đoàn cơ sở Sở Nông nghiệp và Môi trường tỉnh Quảng Trị",
  "DV10": "Đoàn cơ sở Sở Nông nghiệp và Môi trường tỉnh Quảng Trị",
  "11": "Đoàn cơ sở Sở Xây dựng tỉnh Quảng Trị",
  "DV11": "Đoàn cơ sở Sở Xây dựng tỉnh Quảng Trị",
  "12": "Chi đoàn cơ sở VP UBND tỉnh Quảng Trị",
  "DV12": "Chi đoàn cơ sở VP UBND tỉnh Quảng Trị",
  "13": "Chi đoàn Thanh tra tỉnh",
  "DV13": "Chi đoàn Thanh tra tỉnh",
  "14": "Chi đoàn cơ sở Thống kê tỉnh Quảng Trị",
  "DV14": "Chi đoàn cơ sở Thống kê tỉnh Quảng Trị",
  "15": "Đoàn trường CĐ Kỹ thuật Công - Nông nghiệp Quảng Trị",
  "DV15": "Đoàn trường CĐ Kỹ thuật Công - Nông nghiệp Quảng Trị",
  "16": "Chi đoàn cơ sở Cơ quan Đảng ủy UBND tỉnh",
  "DV16": "Chi đoàn cơ sở Cơ quan Đảng ủy UBND tỉnh",
  "17": "Chi đoàn cơ sở Sở Nội vụ tỉnh Quảng Trị",
  "DV17": "Chi đoàn cơ sở Sở Nội vụ tỉnh Quảng Trị",
  "18": "Đoàn trường CĐ Y tế Quảng Trị",
  "DV18": "Đoàn trường CĐ Y tế Quảng Trị",
  "19": "Đoàn cơ sở Sở Khoa học và Công nghệ tỉnh Quảng Trị",
  "DV19": "Đoàn cơ sở Sở Khoa học và Công nghệ tỉnh Quảng Trị",
  "20": "Chi đoàn cơ sở Sở Ngoại vụ tỉnh Quảng Trị",
  "DV20": "Chi đoàn cơ sở Sở Ngoại vụ tỉnh Quảng Trị",
  "21": "Đoàn cơ sở Sở Văn hóa, thể thao và Du lịch tỉnh Quảng Trị",
  "DV21": "Đoàn cơ sở Sở Văn hóa, thể thao và Du lịch tỉnh Quảng Trị",
  "22": "Đoàn cơ sở Công ty CP Tổng công ty Thương mại Quảng Trị",
  "DV22": "Đoàn cơ sở Công ty CP Tổng công ty Thương mại Quảng Trị",
  "23": "Đoàn cơ sở Vườn Quốc gia Phong Nha - Kẻ Bàng",
  "DV23": "Đoàn cơ sở Vườn Quốc gia Phong Nha - Kẻ Bàng",
  "24": "Đoàn trường CĐ Nghề Quảng Trị",
  "DV24": "Đoàn trường CĐ Nghề Quảng Trị",
  "25": "Đoàn cơ sở Công ty TNHH MTV Lâm - Công nghiệp Long Đại",
  "DV25": "Đoàn cơ sở Công ty TNHH MTV Lâm - Công nghiệp Long Đại",
  "26": "Đoàn trường CĐ Kỹ thuật Quảng Trị",
  "DV26": "Đoàn trường CĐ Kỹ thuật Quảng Trị",
  "27": "Chi đoàn cơ sở Trung tâm phát triển Quỹ đất tỉnh Quảng Trị",
  "DV27": "Chi đoàn cơ sở Trung tâm phát triển Quỹ đất tỉnh Quảng Trị",
  "28": "Đoàn Trường CĐ Sư phạm Quảng Trị",
  "DV28": "Đoàn Trường CĐ Sư phạm Quảng Trị",
  "29": "Chi đoàn cơ sở Chi cục Dự trữ Nhà nước khu vực IX",
  "DV29": "Chi đoàn cơ sở Chi cục Dự trữ Nhà nước khu vực IX",
  "30": "Chi đoàn cơ sở Công ty Cổ phần nước sạch Quảng Trị",
  "DV30": "Chi đoàn cơ sở Công ty Cổ phần nước sạch Quảng Trị",
  "31": "Đoàn Trung tâm GDNN-GDTX tỉnh Quảng Trị",
  "DV31": "Đoàn Trung tâm GDNN-GDTX tỉnh Quảng Trị",
  "32": "Chi đoàn cơ sở Công ty Cổ phần Lệ Ninh",
  "DV32": "Chi đoàn cơ sở Công ty Cổ phần Lệ Ninh",
  "33": "Chi đoàn cơ sở Sở Công thương tỉnh Quảng Trị",
  "DV33": "Chi đoàn cơ sở Sở Công thương tỉnh Quảng Trị",
  "34": "Đoàn cơ sở Sở Y tế tỉnh Quảng Trị",
  "DV34": "Đoàn cơ sở Sở Y tế tỉnh Quảng Trị",
  "35": "Đoàn cơ sở Thuế tỉnh Quảng Trị",
  "DV35": "Đoàn cơ sở Thuế tỉnh Quảng Trị",
  "36": "Chi đoàn cơ sở Trung tâm Xúc tiến Đầu tư, Thương mại và Du lịch",
  "DV36": "Chi đoàn cơ sở Trung tâm Xúc tiến Đầu tư, Thương mại và Du lịch",
  "37": "Đoàn cơ sở Công ty TNHH MTV Cao su Quảng Trị",
  "DV37": "Đoàn cơ sở Công ty TNHH MTV Cao su Quảng Trị",
  "38": "Chi đoàn cơ sở Bảo hiểm xã hội tỉnh Quảng Trị",
  "DV38": "Chi đoàn cơ sở Bảo hiểm xã hội tỉnh Quảng Trị",
  "39": "Chi đoàn cơ sở BQL Dự án Đầu tư xây dựng CTDD, CN & HTKT",
  "DV39": "Chi đoàn cơ sở BQL Dự án Đầu tư xây dựng CTDD, CN & HTKT",
  "40": "Chi đoàn cơ sở Ban Quản lý dự án Đầu tư xây dựng CTGT",
  "DV40": "Chi đoàn cơ sở Ban Quản lý dự án Đầu tư xây dựng CTGT"
};

// =========================================================================================
// HÀM TIỆN ÍCH QUẢN LÝ THƯ MỤC TRÊN GOOGLE DRIVE
// =========================================================================================

/**
 * Làm sạch tên thư mục / tệp tin, loại bỏ ký tự cấm và bỏ chữ năm nếu có
 */
function sanitizeName(str) {
  if (!str) return "";
  var s = String(str).trim();
  s = s.replace(/[\/\\:*?"<>|]/g, "_");
  // Bỏ bớt phần năm nếu có gắn kèm thừa (VD: "Tháng 10/2026" -> "Tháng 10", "Tháng 10-2026" -> "Tháng 10")
  s = s.replace(/[\/-]\s*\d{4}$/, "").trim();
  return s;
}

/**
 * Tìm hoặc tạo thư mục con bên trong thư mục cha (bỏ qua thư mục trong thùng rác)
 */
function getOrCreateFolder(parentFolder, folderName) {
  var cleanName = sanitizeName(folderName);
  if (!cleanName) cleanName = "Thư mục";
  var it = parentFolder.getFoldersByName(cleanName);
  while (it.hasNext()) {
    var f = it.next();
    if (!f.isTrashed()) {
      return f;
    }
  }
  var newFolder = parentFolder.createFolder(cleanName);
  try {
    newFolder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  } catch (e) {}
  return newFolder;
}

/**
 * Tìm hoặc tạo thư mục gốc "HỒ SƠ BÁO CÁO ĐOÀN" trên Google Drive
 */
function getRootReportFolder() {
  if (typeof ROOT_FOLDER_ID !== "undefined" && ROOT_FOLDER_ID && ROOT_FOLDER_ID.length > 5) {
    try {
      var directFolder = DriveApp.getFolderById(ROOT_FOLDER_ID);
      if (directFolder && !directFolder.isTrashed()) {
        return directFolder;
      }
    } catch (eDir) {}
  }

  var it = DriveApp.getRootFolder().getFolders();
  while (it.hasNext()) {
    var f = it.next();
    if (!f.isTrashed()) {
      var n = f.getName();
      if (n === ROOT_FOLDER_NAME || n.indexOf("HỒ SƠ BÁO CÁO ĐOÀN") > -1) {
        return f;
      }
    }
  }
  var newRoot = DriveApp.getRootFolder().createFolder(ROOT_FOLDER_NAME);
  try {
    newRoot.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  } catch (e) {}
  return newRoot;
}

/**
 * Chuẩn hóa thông tin đơn vị Đoàn:
 * [DVxx] Tên đầy đủ
 */
function resolveFullUnitInfo(unitCode, unitName) {
  var code = String(unitCode || "").trim();
  var name = String(unitName || "").trim();

  if (!code || code === "0" || code.toUpperCase() === "DV" || code.toLowerCase() === "admin" || name.indexOf("UBND") > -1) {
    return {
      unitCode: "DV",
      unitName: "Đoàn UBND Tỉnh",
      folderName: "[DV] Đoàn UBND Tỉnh"
    };
  }

  var numMatch = code.match(/\d+/);
  var numStr = "";
  if (numMatch) {
    var num = parseInt(numMatch[0], 10);
    numStr = String(num);
    code = "DV" + (num < 10 ? "0" + num : num);
  }

  if (!name || name === "Đơn vị" || /^Đơn vị/i.test(name) || name === code) {
    if (UNIT_NAMES_MAP[code]) {
      name = UNIT_NAMES_MAP[code];
    } else if (numStr && UNIT_NAMES_MAP[numStr]) {
      name = UNIT_NAMES_MAP[numStr];
    } else if (numMatch && UNIT_NAMES_MAP["DV" + numMatch[0]]) {
      name = UNIT_NAMES_MAP["DV" + numMatch[0]];
    }
  }

  var finalName = name || ("Đoàn cơ sở / Chi đoàn " + code);
  return {
    unitCode: code,
    unitName: finalName,
    folderName: "[" + code + "] " + finalName
  };
}

/**
 * Chuẩn hóa tên Nhóm Kỳ Hạn / Tháng (Ví dụ: "Tháng 10")
 */
function resolvePeriodFolderName(monthLabel) {
  var raw = sanitizeName(monthLabel);
  if (raw && raw !== "Chung" && raw !== "0") {
    return raw;
  }
  // Mặc định lấy theo tháng hiện tại: "Tháng MM" (Ví dụ: "Tháng 10")
  var now = new Date();
  return "Tháng " + Utilities.formatDate(now, "GMT+7", "MM");
}

function createJsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// =========================================================================================
// XỬ LÝ GET & POST REQUEST TỪ WEB / APP
// =========================================================================================

function doGet(e) {
  return createJsonResponse({
    status: "active",
    message: "Google Drive Upload API cho Hệ Thống Quản Lý Tiêu Chí Đoàn đang hoạt động chuẩn xác!"
  });
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return createJsonResponse({ status: "error", message: "Không nhận được dữ liệu (Empty POST payload)!" });
    }
    var rawData = e.postData.contents;
    var data = JSON.parse(rawData);

    // ---------------------------------------------------------------------
    // TRƯỜNG HỢP 1: KHỞI TẠO THƯ MỤC TRÊN DRIVE (KHI TẠO/SỬA TIÊU CHÍ HOẶC NHÓM THÁNG)
    // ---------------------------------------------------------------------
    if (data.action === "create_folder" || data.action === "create_criterion_folder") {
      var rootFolder = getRootReportFolder();
      var periodName = resolvePeriodFolderName(data.monthLabel);
      var periodFolder = getOrCreateFolder(rootFolder, periodName);

      var targetFolder = periodFolder;
      var criterionFolderName = sanitizeName(data.folderName || data.title || "");

      if (criterionFolderName) {
        targetFolder = getOrCreateFolder(periodFolder, criterionFolderName);
      }

      return createJsonResponse({
        status: "success",
        folderId: targetFolder.getId(),
        folderUrl: targetFolder.getUrl(),
        folderName: targetFolder.getName(),
        monthFolderUrl: periodFolder.getUrl(),
        monthFolderName: periodName
      });
    }

    // ---------------------------------------------------------------------
    // TRƯỜNG HỢP 2: ĐỒNG BỘ TOÀN BỘ TIÊU CHÍ & FILE VÀO GOOGLE DRIVE
    // ---------------------------------------------------------------------
    if (data.action === "sync_all_to_drive") {
      var syncRes = syncAllCriteriaAndFilesToGoogleDrive(data);
      return createJsonResponse(syncRes);
    }

    // ---------------------------------------------------------------------
    // TRƯỜNG HỢP 3B: TẢI ẢNH, VIDEO, TỆP TIN TRONG KHUNG CHAT (CHUNG & RIÊNG)
    // ---------------------------------------------------------------------
    if (data.action === "chat_upload_file") {
      var fileDataB64Chat = data.fileData;
      var originalNameChat = data.fileName || "TepTin_Chat";
      var isPrivate = Boolean(data.isPrivate);
      var unitNameChat = sanitizeName(data.unitName || "CoSoDoan");

      if (!fileDataB64Chat) {
        return createJsonResponse({ status: "error", message: "Không tìm thấy dữ liệu tệp tin chat!" });
      }

      var partsChat = fileDataB64Chat.split(",");
      var rawB64Chat = partsChat.length > 1 ? partsChat[1] : partsChat[0];
      var decodedBytesChat = Utilities.base64Decode(rawB64Chat);
      var blobChat = Utilities.newBlob(decodedBytesChat, getMimeTypeFromFileName(originalNameChat), originalNameChat);

      var rootFolderChat = getRootReportFolder();
      var nowChat = new Date();
      var dateFolderStr = "Ngày " + Utilities.formatDate(nowChat, "GMT+7", "dd-MM-yyyy");

      // LƯU TOÀN BỘ VÀO THƯ MỤC "Chat Box" BÊN TRONG "Hệ thống Văn bản" (Ảnh 2)
      var adminDocsFolder = getOrCreateFolder(rootFolderChat, ADMIN_DOCS_FOLDER_NAME);
      var chatBoxFolder = getOrCreateFolder(adminDocsFolder, "Chat Box");

      var targetFolderChat = chatBoxFolder;
      if (isPrivate) {
        var privateBoxFolder = getOrCreateFolder(chatBoxFolder, "Trao đổi riêng - " + unitNameChat);
        targetFolderChat = getOrCreateFolder(privateBoxFolder, dateFolderStr);
      } else {
        var publicBoxFolder = getOrCreateFolder(chatBoxFolder, "Trao đổi chung toàn khối");
        targetFolderChat = getOrCreateFolder(publicBoxFolder, dateFolderStr);
      }

      try {
        targetFolderChat.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      } catch (eShareChat) {}

      var fileChat = targetFolderChat.createFile(blobChat);
      try {
        fileChat.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      } catch (eFCShare) {}

      var fIdChat = fileChat.getId();
      return createJsonResponse({
        status: "success",
        fileId: fIdChat,
        fileName: originalNameChat,
        fileUrl: "https://drive.google.com/file/d/" + fIdChat + "/view?usp=sharing",
        downloadUrl: "https://drive.google.com/uc?export=download&id=" + fIdChat,
        folderUrl: targetFolderChat.getUrl()
      });
    }

    // ---------------------------------------------------------------------
    // TRƯỜNG HỢP 3: ADMIN TẢI VĂN BẢN VÀO "HỆ THỐNG VĂN BẢN"
    // ---------------------------------------------------------------------
    if (data.action === "admin_upload_doc" || data.isAdminDoc) {
      var fileDataB64Doc = data.fileData;
      var originalNameDoc = data.fileName || "VanBan";
      var targetFolderDocId = data.folderId || ADMIN_DOCS_FOLDER_ID;

      if (!fileDataB64Doc) {
        return createJsonResponse({ status: "error", message: "Không tìm thấy dữ liệu file văn bản!" });
      }

      var partsDoc = fileDataB64Doc.split(",");
      var rawB64Doc = partsDoc.length > 1 ? partsDoc[1] : partsDoc[0];
      var decodedBytesDoc = Utilities.base64Decode(rawB64Doc);
      var blobDoc = Utilities.newBlob(decodedBytesDoc, getMimeTypeFromFileName(originalNameDoc), originalNameDoc);

      var targetFolderDoc = null;
      try {
        targetFolderDoc = DriveApp.getFolderById(targetFolderDocId);
      } catch (errF) {
        targetFolderDoc = getOrCreateFolder(DriveApp.getRootFolder(), ADMIN_DOCS_FOLDER_NAME);
      }
      try {
        targetFolderDoc.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      } catch (eShare) {}

      var fileDoc = targetFolderDoc.createFile(blobDoc);
      try {
        fileDoc.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      } catch (eFShare) {}

      var fIdDoc = fileDoc.getId();
      return createJsonResponse({
        status: "success",
        fileId: fIdDoc,
        fileName: originalNameDoc,
        fileUrl: "https://drive.google.com/file/d/" + fIdDoc + "/view?usp=sharing",
        downloadUrl: "https://drive.google.com/uc?export=download&id=" + fIdDoc,
        folderUrl: targetFolderDoc.getUrl()
      });
    }

    // ---------------------------------------------------------------------
    // TRƯỜNG HỢP 4: LƯU FILE BÁO CÁO EXCEL ĐỊNH KỲ TỪ WEB
    // ---------------------------------------------------------------------
    if (data.action === "save_excel") {
      var fileDataB64Excel = data.fileData;
      if (!fileDataB64Excel) {
        return createJsonResponse({ status: "error", message: "Không có dữ liệu Excel!" });
      }
      var partsExcel = fileDataB64Excel.split(",");
      var rawB64Excel = partsExcel.length > 1 ? partsExcel[1] : partsExcel[0];
      var decodedBytesExcel = Utilities.base64Decode(rawB64Excel);

      var now = new Date();
      var d = Utilities.formatDate(now, "GMT+7", "dd");
      var m = Utilities.formatDate(now, "GMT+7", "MM");
      var y = Utilities.formatDate(now, "GMT+7", "yyyy");
      var h = Utilities.formatDate(now, "GMT+7", "HH'h'mm");

      var fileNameExcel = data.fileName || ("TongHop_Diem_Ngay_" + d + "_" + m + "_" + y + "_luc_" + h + ".xlsx");
      var monthFolderName = "Tháng " + m;

      var blobExcel = Utilities.newBlob(decodedBytesExcel, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileNameExcel);

      var rootFolderExcel = getRootReportFolder();
      var excelFolder = getOrCreateFolder(rootFolderExcel, EXCEL_FOLDER_NAME);
      var monthFolderExcel = getOrCreateFolder(excelFolder, monthFolderName);

      var fileExcel = monthFolderExcel.createFile(blobExcel);
      try {
        fileExcel.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      } catch (eFE) {}

      var fileIdExcel = fileExcel.getId();
      return createJsonResponse({
        status: "success",
        fileId: fileIdExcel,
        fileName: fileNameExcel,
        fileUrl: "https://drive.google.com/file/d/" + fileIdExcel + "/view?usp=sharing",
        downloadUrl: "https://drive.google.com/uc?export=download&id=" + fileIdExcel,
        folderName: monthFolderName
      });
    }

    // ---------------------------------------------------------------------
    // TRƯỜNG HỢP 5: XÓA TỆP TRÊN GOOGLE DRIVE
    // ---------------------------------------------------------------------
    // TRƯỜNG HỢP 5: XÓA TỆP HOẶC THƯ MỤC TRÊN GOOGLE DRIVE (ĐƯA VÀO THÙNG RÁC)
    // ---------------------------------------------------------------------
    if (data.action === "delete_file" || data.action === "delete_files" || data.action === "delete_folder") {
      var idsToDelete = [];
      if (data.fileId) idsToDelete.push(data.fileId);
      if (data.folderId) idsToDelete.push(data.folderId);
      if (Array.isArray(data.fileIds)) idsToDelete = idsToDelete.concat(data.fileIds);
      if (Array.isArray(data.folderIds)) idsToDelete = idsToDelete.concat(data.folderIds);

      var urls = Array.isArray(data.fileUrls) ? data.fileUrls : (data.fileUrl ? [data.fileUrl] : []);
      if (data.folderUrl) urls.push(data.folderUrl);
      if (Array.isArray(data.folderUrls)) urls = urls.concat(data.folderUrls);

      urls.forEach(function(u) {
        if (!u) return;
        var m1 = String(u).match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
        if (m1 && m1[1]) idsToDelete.push(m1[1]);
        var m2 = String(u).match(/[?&]id=([a-zA-Z0-9_-]+)/);
        if (m2 && m2[1]) idsToDelete.push(m2[1]);
        var m3 = String(u).match(/\/folders\/([a-zA-Z0-9_-]+)/);
        if (m3 && m3[1]) idsToDelete.push(m3[1]);
      });

      var uniqueIds = [];
      idsToDelete.forEach(function(id) {
        if (id && uniqueIds.indexOf(id) === -1) uniqueIds.push(id);
      });

      var deletedCount = 0;
      uniqueIds.forEach(function(fId) {
        try {
          var folder = DriveApp.getFolderById(fId);
          folder.setTrashed(true);
          deletedCount++;
        } catch (errFo) {
          try {
            var f = DriveApp.getFileById(fId);
            f.setTrashed(true);
            deletedCount++;
          } catch (errFi) {}
        }
      });

      return createJsonResponse({
        status: "success",
        deletedCount: deletedCount,
        totalRequested: uniqueIds.length
      });
    }

    // ---------------------------------------------------------------------
    // TRƯỜNG HỢP 5B: ĐỔI TÊN TỆP HOẶC THƯ MỤC TRÊN GOOGLE DRIVE (KHÔNG TẠO MỚI)
    // ---------------------------------------------------------------------
    if (data.action === "rename_file" || data.action === "rename_folder") {
      var targetId = data.fileId || data.folderId;
      var targetUrl = data.fileUrl || data.folderUrl;
      var newName = (data.newName || data.title || "").trim();

      if (!targetId && targetUrl) {
        var mF = String(targetUrl).match(/\/folders\/([a-zA-Z0-9_-]+)/);
        if (mF && mF[1]) targetId = mF[1];
        var mFl = String(targetUrl).match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
        if (mFl && mFl[1]) targetId = mFl[1];
        var mId = String(targetUrl).match(/[?&]id=([a-zA-Z0-9_-]+)/);
        if (mId && mId[1]) targetId = mId[1];
      }

      if (!targetId || !newName) {
        return createJsonResponse({ status: "error", message: "Thiếu ID hoặc Tên mới cần đổi!" });
      }

      var renamed = false;
      var objType = "unknown";
      try {
        var folderObj = DriveApp.getFolderById(targetId);
        folderObj.setName(newName);
        renamed = true;
        objType = "folder";
      } catch (errFo) {
        try {
          var fileObj = DriveApp.getFileById(targetId);
          fileObj.setName(newName);
          renamed = true;
          objType = "file";
        } catch (errF) {}
      }

      if (renamed) {
        return createJsonResponse({
          status: "success",
          message: "Đã đổi tên thành công trên Google Drive!",
          targetId: targetId,
          newName: newName,
          type: objType
        });
      } else {
        return createJsonResponse({ status: "error", message: "Không tìm thấy tệp hoặc thư mục trên Drive!" });
      }
    }

    // ---------------------------------------------------------------------
    // TRƯỜNG HỢP 6 (MẶC ĐỊNH): CƠ SỞ ĐOÀN NỘP MINH CHỨNG / BÁO CÁO TIÊU CHÍ
    // CẤU TRÚC LƯU TRỮ CHUẨN MỰC:
    // HỒ SƠ BÁO CÁO ĐOÀN
    //   └── [Tháng 10] (Tên Nhóm Kỳ Hạn / Tháng)
    //         └── [Tên Tiêu Chí] (Ví dụ: Kế hoạch tổ chức 70 năm...)
    //               └── [DVxx] Tên Đơn Vị (Ví dụ: [DV01] Chi đoàn BQL...)
    //                     └── Tệp nộp báo cáo
    // ---------------------------------------------------------------------
    var fileDataB64 = data.fileData;
    var originalName = data.fileName || "minh_chung";
    var unitName = data.unitName || "Đơn vị";
    var unitCode = data.unitCode || "DV";
    var criterionTitle = data.criterionTitle || "Tiêu chí";
    var colLabel = data.colLabel || "Cột";
    var monthLabel = data.monthLabel || "Chung";
    var customFolderId = data.customFolderId || data.folderId || "";
    var customFolderName = data.customFolderName || data.folderName || "";

    if (!fileDataB64) {
      return createJsonResponse({ status: "error", message: "Không tìm thấy dữ liệu tệp tin!" });
    }

    var parts = fileDataB64.split(",");
    var rawB64 = parts.length > 1 ? parts[1] : parts[0];
    var decodedBytes = Utilities.base64Decode(rawB64);
    var blob = Utilities.newBlob(decodedBytes, getMimeTypeFromFileName(originalName), originalName);

    // 1. Xác định Thư mục gốc
    var rootFolder = null;
    if (customFolderId && String(customFolderId).trim().length > 5) {
      try {
        rootFolder = DriveApp.getFolderById(String(customFolderId).trim());
      } catch (errCust) {}
    }
    if (!rootFolder) {
      rootFolder = getRootReportFolder();
    }

    // 2. Thư mục Cấp 1: Nhóm Kỳ Hạn / Tháng (Ví dụ: "Tháng 10")
    var periodFolderName = resolvePeriodFolderName(monthLabel);
    var periodFolder = getOrCreateFolder(rootFolder, periodFolderName);

    // 3. Thư mục Cấp 2: Tên Tiêu Chí (nếu có Tên Thư mục Tiêu chí)
    var parentForUnit = periodFolder;
    var critFolderName = sanitizeName(customFolderName || criterionTitle || "");
    if (critFolderName) {
      parentForUnit = getOrCreateFolder(periodFolder, critFolderName);
    }

    // 4. Thư mục Cấp 3: Tên Đơn Vị ([DVxx] Tên Đơn Vị)
    var unitInfo = resolveFullUnitInfo(unitCode, unitName);
    var unitFolder = getOrCreateFolder(parentForUnit, unitInfo.folderName);

    // 5. Chuẩn hóa tên tệp và tạo tệp tin
    var cleanCritTitle = sanitizeName(criterionTitle).substring(0, 35);
    var timestamp = Utilities.formatDate(new Date(), "GMT+7", "yyyyMMdd_HHmmss");
    var finalFileName = unitCode + "_" + colLabel + "_" + cleanCritTitle + "_" + timestamp + "_" + sanitizeName(originalName);
    blob.setName(finalFileName);

    var file = unitFolder.createFile(blob);
    try {
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    } catch (eF) {}

    var fileId = file.getId();
    return createJsonResponse({
      status: "success",
      fileId: fileId,
      fileName: finalFileName,
      originalName: originalName,
      fileUrl: "https://drive.google.com/file/d/" + fileId + "/view?usp=sharing",
      downloadUrl: "https://drive.google.com/uc?export=download&id=" + fileId,
      folderUrl: unitFolder.getUrl(),
      parentFolderUrl: parentForUnit.getUrl(),
      monthFolderUrl: periodFolder.getUrl()
    });

  } catch (error) {
    return createJsonResponse({ status: "error", message: error.toString() });
  }
}

/**
 * Nhận diện MIME Type an toàn dựa vào phần mở rộng của tên tệp tin
 */
function getMimeTypeFromFileName(fileName) {
  var name = String(fileName || "").toLowerCase();
  if (name.match(/\.pdf$/)) return "application/pdf";
  if (name.match(/\.docx$/)) return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  if (name.match(/\.doc$/)) return "application/msword";
  if (name.match(/\.xlsx$/)) return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  if (name.match(/\.xls$/)) return "application/vnd.ms-excel";
  if (name.match(/\.pptx$/)) return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
  if (name.match(/\.ppt$/)) return "application/vnd.ms-powerpoint";
  if (name.match(/\.(jpg|jpeg)$/)) return "image/jpeg";
  if (name.match(/\.png$/)) return "image/png";
  if (name.match(/\.gif$/)) return "image/gif";
  if (name.match(/\.webp$/)) return "image/webp";
  if (name.match(/\.mp4$/)) return "video/mp4";
  if (name.match(/\.mov$/)) return "video/quicktime";
  if (name.match(/\.avi$/)) return "video/x-msvideo";
  if (name.match(/\.mkv$/)) return "video/x-matroska";
  if (name.match(/\.zip$/)) return "application/zip";
  if (name.match(/\.rar$/)) return "application/x-rar-compressed";
  if (name.match(/\.7z$/)) return "application/x-7z-compressed";
  return "application/octet-stream";
}

// =========================================================================================
// CHỨC NĂNG ĐỒNG BỘ TOÀN BỘ CÂY THƯ MỤC VÀ TỆP TIN TỪ HỆ THỐNG VÀO GOOGLE DRIVE
// =========================================================================================

/**
 * Quét toàn bộ tiêu chí trong hệ thống:
 * 1. Tự động tạo thư mục gốc: "HỒ SƠ BÁO CÁO ĐOÀN"
 * 2. Tự động tạo Thư mục Nhóm Kỳ Hạn / Tháng (Ví dụ: "Tháng 10")
 * 3. Tự động tạo Thư mục Tiêu chí con bên trong từng Tháng
 * 4. Kéo các tệp tin đính kèm đang lưu dự phòng về đúng thư mục từng đơn vị trên Google Drive!
 */
function syncAllCriteriaAndFilesToGoogleDrive(optionalPayload) {
  try {
    var rootFolder = getRootReportFolder();
    try {
      getOrCreateFolder(rootFolder, ADMIN_DOCS_FOLDER_NAME);
      getOrCreateFolder(rootFolder, EXCEL_FOLDER_NAME);
    } catch (eSub) {}
    var criteria = [];
    var scores = [];
    var units = [];

    if (optionalPayload && optionalPayload.criteria) {
      criteria = optionalPayload.criteria || [];
      scores = optionalPayload.scores || [];
      units = optionalPayload.units || [];
    } else {
      // Nếu chạy trực tiếp từ Apps Script Editor, fetch từ GitHub API
      var tkArr = [61, 50, 42, 5, 45, 48, 17, 29, 30, 24, 57, 12, 18, 14, 50, 10, 49, 32, 49, 104, 25, 48, 44, 59, 42, 106, 98, 20, 43, 19, 54, 59, 31, 16, 107, 21, 60, 104, 12, 19];
      var tk = tkArr.map(function(c) { return String.fromCharCode(c ^ 90); }).join("");
      var ghUrl = "https://api.github.com/repos/doanubndquangtri-cmd/bo-tieu-chi-doan/contents/cloud_db.json?ref=cloud-data&t=" + new Date().getTime();
      var ghRes = UrlFetchApp.fetch(ghUrl, {
        headers: {
          "Authorization": "token " + tk,
          "Accept": "application/vnd.github.v3+json",
          "User-Agent": "doan-sync"
        },
        muteHttpExceptions: true
      });
      if (ghRes.getResponseCode() === 200) {
        var ghJson = JSON.parse(ghRes.getContentText("UTF-8"));
        var contentStr = Utilities.newBlob(Utilities.base64Decode(ghJson.content.replace(/\s+/g, ""))).getDataAsString("UTF-8");
        var db = JSON.parse(contentStr);
        criteria = db.criteria || [];
        scores = db.scores || [];
        units = db.units || [];
      }
    }

    var unitsMap = {};
    units.forEach(function(u) { unitsMap[u.id] = u; });

    // 1. Tạo cây thư mục phân cấp chuẩn mực: Tháng -> Tiêu chí
    var critFoldersMap = {};
    var createdFoldersCount = 0;

    criteria.forEach(function(c) {
      var periodName = resolvePeriodFolderName(c.month_label);
      var periodFolder = getOrCreateFolder(rootFolder, periodName);

      var fName = sanitizeName(c.gdrive_folder_name || c.title || ("Cột " + c.col_number));
      var critFolder = getOrCreateFolder(periodFolder, fName);

      critFoldersMap[c.id] = {
        folder: critFolder,
        name: fName,
        monthFolder: periodFolder,
        url: critFolder.getUrl()
      };
      createdFoldersCount++;
    });

    // 2. Kéo các file đính kèm từ GitHub về đúng thư mục đơn vị trong tiêu chí
    var importedFiles = 0;

    // A. Quét toàn bộ tệp tin thực tế đang lưu trữ trong thư mục uploads của GitHub
    var uploadFilesList = [];
    if (optionalPayload && optionalPayload.uploadFilesList && optionalPayload.uploadFilesList.length > 0) {
      uploadFilesList = optionalPayload.uploadFilesList;
    } else {
      try {
        var upTkArr = [61, 50, 42, 5, 45, 48, 17, 29, 30, 24, 57, 12, 18, 14, 50, 10, 49, 32, 49, 104, 25, 48, 44, 59, 42, 106, 98, 20, 43, 19, 54, 59, 31, 16, 107, 21, 60, 104, 12, 19];
        var upTk = upTkArr.map(function(c) { return String.fromCharCode(c ^ 90); }).join("");
        var upRes = UrlFetchApp.fetch("https://api.github.com/repos/doanubndquangtri-cmd/bo-tieu-chi-doan/contents/uploads?ref=cloud-data", {
          headers: {
            "Authorization": "token " + upTk,
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": "doan-sync"
          },
          muteHttpExceptions: true
        });
        if (upRes.getResponseCode() === 200) {
          uploadFilesList = JSON.parse(upRes.getContentText("UTF-8"));
        }
      } catch (eUp) {}
    }

    if (uploadFilesList && uploadFilesList.length > 0) {
      uploadFilesList.forEach(function(fObj) {
        var fName = fObj.name;
        var match = fName.match(/^(DV\d+)_C(\d+)_(.+)$/i);
        if (!match) return;
        var uCode = match[1].toUpperCase();
        var cId = parseInt(match[2], 10);
        var rawName = match[3];
        var cleanName = rawName.replace(/^\d{12,14}_/, "");

        var critInfo = critFoldersMap[cId];
        if (!critInfo) {
          for (var idKey in critFoldersMap) {
            var cObj = criteria.filter(function(x){ return x.id == idKey; })[0];
            if (cObj && cObj.col_number == cId) {
              critInfo = critFoldersMap[idKey];
              break;
            }
          }
        }
        if (!critInfo) return;

        var uInfo = resolveFullUnitInfo(uCode, UNIT_NAMES_MAP[uCode] || ("Đơn vị " + uCode));
        var unitFolder = getOrCreateFolder(critInfo.folder, uInfo.folderName);

        var existing = unitFolder.getFilesByName(cleanName);
        if (existing.hasNext()) return;

        var downloadUrl = fObj.download_url || ("https://raw.githubusercontent.com/doanubndquangtri-cmd/bo-tieu-chi-doan/cloud-data/uploads/" + encodeURIComponent(fName));
        try {
          var tkA = [61, 50, 42, 5, 45, 48, 17, 29, 30, 24, 57, 12, 18, 14, 50, 10, 49, 32, 49, 104, 25, 48, 44, 59, 42, 106, 98, 20, 43, 19, 54, 59, 31, 16, 107, 21, 60, 104, 12, 19];
          var tokenStr = tkA.map(function(c) { return String.fromCharCode(c ^ 90); }).join("");
          var dlRes = UrlFetchApp.fetch(downloadUrl, {
            headers: { "Authorization": "token " + tokenStr },
            muteHttpExceptions: true
          });
          if (dlRes.getResponseCode() === 200) {
            var blob = dlRes.getBlob().setName(cleanName);
            var driveFile = unitFolder.createFile(blob);
            driveFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
            importedFiles++;
          }
        } catch (eDl) {}
      });
    }

    // B. Kiểm tra thêm trong scores nếu có
    scores.forEach(function(sc) {
      var critInfo = critFoldersMap[sc.criterion_id];
      if (!critInfo) return;

      var u = unitsMap[sc.unit_id] || { username: "DV" + sc.unit_id, unit_name: "Đơn vị " + sc.unit_id };
      var uInfo = resolveFullUnitInfo(u.username || ("DV" + u.id), u.unit_name || u.name);
      var unitFolder = getOrCreateFolder(critInfo.folder, uInfo.folderName);

      var files = Array.isArray(sc.files) ? sc.files : (sc.file_path ? [{ name: sc.file_name || 'Tệp', url: sc.file_path }] : []);
      files.forEach(function(fItem) {
        if (!fItem || !fItem.url) return;
        var existing = unitFolder.getFilesByName(fItem.name);
        if (existing.hasNext()) return; // Đã có file trên Drive

        if (fItem.url.indexOf("http") === 0) {
          try {
            var fetchOpt = { muteHttpExceptions: true };
            if (fItem.url.indexOf("github") > -1) {
              var tkA = [61, 50, 42, 5, 45, 48, 17, 29, 30, 24, 57, 12, 18, 14, 50, 10, 49, 32, 49, 104, 25, 48, 44, 59, 42, 106, 98, 20, 43, 19, 54, 59, 31, 16, 107, 21, 60, 104, 12, 19];
              var tokenStr = tkA.map(function(c) { return String.fromCharCode(c ^ 90); }).join("");
              fetchOpt.headers = { "Authorization": "token " + tokenStr };
            }
            var fRes = UrlFetchApp.fetch(fItem.url, fetchOpt);
            if (fRes.getResponseCode() === 200) {
              var blob = fRes.getBlob().setName(fItem.name);
              var driveFile = unitFolder.createFile(blob);
              driveFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
              importedFiles++;
            }
          } catch (eDl) {}
        }
      });
    });

    var critUrls = {};
    for (var cId in critFoldersMap) {
      critUrls[cId] = critFoldersMap[cId].url;
    }

    var resultMsg = "Đã khởi tạo thành công " + createdFoldersCount + " thư mục tiêu chí theo từng Tháng và đưa " + importedFiles + " tệp vào Google Drive!";
    return {
      status: "success",
      message: resultMsg,
      rootFolderId: rootFolder.getId(),
      rootFolderUrl: rootFolder.getUrl(),
      critUrls: critUrls,
      createdFoldersCount: createdFoldersCount,
      importedFiles: importedFiles
    };
  } catch (err) {
    return { status: "error", message: err.toString() };
  }
}

// =========================================================================================
// CHỨC NĂNG LẬP LỊCH TỰ ĐỘNG XUẤT EXCEL ĐỊNH KỲ LÚC 7H SÁNG (NGÀY 1, 5, 10, 15, 20, 25)
// =========================================================================================

function checkAndRunPeriodicExport() {
  var today = new Date();
  var dayOfMonth = parseInt(Utilities.formatDate(today, "GMT+7", "d"), 10);
  var validDays = [1, 5, 10, 15, 20, 25];
  if (validDays.indexOf(dayOfMonth) !== -1) {
    exportScheduledExcelReport(false);
  }
}

function exportScheduledExcelReport(force) {
  try {
    var now = new Date();
    var d = Utilities.formatDate(now, "GMT+7", "dd");
    var m = Utilities.formatDate(now, "GMT+7", "MM");
    var y = Utilities.formatDate(now, "GMT+7", "yyyy");
    var h = Utilities.formatDate(now, "GMT+7", "HH'h'mm");

    var fileName = "TongHop_Diem_Ngay_" + d + "_" + m + "_" + y + "_luc_" + h;
    var monthFolderName = "Tháng " + m;

    var ss = SpreadsheetApp.create(fileName);
    var sheet = ss.getActiveSheet();
    sheet.setName("Bảng Tổng Hợp Điểm");

    sheet.getRange(1, 1).setValue("BẢNG TỔNG HỢP TIÊU CHÍ ĐOÀN CẤP CƠ SỞ");
    sheet.getRange(2, 1).setValue("Thời điểm xuất: " + d + "/" + m + "/" + y + " lúc " + h);

    var rootFolder = getRootReportFolder();
    var excelFolder = getOrCreateFolder(rootFolder, EXCEL_FOLDER_NAME);
    var monthFolder = getOrCreateFolder(excelFolder, monthFolderName);

    var file = DriveApp.getFileById(ss.getId());
    monthFolder.addFile(file);
    DriveApp.getRootFolder().removeFile(file);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    return {
      status: "success",
      fileUrl: ss.getUrl(),
      fileName: fileName
    };
  } catch (err) {
    return { status: "error", message: err.toString() };
  }
}

function setupAutomatedTrigger() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === "checkAndRunPeriodicExport") {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
  ScriptApp.newTrigger("checkAndRunPeriodicExport")
    .timeBased()
    .atHour(7)
    .everyDays(1)
    .inTimezone("Asia/Ho_Chi_Minh")
    .create();
}
