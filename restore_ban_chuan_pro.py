# -*- coding: utf-8 -*-
"""
Script khôi phục nhanh về BẢN CHUẨN PRO
"""
import shutil, os, subprocess

print("Đang khôi phục về BẢN CHUẨN PRO...")

if os.path.exists("backup_pro_app.js"):
    shutil.copy2("backup_pro_app.js", "static/app.js")
    print("-> Đã phục hồi static/app.js")

if os.path.exists("backup_pro_styles.css"):
    shutil.copy2("backup_pro_styles.css", "static/styles.css")
    print("-> Đã phục hồi static/styles.css")

print("Đang đồng bộ và xuất bản lên GitHub Pages...")
subprocess.run(["python", "push_all_clean.py"])
print("KHÔI PHỤC BẢN CHUẨN PRO THÀNH CÔNG!")
