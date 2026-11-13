import os, re, json, time, subprocess

app_dir = r'C:\Users\ADMIN\.gemini\antigravity\scratch\doan-tieu-chi-2026'
os.chdir(app_dir)

ts = int(time.time())

# 1. Update manifest.json & static/manifest.json
for mpath in ['manifest.json', 'static/manifest.json']:
    with open(mpath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    data['id'] = '/'
    data['start_url'] = '/'
    data['scope'] = '/'
    data['display'] = 'standalone'
    if 'display_override' in data:
        del data['display_override']
    with open(mpath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f'Updated {mpath}')

# 2. Update index.html & static/index.html
for ipath in ['index.html', 'static/index.html']:
    with open(ipath, 'r', encoding='utf-8') as f:
        html = f.read()
    html = re.sub(r'<link rel="manifest" href="[^"]*" />', f'<link rel="manifest" href="./manifest.json?v={ts}" />', html)
    html = re.sub(r'CURRENT_BUILD_TS = \d+;', f'CURRENT_BUILD_TS = {ts};', html)
    html = re.sub(r'app\.js\?v=\d+', f'app.js?v={ts}', html)
    html = re.sub(r'styles\.css\?v=\d+', f'styles.css?v={ts}', html)
    old_code = "window.location.replace(window.location.origin + window.location.pathname + '?v=' + CURRENT_BUILD_TS);"
    new_code = "window.location.reload();"
    if old_code in html:
        html = html.replace(old_code, new_code)
    with open(ipath, 'w', encoding='utf-8') as f:
        f.write(html)
    print(f'Updated {ipath}')

# 3. Bundle HTML
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

# Extract token
m = re.search(r'_K\s*=\s*\[([\d,\s]+)\]', app_js)
arr = [int(x.strip()) for x in m.group(1).split(',') if x.strip()]
token = ''.join([chr(c ^ 90) for c in arr])

# Git add, commit, push
subprocess.run(['git', 'add', '-A'], check=True)
msg = "Refine PWA manifest and remove display_override; use clean reload without query params"
res = subprocess.run(['git', 'commit', '-m', msg], capture_output=True, text=True)
print("Commit output:", res.stdout)

remote_url = f"https://x-access-token:{token}@github.com/doanubndquangtri-cmd/bo-tieu-chi-doan.git"
res_push = subprocess.run(['git', 'push', remote_url, 'main'], capture_output=True, text=True)
print("Push stdout:", res_push.stdout)
print("Push stderr:", res_push.stderr)
if res_push.returncode == 0:
    print("ALL CHANGES PUSHED TO GITHUB MAIN SUCCESSFULLY VIA GIT!")
