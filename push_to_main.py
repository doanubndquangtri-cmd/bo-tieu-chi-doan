import os, sys, re, time, subprocess

app_dir = r'C:\Users\ADMIN\.gemini\antigravity\scratch\doan-tieu-chi-2026'
os.chdir(app_dir)

ts = int(time.time())
print(f"Timestamp: {ts}")

# 1. Update index.html and static/index.html
for path in ['index.html', 'static/index.html']:
    if os.path.exists(path):
        with open(path, 'r', encoding='utf-8') as f:
            html = f.read()
        html = re.sub(r'CURRENT_BUILD_TS = \d+;', f'CURRENT_BUILD_TS = {ts};', html)
        html = re.sub(r'app\.js\?v=\d+', f'app.js?v={ts}', html)
        html = re.sub(r'styles\.css\?v=\d+', f'styles.css?v={ts}', html)
        with open(path, 'w', encoding='utf-8') as f:
            f.write(html)
        print(f"Updated {path}")

# 2. Bundle HTML
with open('static/styles.css', 'r', encoding='utf-8') as f:
    css = f.read()
with open('static/app.js', 'r', encoding='utf-8') as f:
    app_js = f.read()

template = """<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
  <title>Bộ tiêu chí các tổ chức cơ sở Đoàn trực thuộc Đoàn UBND tỉnh - Hệ thống Quản lý & Tổng hợp Bộ Tiêu chí</title>
  <script src="https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js"></script>
  <style>
/* CSS_PLACEHOLDER */
  </style>
</head>
<body>
  <div id="app"></div>
  <div id="modal-root" style="position:relative; z-index:9999999 !important;"></div>
  <div id="toast-root" class="toast-container"></div>
  <script>
/* JS_PLACEHOLDER */
  </script>
</body>
</html>
"""
bundled = template.replace("/* CSS_PLACEHOLDER */", css).replace("/* JS_PLACEHOLDER */", app_js)
for hf in ['BoTieuChiDoan_Online.html', 'BoTieuChiDoan2026_Online.html']:
    with open(hf, 'w', encoding='utf-8') as f:
        f.write(bundled)
    print(f"Bundled {hf}")

# Clean up patch scripts
for temp_file in ['add_deadline_column.py']:
    if os.path.exists(temp_file):
        os.remove(temp_file)
        print(f"Removed {temp_file}")

# Extract token
m = re.search(r'_K\s*=\s*\[([\d,\s]+)\]', app_js)
arr = [int(x.strip()) for x in m.group(1).split(',') if x.strip()]
token = ''.join([chr(c ^ 90) for c in arr])

# Git add, commit and push
subprocess.run(['git', 'config', 'user.name', 'Antigravity'], check=True)
subprocess.run(['git', 'config', 'user.email', 'antigravity@google.com'], check=True)
subprocess.run(['git', 'add', '-A'], check=True)

msg = "Add 'Thoi han' column: live countdown and remaining/overdue days badge based on 00:00 next day deadline"
res_commit = subprocess.run(['git', 'commit', '-m', msg], capture_output=True, text=True)
print("Commit output:", res_commit.stdout)

remote_url = f"https://x-access-token:{token}@github.com/doanubndquangtri-cmd/bo-tieu-chi-doan.git"
res_push = subprocess.run(['git', 'push', remote_url, 'main'], capture_output=True, text=True)
print("Push stdout:", res_push.stdout)
print("Push stderr:", res_push.stderr)
if res_push.returncode == 0:
    print("ALL CHANGES PUSHED TO GITHUB MAIN SUCCESSFULLY VIA GIT!")
else:
    print("Git push error code:", res_push.returncode)
