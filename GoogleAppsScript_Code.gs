// =========================================================================================
// GOOGLE APPS SCRIPT: TỰ ĐỘNG QUẢN LÝ MINH CHỨNG & XUẤT BÁO CÁO EXCEL VÀO GOOGLE DRIVE
// HỆ THỐNG QUẢN LÝ TIÊU CHÍ ĐOÀN CẤP CƠ SỞ NĂM 2026
// =========================================================================================


/**
 * Tìm thư mục gốc tiếp nhận báo cáo của hệ thống trên Google Drive:
 * Tự động nhận diện cả "HỒ SƠ BÁO CÁO ĐOÀN" hoặc "HỒ SƠ BÁO CÁO ĐOÀN 2026"
 */
function getRootReportFolder() {
  var it = DriveApp.getRootFolder().getFolders();
  while (it.hasNext()) {
    var f = it.next();
    var n = f.getName();
    if (n.indexOf("HỒ SƠ BÁO CÁO ĐOÀN") > -1 || n.indexOf("H? SO BAO CAO DOAN") > -1) {
      return f;
    }
  }
  var newRoot = DriveApp.getRootFolder().createFolder("HỒ SƠ BÁO CÁO ĐOÀN");
  try {
    newRoot.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  } catch (e) {}
  return newRoot;
}

var ROOT_FOLDER_NAME = "HỒ SƠ BÁO CÁO ĐOÀN 2026";
var EXCEL_FOLDER_NAME = "BÁO CÁO TỔNG HỢP EXCEL ĐỊNH KỲ";
var CLOUD_DATA_URL = "https://raw.githubusercontent.com/doanubndquangtri-cmd/bo-tieu-chi-doan/cloud-data/cloud_db.json";


// =========================================================================================
// DANH SÁCH 40 ĐƠN VỊ CƠ SỞ ĐOÀN VÀ ĐOÀN UBND TỈNH (QUẢNG TRỊ - 2026)
// =========================================================================================
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

/**
 * Hàm chuẩn hóa tên và thư mục đơn vị:
 * - DV / Admin: Luôn là "Đoàn UBND Tỉnh" -> [DV] Đoàn UBND Tỉnh
 * - DV01..DV40: Luôn có tên đầy đủ -> [DVxx] Tên đầy đủ
 */
function resolveFullUnitInfo(unitCode, unitName) {
  var code = String(unitCode || "").trim();
  var name = String(unitName || "").trim();

  // Kiểm tra nếu là DV / admin / Đoàn UBND Tỉnh
  if (!code || code === "0" || code.toUpperCase() === "DV" || code.toLowerCase() === "admin" || name.indexOf("UBND") > -1) {
    return {
      unitCode: "DV",
      unitName: "Đoàn UBND Tỉnh",
      folderName: "[DV] Đoàn UBND Tỉnh"
    };
  }

  // Chuẩn hóa mã DV (DV01..DV40)
  var numMatch = code.match(/\d+/);
  var numStr = "";
  if (numMatch) {
    var num = parseInt(numMatch[0], 10);
    numStr = String(num);
    code = "DV" + (num < 10 ? "0" + num : num);
  }

  // Nếu tên bị thiếu hoặc chỉ là "Đơn vị" chung chung
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

function doPost(e) {
  try {
    var rawData = e.postData.contents;
    var data = JSON.parse(rawData);

    // =====================================================================
    // TRƯỜNG HỢP 1: LƯU FILE EXCEL TỔNG HỢP TỪ WEB / APP
    // =====================================================================
    if (data.action === "reorganize_drive" || data.action === "standardize_folders") {
      var reorgRes = reorganizeAndStandardizeDriveFolders();
      return createJsonResponse(reorgRes);
    }

    if (data.action === "save_excel") {
      var fileDataB64 = data.fileData;
      if (!fileDataB64) {
        return createJsonResponse({ status: "error", message: "Không có dữ liệu Excel!" });
      }
      if (fileDataB64.indexOf(",") > -1) {
        fileDataB64 = fileDataB64.split(",")[1];
      }
      var decodedBytes = Utilities.base64Decode(fileDataB64);
      var now = new Date();
      var d = Utilities.formatDate(now, "GMT+7", "dd");
      var m = Utilities.formatDate(now, "GMT+7", "MM");
      var y = Utilities.formatDate(now, "GMT+7", "yyyy");
      var h = Utilities.formatDate(now, "GMT+7", "HH'h'mm");

      var fileName = data.fileName || ("TongHop_Diem_Ngay_" + d + "_Thang_" + m + "_" + y + "_luc_" + h + ".xlsx");
      var monthFolderName = "Tháng " + m + "-" + y;

      var blob = Utilities.newBlob(decodedBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);

      // Thư mục gốc -> Thư mục Báo cáo định kỳ -> Thư mục Tháng
      var rootFolder = getRootReportFolder();
      rootFolder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

      var excelFolder = getOrCreateFolder(rootFolder, EXCEL_FOLDER_NAME);
      var monthFolder = getOrCreateFolder(excelFolder, monthFolderName);

      var file = monthFolder.createFile(blob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

      var fileId = file.getId();
      return createJsonResponse({
        status: "success",
        fileId: fileId,
        fileName: fileName,
        fileUrl: "https://drive.google.com/file/d/" + fileId + "/view?usp=sharing",
        downloadUrl: "https://drive.google.com/uc?export=download&id=" + fileId,
        folderName: monthFolderName
      });
    }

    // =====================================================================
    // TRƯỜNG HỢP 4: XÓA TỆP TRÊN GOOGLE DRIVE THEO YÊU CẦU CỦA ADMIN
    // (ĐƯA VÀO THÙNG RÁC GOOGLE DRIVE ĐỂ DỌN DẸP DUNG LƯỢNG NHANH CHÓNG)
    // =====================================================================
    if (data.action === "delete_file" || data.action === "delete_files") {
      var idsToDelete = [];
      if (data.fileId) idsToDelete.push(data.fileId);
      if (Array.isArray(data.fileIds)) idsToDelete = idsToDelete.concat(data.fileIds);

      var urls = Array.isArray(data.fileUrls) ? data.fileUrls : (data.fileUrl ? [data.fileUrl] : []);
      urls.forEach(function(u) {
        if (!u) return;
        var m1 = String(u).match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
        if (m1 && m1[1]) idsToDelete.push(m1[1]);
        var m2 = String(u).match(/[?&]id=([a-zA-Z0-9_-]+)/);
        if (m2 && m2[1]) idsToDelete.push(m2[1]);
      });

      var uniqueIds = [];
      idsToDelete.forEach(function(id) {
        if (id && uniqueIds.indexOf(id) === -1) uniqueIds.push(id);
      });

      var deletedCount = 0;
      var errors = [];
      uniqueIds.forEach(function(fId) {
        try {
          var f = DriveApp.getFileById(fId);
          f.setTrashed(true);
          deletedCount++;
        } catch (errDel) {
          errors.push("ID " + fId + ": " + errDel.toString());
        }
      });

      return createJsonResponse({
        status: "success",
        deletedCount: deletedCount,
        totalRequested: uniqueIds.length,
        errors: errors
      });
    }

    // =====================================================================
    // TRƯỜNG HỢP 3: ADMIN TẢI VĂN BẢN VÀO HỆ THỐNG VĂN BẢN (GOOGLE DRIVE)
    // =====================================================================
    if (data.action === "admin_upload_doc" || data.isAdminDoc) {
      var fileDataB64 = data.fileData;
      var originalName = data.fileName || "VanBan";
      var ADMIN_DOCS_FOLDER_ID = data.folderId || "1F5CdyDTQGUf0C21o7CCCAZkMOjgRKRJK";

      if (!fileDataB64) {
        return createJsonResponse({ status: "error", message: "Không tìm thấy dữ liệu file!" });
      }

      var contentType = "";
      if (fileDataB64.indexOf(",") > -1) {
        var parts = fileDataB64.split(",");
        var header = parts[0];
        fileDataB64 = parts[1];
        var match = header.match(/:(.*?);/);
        if (match) contentType = match[1];
      }
      var decodedBytes = Utilities.base64Decode(fileDataB64);
      if (!contentType) {
        if (originalName.match(/\.pdf$/i)) contentType = "application/pdf";
        else if (originalName.match(/\.docx$/i)) contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        else if (originalName.match(/\.doc$/i)) contentType = "application/msword";
        else if (originalName.match(/\.xlsx$/i)) contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        else if (originalName.match(/\.xls$/i)) contentType = "application/vnd.ms-excel";
        else if (originalName.match(/\.jpg|\.jpeg$/i)) contentType = "image/jpeg";
        else if (originalName.match(/\.png$/i)) contentType = "image/png";
        else contentType = "application/octet-stream";
      }
      var blob = Utilities.newBlob(decodedBytes, contentType, originalName);

      var targetFolder = null;
      var isDirectFolder = true;
      try {
        targetFolder = DriveApp.getFolderById(ADMIN_DOCS_FOLDER_ID);
      } catch (errF) {
        isDirectFolder = false;
        Logger.log("Chưa có quyền truy cập trực tiếp thư mục " + ADMIN_DOCS_FOLDER_ID + ", chuyển về thư mục gốc: " + errF);
        targetFolder = getOrCreateFolder(DriveApp.getRootFolder(), "Hệ thống Văn bản");
      }
      try {
        targetFolder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      } catch (eShare) {}

      var file = targetFolder.createFile(blob);
      try {
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      } catch (eFShare) {}
      var fileId = file.getId();

      return createJsonResponse({
        status: "success",
        fileId: fileId,
        fileName: originalName,
        fileUrl: "https://drive.google.com/file/d/" + fileId + "/view?usp=sharing",
        downloadUrl: "https://drive.google.com/uc?export=download&id=" + fileId,
        folderUrl: "https://drive.google.com/drive/folders/" + (isDirectFolder ? ADMIN_DOCS_FOLDER_ID : targetFolder.getId()),
        isDirectFolder: isDirectFolder,
        folderStatus: isDirectFolder ? "ok" : "fallback_permission_needed"
      });
    }

    // =====================================================================
    // TRƯỜNG HỢP 2: TẢI TẬP MINH CHỨNG CỦA CƠ SỞ ĐOÀN HOẶC ADMIN NỘP
    // HỖ TRỢ ĐƯỜNG LINK THƯ MỤC GOOGLE DRIVE RIÊNG DO ADMIN DÁN VÀO TIÊU CHÍ
    // =====================================================================
    var fileDataB64 = data.fileData; // base64 string
    var originalName = data.fileName || "minh_chung";
    var unitName = data.unitName || "Đơn vị";
    var unitCode = data.unitCode || "DV";
    var criterionTitle = data.criterionTitle || "Tiêu chí";
    var colLabel = data.colLabel || "Cột";
    var monthLabel = data.monthLabel || "Chung";
    var customFolderId = data.customFolderId || data.folderId || "";
    var customFolderName = data.customFolderName || data.folderName || "";

    if (!fileDataB64) {
      return createJsonResponse({ status: "error", message: "Không tìm thấy dữ liệu file!" });
    }

    var contentType = "";
    if (fileDataB64.indexOf(",") > -1) {
      var parts = fileDataB64.split(",");
      var header = parts[0];
      fileDataB64 = parts[1];
      var match = header.match(/:(.*?);/);
      if (match) contentType = match[1];
    }

    var decodedBytes = Utilities.base64Decode(fileDataB64);
    if (!contentType) {
      if (originalName.match(/\.pdf$/i)) contentType = "application/pdf";
      else if (originalName.match(/\.docx$/i)) contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
      else if (originalName.match(/\.doc$/i)) contentType = "application/msword";
      else if (originalName.match(/\.xlsx$/i)) contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
      else if (originalName.match(/\.xls$/i)) contentType = "application/vnd.ms-excel";
      else if (originalName.match(/\.pptx$/i)) contentType = "application/vnd.openxmlformats-officedocument.presentationml.presentation";
      else if (originalName.match(/\.ppt$/i)) contentType = "application/vnd.ms-powerpoint";
      else if (originalName.match(/\.jpg|\.jpeg$/i)) contentType = "image/jpeg";
      else if (originalName.match(/\.png$/i)) contentType = "image/png";
      else if (originalName.match(/\.gif$/i)) contentType = "image/gif";
      else if (originalName.match(/\.webp$/i)) contentType = "image/webp";
      else if (originalName.match(/\.mp4$/i)) contentType = "video/mp4";
      else if (originalName.match(/\.mov$/i)) contentType = "video/quicktime";
      else if (originalName.match(/\.avi$/i)) contentType = "video/x-msvideo";
      else if (originalName.match(/\.mkv$/i)) contentType = "video/x-matroska";
      else if (originalName.match(/\.webm$/i)) contentType = "video/webm";
      else if (originalName.match(/\.zip$/i)) contentType = "application/zip";
      else if (originalName.match(/\.rar$/i)) contentType = "application/x-rar-compressed";
      else if (originalName.match(/\.7z$/i)) contentType = "application/x-7z-compressed";
      else contentType = "application/octet-stream";
    }

    var blob = Utilities.newBlob(decodedBytes, contentType, originalName);

    // 1. Thư mục gốc tiếp nhận: Dùng thư mục do Admin chỉ định nếu có, hoặc ROOT_FOLDER_NAME
    var rootFolder = null;
    var isCustomFolder = false;
    if (customFolderId && String(customFolderId).trim().length > 5) {
      try {
        rootFolder = DriveApp.getFolderById(String(customFolderId).trim());
        isCustomFolder = true;
      } catch (errCust) {
        Logger.log("Không truy cập được customFolderId: " + customFolderId + ", lỗi: " + errCust);
      }
    }
    if (!rootFolder) {
      rootFolder = getRootReportFolder();
      try {
        rootFolder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      } catch (eR) {}
    }

    // 2. Thư mục Thời gian / Tên tiêu chí Admin chỉ định:
    // TẤT CẢ CÁC ĐƠN VỊ ĐỀU NẰM BÊN TRONG THƯ MỤC NÀY (Ví dụ: Tháng 10-2026 hoặc "Báo cáo Tháng 10"...)
    var periodFolderName = "";
    if (customFolderName && String(customFolderName).trim()) {
      periodFolderName = String(customFolderName).trim().replace(/[\/\\:*?"<>|]/g, "_");
      isCustomFolder = true;
    } else if (monthLabel && String(monthLabel).trim() && String(monthLabel).trim() !== "Chung") {
      periodFolderName = String(monthLabel).trim().replace(/[\/\\:*?"<>|]/g, "_");
    } else {
      var now = new Date();
      periodFolderName = "Tháng " + Utilities.formatDate(now, "GMT+7", "MM-yyyy");
    }

    var periodFolder = getOrCreateFolder(rootFolder, periodFolderName);
    try {
      periodFolder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    } catch (ePF) {}

    // 3. Chuẩn hóa tên đơn vị:
    // - Riêng DV / Admin: Tên luôn là "Đoàn UBND Tỉnh" -> [DV] Đoàn UBND Tỉnh
    // - Các đơn vị DV01..DV40: Luôn có tên đầy đủ -> [DVxx] Tên đầy đủ
    var unitInfo = resolveFullUnitInfo(unitCode, unitName);
    var unitFolder = getOrCreateFolder(periodFolder, unitInfo.folderName);
    try {
      unitFolder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    } catch (eU) {}

    var targetFolder = unitFolder;

    // 3. Chuẩn hóa tên file
    var cleanCritTitle = criterionTitle.substring(0, 35).replace(/[\/\\:*?"<>|]/g, "_");
    var timestamp = Utilities.formatDate(new Date(), "GMT+7", "yyyyMMdd_HHmmss");
    var finalFileName = unitCode + "_" + colLabel + "_" + cleanCritTitle + "_" + timestamp + "_" + originalName;
    blob.setName(finalFileName);

    var file = targetFolder.createFile(blob);
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
      folderUrl: targetFolder.getUrl ? targetFolder.getUrl() : "",
      parentFolderUrl: parentFolder.getUrl ? parentFolder.getUrl() : "",
      isCustomFolder: isCustomFolder
    });

  } catch (error) {
    return createJsonResponse({ status: "error", message: error.toString() });
  }
}

function doGet(e) {
  return createJsonResponse({
    status: "active",
    message: "Google Drive Upload & Periodic Report API cho Hệ Thống Quản Lý Tiêu Chí Đoàn 2026 đang hoạt động!"
  });
}

// =========================================================================================
// CHỨC NĂNG LẬP LỊCH TỰ ĐỘNG XUẤT EXCEL LÚC 7H SÁNG CÁC NGÀY 1, 5, 10, 15, 20, 25 HÀNG THÁNG
// =========================================================================================

/**
 * Hàm này được Trigger tự động gọi mỗi ngày lúc 7:00 sáng.
 * Chỉ chạy thực sự khi ngày rơi vào 1, 5, 10, 15, 20, 25 hàng tháng.
 */
function checkAndRunPeriodicExport() {
  var now = new Date();
  var day = parseInt(Utilities.formatDate(now, "GMT+7", "d"), 10);
  var targetDays = [1, 5, 10, 15, 20, 25];

  if (targetDays.indexOf(day) === -1) {
    Logger.log("Hôm nay là ngày " + day + ", không thuộc các ngày 1, 5, 10, 15, 20, 25. Bỏ qua không xuất.");
    return;
  }

  Logger.log("Hôm nay là ngày " + day + " (ngày xuất báo cáo định kỳ)! Đang tiến hành tạo file Excel...");
  exportScheduledExcelReport(true);
}

/**
 * Hàm xuất báo cáo Excel từ cloud_db.json và lưu vào thư mục Tháng trên Google Drive
 */
function exportScheduledExcelReport(force) {
  try {
    var now = new Date();
    var d = Utilities.formatDate(now, "GMT+7", "dd");
    var m = Utilities.formatDate(now, "GMT+7", "MM");
    var y = Utilities.formatDate(now, "GMT+7", "yyyy");
    var monthFolderName = "Tháng " + m + "-" + y;
    var excelFileName = "TongHop_Diem_Ngay_" + d + "_Thang_" + m + "_" + y + ".xlsx";

    Logger.log("Đang tải dữ liệu cloud_db.json từ đám mây...");
    var res = UrlFetchApp.fetch(CLOUD_DATA_URL, { muteHttpExceptions: true });
    if (res.getResponseCode() !== 200) {
      throw new Error("Không thể tải cloud_db.json (Mã lỗi: " + res.getResponseCode() + ")");
    }
    var db = JSON.parse(res.getContentText());

    var units = (db.units || []).filter(function(u) { return Number(u.is_active) === 1; });
    var criteria = db.criteria || [];
    var scores = db.scores || [];

    // Tạo bảng tính Google tạm thời
    var ssName = "Temp_" + excelFileName;
    var ss = SpreadsheetApp.create(ssName);

    // Map điểm (unit_id_criterion_id -> score)
    var scoreMap = {};
    for (var i = 0; i < scores.length; i++) {
      var sc = scores[i];
      scoreMap[sc.unit_id + "_" + sc.criterion_id] = sc;
    }

    // SHEET 1: BANG TONG HOP
    var sheet1 = ss.getActiveSheet();
    sheet1.setName("BANG TONG HOP");

    var row0 = ["BỘ TIÊU CHÍ ĐOÀN CẤP CƠ SỞ NĂM 2026"];
    var row1 = ["ĐƠN VỊ", "TỔNG ĐIỂM"];
    var row2 = ["", ""];
    var row3 = ["Cột 1", "Cột 2"];

    for (var c = 0; c < criteria.length; c++) {
      var crit = criteria[c];
      row1.push(crit.title || ("Tiêu chí " + crit.id));
      row2.push(crit.points_text || (crit.max_score + " đ"));
      row3.push(crit.col_label || ("Cột " + crit.id));
    }

    var sheet1Data = [row0, row1, row2, row3];

    for (var u = 0; u < units.length; u++) {
      var unit = units[u];
      var total = 0;
      var unitScores = [];
      for (var c = 0; c < criteria.length; c++) {
        var sc = scoreMap[unit.id + "_" + criteria[c].id];
        if (sc && sc.score !== null && sc.score !== "" && !isNaN(Number(sc.score))) {
          var val = Number(sc.score);
          total += val;
          unitScores.push(val);
        } else {
          unitScores.push("");
        }
      }
      total = Math.round(total * 100) / 100;
      var r = [unit.unit_name, total];
      r = r.concat(unitScores);
      sheet1Data.push(r);
    }
    setSheetValuesSafe(sheet1, sheet1Data);

    // SHEET 2: XEP HANG & THANG
    var sheet2 = ss.insertSheet("XEP HANG & THANG");

    // Tính điểm từng tháng cho mỗi đơn vị
    // Nhóm: 1..12, 13 (Cuối năm/TX), và các nhóm khác
    var monthCols = [];
    for (var mi = 1; mi <= 12; mi++) {
      monthCols.push({ key: mi, label: "Tháng " + mi });
    }
    monthCols.push({ key: 13, label: "Cuối năm / TX" });

    var rankings = [];
    for (var u = 0; u < units.length; u++) {
      var unit = units[u];
      var total = 0;
      var mScores = {};
      var reportsDone = 0;

      for (var c = 0; c < criteria.length; c++) {
        var crit = criteria[c];
        var sc = scoreMap[unit.id + "_" + crit.id];
        if (sc && sc.score !== null && sc.score !== "" && !isNaN(Number(sc.score))) {
          var val = Number(sc.score);
          total += val;
          var mg = Number(crit.month_group) || 0;
          mScores[mg] = (mScores[mg] || 0) + val;
          if (Number(crit.is_report) === 1 && val > 0) {
            reportsDone++;
          }
        }
      }
      total = Math.round(total * 100) / 100;
      rankings.push({
        unit: unit,
        total: total,
        reportsDone: reportsDone,
        mScores: mScores
      });
    }

    // Sắp xếp giảm dần theo tổng điểm
    rankings.sort(function(a, b) { return b.total - a.total; });

    var s2Header = ["HẠNG", "MÃ ĐV", "TÊN ĐƠN VỊ", "TỔNG ĐIỂM", "BC ĐÚNG HẠN"];
    for (var mIdx = 0; mIdx < monthCols.length; mIdx++) {
      s2Header.push(monthCols[mIdx].label);
    }
    var sheet2Data = [s2Header];

    for (var rk = 0; rk < rankings.length; rk++) {
      var item = rankings[rk];
      var r = [rk + 1, item.unit.unit_code, item.unit.unit_name, item.total, item.reportsDone + " / 17"];
      for (var mIdx = 0; mIdx < monthCols.length; mIdx++) {
        var key = monthCols[mIdx].key;
        var scoreVal = item.mScores[key] ? Math.round(item.mScores[key] * 100) / 100 : 0;
        r.push(scoreVal);
      }
      sheet2Data.push(r);
    }
    setSheetValuesSafe(sheet2, sheet2Data);

    // SHEET 3: THEO DOI NOP BAO CAO
    var sheet3 = ss.insertSheet("THEO DOI NOP BAO CAO");
    var reportCritList = criteria.filter(function(c) { return Number(c.is_report) === 1; });
    var s3Header = ["STT", "MÃ ĐV", "TÊN ĐƠN VỊ CƠ SỞ"];
    for (var rc = 0; rc < reportCritList.length; rc++) {
      s3Header.push(reportCritList[rc].title);
    }
    var sheet3Data = [s3Header];

    for (var u = 0; u < units.length; u++) {
      var unit = units[u];
      var r = [u + 1, unit.unit_code, unit.unit_name];
      for (var rc = 0; rc < reportCritList.length; rc++) {
        var crit = reportCritList[rc];
        var sc = scoreMap[unit.id + "_" + crit.id];
        if (sc && sc.score !== null && Number(sc.score) > 0) {
          r.push("Đã nộp (" + (sc.submitted_date || "Đúng hạn") + ")");
        } else if (sc && sc.report_content) {
          r.push("Đã nộp (Chờ duyệt)");
        } else {
          r.push("Chưa nộp");
        }
      }
      sheet3Data.push(r);
    }
    setSheetValuesSafe(sheet3, sheet3Data);

    SpreadsheetApp.flush();

    // Xuất bảng tính thành file .XLSX
    var ssId = ss.getId();
    var exportUrl = "https://docs.google.com/spreadsheets/d/" + ssId + "/export?format=xlsx";
    var exportRes = UrlFetchApp.fetch(exportUrl, {
      headers: { Authorization: "Bearer " + ScriptApp.getOAuthToken() },
      muteHttpExceptions: true
    });
    var xlsxBlob = exportRes.getBlob().setName(excelFileName);

    // Lưu vào đúng thư mục: HỒ SƠ BÁO CÁO ĐOÀN 2026 -> BÁO CÁO TỔNG HỢP EXCEL ĐỊNH KỲ -> Tháng MM-YYYY
    var rootFolder = getRootReportFolder();
    rootFolder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    var excelFolder = getOrCreateFolder(rootFolder, EXCEL_FOLDER_NAME);
    var monthFolder = getOrCreateFolder(excelFolder, monthFolderName);

    var finalFile = monthFolder.createFile(xlsxBlob);
    finalFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    // Xóa file spreadsheet tạm thời để Drive luôn sạch sẽ, chỉ giữ lại file .xlsx
    DriveApp.getFileById(ssId).setTrashed(true);

    Logger.log("✅ ĐÃ XUẤT THÀNH CÔNG VÀ LƯU VÀO GOOGLE DRIVE!");
    Logger.log("📁 Thư mục: " + ROOT_FOLDER_NAME + " / " + EXCEL_FOLDER_NAME + " / " + monthFolderName);
    Logger.log("📄 Tên file: " + excelFileName);
    Logger.log("🔗 Link xem: " + finalFile.getUrl());

    return finalFile;

  } catch (err) {
    Logger.log("❌ LỖI KHI XUẤT BÁO CÁO: " + err.toString());
    throw err;
  }
}

/**
 * HÀM CHẠY THỬ NGHIỆM: Xuất ngay 1 file Excel lưu vào Drive để kiểm tra
 */
function testExportExcelNow() {
  Logger.log("=== BẮT ĐẦU CHẠY THỬ XUẤT BÁO CÁO EXCEL VÀO DRIVE ===");
  var file = exportScheduledExcelReport(true);
  Logger.log("=== HOÀN TẤT THỬ NGHIỆM! Link: " + file.getUrl());
}

/**
 * HÀM CÀI ĐẶT BỘ KÍCH HOẠT HẸN GIỜ TỰ ĐỘNG (Chạy 1 lần duy nhất)
 * Thiết lập tự động chạy mỗi ngày lúc 7:00 sáng để kiểm tra các ngày 1, 5, 10, 15, 20, 25.
 */
function setupAutomatedTrigger() {
  var allTriggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < allTriggers.length; i++) {
    if (allTriggers[i].getHandlerFunction() === "checkAndRunPeriodicExport") {
      ScriptApp.deleteTrigger(allTriggers[i]);
    }
  }

  ScriptApp.newTrigger("checkAndRunPeriodicExport")
    .timeBased()
    .everyDays(1)
    .atHour(7)
    .create();

  Logger.log("🎉 ĐÃ CÀI ĐẶT THÀNH CÔNG BỘ HẸN GIỜ TỰ ĐỘNG!");
  Logger.log("Hệ thống sẽ tự động quét mỗi ngày lúc 7:00 sáng.");
  Logger.log("Đúng vào các ngày 1, 5, 10, 15, 20, 25 hàng tháng, file Excel sẽ tự động được tạo và đưa vào thư mục Tháng tương ứng trên Google Drive!");
}

// =========================================================================================
// TIỆN ÍCH HỖ TRỢ
// =========================================================================================

function getOrCreateFolder(parentFolder, folderName) {
  var folders = parentFolder.getFoldersByName(folderName);
  if (folders.hasNext()) {
    return folders.next();
  }
  return parentFolder.createFolder(folderName);
}

function setSheetValuesSafe(sheet, data) {
  if (!data || data.length === 0) return;
  var maxCols = 0;
  for (var r = 0; r < data.length; r++) {
    if (data[r].length > maxCols) maxCols = data[r].length;
  }
  for (var r = 0; r < data.length; r++) {
    while (data[r].length < maxCols) {
      data[r].push("");
    }
  }
  sheet.getRange(1, 1, data.length, maxCols).setValues(data);
}

function createJsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}


/**
 * HÀM SẮP XẾP & CHUẨN HÓA TOÀN BỘ THƯ MỤC GOOGLE DRIVE:
 * 1. Đổi tên toàn bộ thư mục [DV] Đơn vị -> [DV] Đoàn UBND Tỉnh
 * 2. Đổi tên [DVxx] Đơn vị -> [DVxx] Tên đầy đủ (DV01, DV02, DV09...)
 * 3. Đưa TẤT CẢ các đơn vị (kể cả DV16, DV01..DV40, DV Đoàn UBND Tỉnh) vào bên trong thư mục Tháng 10-2026!
 * 4. Nếu bên trong đơn vị có thư mục con Tháng lộn ngược (như Tháng 10 trong DV16), di chuyển file ra và xóa thư mục con thừa.
 * 
 * Có thể chạy trực tiếp từ Apps Script Editor (chọn hàm này rồi bấm Run) hoặc gọi qua Web API!
 */
function reorganizeAndStandardizeDriveFolders() {
  try {
    var rootFolder = getRootReportFolder();
    var targetPeriodFolderName = "Tháng 10-2026";
    var periodFolder = getOrCreateFolder(rootFolder, targetPeriodFolderName);
    try {
      periodFolder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    } catch (eP) {}

    var renamedCount = 0;
    var movedCount = 0;
    var cleanedSubFolders = 0;
    var logs = [];

    var subFolders = rootFolder.getFolders();
    var foldersToProcess = [];
    while (subFolders.hasNext()) {
      foldersToProcess.push(subFolders.next());
    }

    foldersToProcess.forEach(function(folder) {
      var fName = folder.getName();
      // Bỏ qua thư mục báo cáo excel và thư mục kỳ đích
      if (fName === EXCEL_FOLDER_NAME || fName === targetPeriodFolderName || fName.indexOf("BÁO CÁO") === 0) {
        return;
      }

      // Nhận diện thư mục đơn vị: [DV...] hoặc chứa DV hoặc Đơn vị
      var matchCode = fName.match(/\[(DV\d*|\d+)\]/i) || fName.match(/^(DV\d*|\d+)/i);
      var rawCode = matchCode ? matchCode[1] : "";
      if (!rawCode && (fName.indexOf("Đơn vị") > -1 || fName.indexOf("Chi đoàn") > -1 || fName.indexOf("Đoàn") > -1)) {
        var mNum = fName.match(/\d+/);
        if (mNum) rawCode = "DV" + mNum[0];
        else rawCode = "DV";
      }

      if (rawCode || fName.indexOf("[DV") > -1) {
        // 1. Chuẩn hóa tên đơn vị
        var info = resolveFullUnitInfo(rawCode, fName);
        if (fName !== info.folderName) {
          folder.setName(info.folderName);
          renamedCount++;
          logs.push("Đã đổi tên: '" + fName + "' -> '" + info.folderName + "'");
        }

        // 2. Dọn dẹp nếu bên trong có thư mục con Tháng lộn ngược (như Tháng 10-2026 trong DV16)
        var innerSubFolders = folder.getFolders();
        var innerList = [];
        while (innerSubFolders.hasNext()) {
          innerList.push(innerSubFolders.next());
        }

        innerList.forEach(function(innerF) {
          var innerName = innerF.getName();
          if (innerName.indexOf("Tháng") > -1 || innerName.indexOf("Kỳ") > -1 || innerName.indexOf("Báo cáo") > -1) {
            var innerFiles = innerF.getFiles();
            while (innerFiles.hasNext()) {
              var iFile = innerFiles.next();
              folder.addFile(iFile);
              innerF.removeFile(iFile);
            }
            innerF.setTrashed(true);
            cleanedSubFolders++;
            logs.push("Đã dọn dẹp thư mục con thừa '" + innerName + "' bên trong " + info.folderName);
          }
        });

        // 3. Di chuyển thư mục đơn vị này vào bên trong Tháng 10-2026
        periodFolder.addFolder(folder);
        rootFolder.removeFolder(folder);
        movedCount++;
        logs.push("Đã di chuyển " + info.folderName + " vào trong " + targetPeriodFolderName);
      }
    });

    // Quét thêm bên trong periodFolder để đảm bảo tên tất cả đơn vị đã vào đây đều chuẩn
    var inPeriodFolders = periodFolder.getFolders();
    while (inPeriodFolders.hasNext()) {
      var inf = inPeriodFolders.next();
      var inName = inf.getName();
      var mC = inName.match(/\[(DV\d*|\d+)\]/i);
      if (mC) {
        var rC = mC[1];
        var properInfo = resolveFullUnitInfo(rC, inName);
        if (inName !== properInfo.folderName) {
          inf.setName(properInfo.folderName);
          renamedCount++;
          logs.push("Đã chuẩn hóa tên trong kỳ: '" + inName + "' -> '" + properInfo.folderName + "'");
        }
      }
    }

    var result = {
      status: "success",
      message: "Hoàn tất! Đã đổi tên chuẩn cho " + renamedCount + " thư mục và đưa " + movedCount + " đơn vị vào bên trong " + targetPeriodFolderName + ".",
      renamedCount: renamedCount,
      movedCount: movedCount,
      cleanedSubFolders: cleanedSubFolders,
      targetFolder: targetPeriodFolderName,
      logs: logs
    };
    Logger.log(JSON.stringify(result));
    return result;
  } catch (err) {
    Logger.log("Lỗi reorganize: " + err.toString());
    return { status: "error", message: err.toString() };
  }
}
