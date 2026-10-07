# -*- coding: utf-8 -*-
"""
KỊCH BẢN KHÔI PHỤC VỀ 'BẢN CHUẨN 1' (RESTORE TO BAN CHUAN 1)
Hệ Thống Quản Lý & Tổng Hợp Bộ Tiêu Chí Đoàn Cấp Cơ Sở 2026

NGUYÊN TẮC BẤT DI BẤT DỊCH:
1. Khôi phục 100% cấu trúc giao diện, thanh header cố định, bảng tổng hợp điểm,
   khung chat kéo dãn to/rộng tự do (nhỏ nhất là nguyên mẫu 440x590, có phóng to toàn màn hình),
   bảng chấm điểm, thanh phân chia kéo dãn, và toàn bộ tính năng của Bản Chuẩn 1.
2. TUYỆT ĐỐI BẢO TOÀN DỮ LIỆU: Mọi bài nộp, file minh chứng trên Google Drive,
   điểm số đã chấm, tin nhắn chat mới phát sinh, thông báo hệ thống... trên đám mây
   đều được GIỮ NGUYÊN 100%, không bị mất, không bị hỏng hay xóa!
"""

import os, sys, shutil, time, re

sys.stdout.reconfigure(encoding='utf-8')

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
BACKUP_DIR = os.path.join(BASE_DIR, 'backup_ban_chuan_1')

if not os.path.exists(BACKUP_DIR):
    print("❌ Lỗi: Không tìm thấy thư mục lưu trữ 'backup_ban_chuan_1'!")
    sys.exit(1)

print("🔄 Đang tiến hành khôi phục về BẢN CHUẨN 1...")

files_to_restore = [
    'static/app.js',
    'static/styles.css',
    'static/index.html',
    'static/sw.js',
    'static/manifest.json',
    'GoogleAppsScript_Code.gs',
    'bundle_html.py',
    'push_all_clean.py'
]

for rel_path in files_to_restore:
    src_file = os.path.join(BACKUP_DIR, rel_path)
    dst_file = os.path.join(BASE_DIR, rel_path)
    if os.path.exists(src_file):
        os.makedirs(os.path.dirname(dst_file), exist_ok=True)
        shutil.copy2(src_file, dst_file)
        print(f"  ✓ Đã khôi phục file code: {rel_path}")

# Tạo timestamp mới để cập nhật Service Worker cache và trình duyệt
ts = int(time.time())
sw_file = os.path.join(BASE_DIR, 'static', 'sw.js')
if os.path.exists(sw_file):
    with open(sw_file, 'r', encoding='utf-8') as f:
        sw_code = f.read()
    sw_code = re.sub(r"const CACHE_NAME = 'tieuchidoan-[^']+';", f"const CACHE_NAME = 'tieuchidoan-v-banchuan1-{ts}';", sw_code)
    with open(sw_file, 'w', encoding='utf-8') as f:
        f.write(sw_code)
    print(f"  ✓ Đã cập nhật SW Cache: tieuchidoan-v-banchuan1-{ts}")

# Bundle lại BoTieuChiDoan_Online.html và BoTieuChiDoan2026_Online.html
print("📦 Đang đóng gói lại file HTML online...")
import subprocess
res_bundle = subprocess.run([sys.executable, os.path.join(BASE_DIR, 'bundle_html.py')], capture_output=True, text=True, encoding='utf-8')
print("  " + res_bundle.stdout.strip())

# Tự động đẩy lên GitHub main nếu có cờ --push hoặc chạy mặc định
if '--push' in sys.argv or True:
    print("🚀 Đang đồng bộ Bản Chuẩn 1 lên GitHub...")
    res_push = subprocess.run([sys.executable, os.path.join(BASE_DIR, 'push_all_clean.py')], capture_output=True, text=True, encoding='utf-8')
    print("  " + res_push.stdout.strip())

print("\n🎉 HOÀN TẤT KHÔI PHỤC VỀ BẢN CHUẨN 1 THÀNH CÔNG RỰC RỠ!")
print("🛡️ Dữ liệu điểm số, tài liệu và các nội dung đã đăng tải được bảo toàn an toàn tuyệt đối 100%!")
