import io
import re
import time
import urllib.parse
from datetime import datetime
from typing import Any, Dict, List, Optional

import requests
from bs4 import BeautifulSoup


FB_DOMAINS = ("facebook.com", "fb.com", "fb.watch")


def is_facebook_url(url: str) -> bool:
    try:
        parsed = urllib.parse.urlparse(url.strip())
        host = (parsed.netloc or "").lower()
        return any(host == d or host.endswith("." + d) for d in FB_DOMAINS)
    except Exception:
        return False


def extract_account_id(url: str, canonical_url: str = "") -> str:
    for candidate in (canonical_url, url):
        if not candidate:
            continue
        parsed = urllib.parse.urlparse(candidate)
        qs = urllib.parse.parse_qs(parsed.query)
        if "id" in qs and qs["id"]:
            return qs["id"][0]
        m = re.search(r"facebook\.com/(?:people/[^/]+/)?([A-Za-z0-9._-]+)/(?:posts|videos|photos|reel)", candidate)
        if m and m.group(1) not in ("story.php", "permalink.php", "watch", "share"):
            return m.group(1)
        m2 = re.search(r"facebook\.com/([A-Za-z0-9._-]+)$", candidate.rstrip("/"))
        if m2 and m2.group(1) not in ("story.php", "permalink.php", "watch", "share"):
            return m2.group(1)
    return ""


def extract_post_dates(text: str) -> List[str]:
    if not text:
        return []
    found: List[str] = []
    for m in re.finditer(r"\b(\d{1,2})[/-](\d{1,2})[/-](20\d{2})\b", text):
        d, mo, y = int(m.group(1)), int(m.group(2)), int(m.group(3))
        if 1 <= d <= 31 and 1 <= mo <= 12:
            found.append(f"{d:02d}/{mo:02d}/{y}")
    if not found:
        for m in re.finditer(r"\bng[aà]y\s+(\d{1,2})\s+th[aá]ng\s+(\d{1,2})(?:\s+n[aă]m\s+(20\d{2}))?\b", text, re.IGNORECASE):
            d, mo = int(m.group(1)), int(m.group(2))
            y = m.group(3)
            if 1 <= d <= 31 and 1 <= mo <= 12:
                found.append(f"{d:02d}/{mo:02d}/{y}" if y else f"{d:02d}/{mo:02d}")
    return found


def _parse_vn_date(date_str: str) -> Optional[datetime]:
    for fmt in ("%d/%m/%Y", "%Y-%m-%d"):
        try:
            return datetime.strptime(date_str.strip(), fmt)
        except Exception:
            continue
    return None


def fetch_facebook_via_embed(raw_url: str) -> Optional[Dict[str, Any]]:
    """
    Sử dụng endpoint Meta Embed chính thức (plugins/post.php & plugins/video.php)
    để giải mã nội dung bài viết công khai, tác giả và ngày đăng ngay cả khi IP server
    bị Facebook chuyển hướng về trang /login/.
    """
    clean_ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    headers = {
        "User-Agent": clean_ua,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "vi-VN,vi;q=0.9,en;q=0.8",
    }
    endpoints = [
        f"https://www.facebook.com/plugins/post.php?href={urllib.parse.quote(raw_url, safe='')}",
        f"https://www.facebook.com/plugins/video.php?href={urllib.parse.quote(raw_url, safe='')}",
    ]
    for ep in endpoints:
        try:
            r = requests.get(ep, headers=headers, timeout=10)
            if r.status_code != 200 or len(r.text) < 500:
                continue
            soup = BeautifulSoup(r.text, "html.parser")
            full_text = soup.get_text(" ", strip=True)
            if any(k in full_text.lower() for k in [
                "nội dung này hiện không khả dụng",
                "this content isn't available",
                "liên kết bạn đã theo dõi có thể bị hỏng",
                "trang này không tồn tại",
                "rất tiếc, đã xảy ra lỗi",
                "sorry, something went wrong",
            ]):
                return {"visibility": "Riêng tư / Yêu cầu đăng nhập", "content": "", "author": "", "image": ""}

            paragraphs = [p.get_text(" ", strip=True) for p in soup.find_all("p") if p.get_text(" ", strip=True)]
            
            author = ""
            m_author = re.search(r"Facebook\s+([^\n·•]+?)(?:\s+vào|\s+đã|\s+chia sẻ|\s+·|\s+\d+\s+người)", full_text)
            if m_author:
                author = m_author.group(1).strip()
            if not author:
                for a in soup.find_all("a"):
                    t = a.get_text(strip=True)
                    if t and len(t) > 2 and t.lower() not in ["facebook", "help", "trợ giúp", "xem thêm", "chia sẻ", "go back"]:
                        author = t
                        break

            # Tìm ảnh bài đăng
            img_src = ""
            for img in soup.find_all("img"):
                src = img.get("src", "")
                if src and ("fbcdn" in src or "fbsbx" in src) and not any(k in src.lower() for k in ["emoji", "static", "rsrc.php"]):
                    img_src = src
                    break

            content = "\n\n".join(paragraphs) if paragraphs else ""
            if not content:
                clean_lines = [l.strip() for l in soup.get_text("\n", strip=True).split("\n") if len(l.strip()) > 30 and "facebook" not in l.lower()]
                content = "\n\n".join(clean_lines[:6])

            if content:
                return {
                    "visibility": "Công khai",
                    "account_name": author,
                    "content": content,
                    "image": img_src,
                }
        except Exception:
            pass
    return None


def check_single_fb_link(
    url: str,
    required_keywords: Optional[List[str]] = None,
    keyword_mode: str = "any",
    require_public: bool = True,
    date_from: str = "",
    date_to: str = "",
) -> Dict[str, Any]:
    raw_url = (url or "").strip()
    if not raw_url:
        return {
            "url": raw_url,
            "canonical_url": "",
            "account_name": "",
            "account_id": "",
            "visibility": "Link trống",
            "post_date": "",
            "content": "",
            "image": "",
            "is_valid": False,
            "status_label": "Không hợp lệ",
            "reason": "Đường dẫn trống",
        }

    if not raw_url.startswith(("http://", "https://")):
        raw_url = "https://" + raw_url

    if not is_facebook_url(raw_url):
        return {
            "url": raw_url,
            "canonical_url": "",
            "account_name": "",
            "account_id": "",
            "visibility": "Không phải Facebook",
            "post_date": "",
            "content": "",
            "image": "",
            "is_valid": False,
            "status_label": "Không hợp lệ",
            "reason": "Không phải đường dẫn Facebook hợp lệ",
        }

    user_agents = [
        "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "WhatsApp/2.21.12.21 A",
        "Twitterbot/1.0",
    ]

    res = None
    last_err = ""
    for ua in user_agents:
        try:
            r = requests.get(
                raw_url,
                headers={
                    "User-Agent": ua,
                    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                    "Accept-Language": "vi-VN,vi;q=0.9,en;q=0.8",
                },
                timeout=10,
                allow_redirects=True,
            )
            if r.status_code == 200 and len(r.content) > 200:
                res = r
                break
            last_err = f"HTTP {r.status_code}"
        except Exception as exc:
            last_err = str(exc)

    if res is None:
        # Thử fallback qua Embed API trước khi báo lỗi
        embed_data = fetch_facebook_via_embed(raw_url)
        if not embed_data:
            return {
                "url": raw_url,
                "canonical_url": "",
                "account_name": "",
                "account_id": extract_account_id(raw_url),
                "visibility": "Link lỗi / Không truy cập được",
                "post_date": "",
                "content": "",
                "image": "",
                "is_valid": False,
                "status_label": "Không hợp lệ",
                "reason": f"Không thể truy cập liên kết ({last_err or 'timeout'})",
            }

    soup = BeautifulSoup(res.content, "html.parser") if res else None

    def _meta(prop_name: str) -> str:
        if not soup:
            return ""
        tag = soup.find("meta", attrs={"property": prop_name}) or soup.find("meta", attrs={"name": prop_name})
        return (tag.get("content") or "").strip() if tag else ""

    og_title = _meta("og:title")
    og_desc = _meta("og:description") or _meta("description")
    og_url = _meta("og:url") or (res.url if res else raw_url)
    og_image = _meta("og:image")
    page_title = soup.title.string.strip() if (soup and soup.title and soup.title.string) else ""

    account_name = og_title or page_title
    content_text = og_desc
    account_id = extract_account_id(raw_url, og_url)

    final_url_low = ((res.url if res else "") or "").lower()
    login_blocked = (
        "/login" in final_url_low
        or "checkpoint" in final_url_low
        or account_name.lower() in ("", "facebook", "log in or sign up", "đăng nhập hoặc đăng ký", "log into facebook")
        and not content_text
    )

    # NẾU BỊ ĐIỀU HƯỚNG VỀ LOGIN HOẶC CHƯA LẤY ĐƯỢC NỘI DUNG: DÙNG EMBED META FALLBACK
    if login_blocked or not content_text:
        embed_data = fetch_facebook_via_embed(raw_url)
        if embed_data:
            if embed_data.get("visibility") == "Công khai" and embed_data.get("content"):
                login_blocked = False
                content_text = embed_data["content"]
                if embed_data.get("account_name"):
                    account_name = embed_data["account_name"]
                if embed_data.get("image") and not og_image:
                    og_image = embed_data["image"]
            elif embed_data.get("visibility") == "Riêng tư / Yêu cầu đăng nhập":
                login_blocked = True

    if login_blocked:
        visibility = "Riêng tư / Yêu cầu đăng nhập"
        account_name = "" if account_name.lower() in ("facebook", "log into facebook", "log in or sign up") else account_name
    elif content_text or (account_name and account_name.lower() != "facebook"):
        visibility = "Công khai"
    else:
        visibility = "Không đọc được nội dung"

    dates_found = extract_post_dates(content_text)
    post_date = dates_found[0] if dates_found else ""

    reasons: List[str] = []
    if require_public and visibility != "Công khai":
        reasons.append(f"Trạng thái '{visibility}' (chưa mở Công khai)")

    clean_kws = [k.strip().lower() for k in (required_keywords or []) if k.strip()]
    if clean_kws:
        haystack = f"{account_name} {content_text}".lower()
        matched = [k for k in clean_kws if k in haystack]
        if keyword_mode == "all":
            missing = [k for k in clean_kws if k not in haystack]
            if missing:
                reasons.append(f"Thiếu từ khóa bắt buộc: {', '.join(missing)}")
        else:
            if not matched:
                reasons.append(f"Không khớp từ khóa tiêu chí ({', '.join(clean_kws)})")

    if (date_from or date_to) and post_date:
        parsed_post = _parse_vn_date(post_date)
        if parsed_post:
            d_from = _parse_vn_date(date_from) if date_from else None
            d_to = _parse_vn_date(date_to) if date_to else None
            if d_from and parsed_post < d_from:
                reasons.append(f"Ngày {post_date} trước mốc {date_from}")
            if d_to and parsed_post > d_to:
                reasons.append(f"Ngày {post_date} sau mốc {date_to}")

    is_valid = len(reasons) == 0
    return {
        "url": raw_url,
        "canonical_url": og_url,
        "account_name": account_name or "(Không xác định)",
        "account_id": account_id,
        "visibility": visibility,
        "post_date": post_date or "(Không ghi trong bài)",
        "content": content_text or "(Không có nội dung hiển thị công khai)",
        "image": og_image,
        "is_valid": is_valid,
        "status_label": "Hợp lệ" if is_valid else "Không hợp lệ",
        "reason": "Đạt đủ tiêu chí kiểm tra" if is_valid else "; ".join(reasons),
    }


def export_results_to_excel(rows: List[Dict[str, Any]], criteria_note: str = "") -> bytes:
    import openpyxl
    from openpyxl.styles import Alignment, Border, Font, PatternFill, Side

    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "ThamDinhLinkFB"

    thin = Side(border_style="thin", color="CBD5E1")
    border = Border(left=thin, right=thin, top=thin, bottom=thin)

    ws.merge_cells("A1:I1")
    ws["A1"] = "BÁO CÁO KIỂM TRA & THẨM ĐỊNH LINK MINH CHỨNG FACEBOOK"
    ws["A1"].font = Font(name="Calibri", size=14, bold=True, color="FFFFFF")
    ws["A1"].fill = PatternFill("solid", fgColor="1E3A8A")
    ws["A1"].alignment = Alignment(horizontal="center", vertical="center")
    ws.row_dimensions[1].height = 30

    if criteria_note:
        ws.merge_cells("A2:I2")
        ws["A2"] = f"Tiêu chí áp dụng: {criteria_note} | Thời gian xuất: {datetime.now().strftime('%d/%m/%Y %H:%M')}"
        ws["A2"].font = Font(name="Calibri", size=10, italic=True, color="334155")
        ws["A2"].alignment = Alignment(horizontal="left", vertical="center")
        ws.row_dimensions[2].height = 20
        header_row = 3
    else:
        header_row = 2

    headers = [
        "STT",
        "Link Facebook gốc",
        "Chủ tài khoản Facebook",
        "ID Tài khoản",
        "Trạng thái hiển thị",
        "Thời gian ghi nhận",
        "Nội dung bài đăng",
        "Kết luận",
        "Lý do / Ghi chú",
    ]
    header_fill = PatternFill("solid", fgColor="2563EB")
    header_font = Font(name="Calibri", size=11, bold=True, color="FFFFFF")

    for col_idx, h in enumerate(headers, start=1):
        cell = ws.cell(row=header_row, column=col_idx, value=h)
        cell.fill = header_fill
        cell.font = header_font
        cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
        cell.border = border
    ws.row_dimensions[header_row].height = 26

    green_fill = PatternFill("solid", fgColor="DCFCE7")
    green_font = Font(name="Calibri", size=11, bold=True, color="166534")
    red_fill = PatternFill("solid", fgColor="FEE2E2")
    red_font = Font(name="Calibri", size=11, bold=True, color="991B1B")

    for idx, r in enumerate(rows, start=1):
        row_num = header_row + idx
        vals = [
            idx,
            r.get("url", ""),
            r.get("account_name", ""),
            r.get("account_id", ""),
            r.get("visibility", ""),
            r.get("post_date", ""),
            r.get("content", ""),
            r.get("status_label", ""),
            r.get("reason", ""),
        ]
        for col_idx, v in enumerate(vals, start=1):
            c = ws.cell(row=row_num, column=col_idx, value=v)
            c.font = Font(name="Calibri", size=10.5)
            c.border = border
            c.alignment = Alignment(
                horizontal="center" if col_idx in (1, 4, 5, 6, 8) else "left",
                vertical="top",
                wrap_text=True,
            )
            if col_idx == 8:
                if r.get("is_valid"):
                    c.fill = green_fill
                    c.font = green_font
                else:
                    c.fill = red_fill
                    c.font = red_font

    widths = [6, 38, 24, 18, 22, 18, 52, 16, 34]
    for col_idx, w in enumerate(widths, start=1):
        col_letter = openpyxl.utils.get_column_letter(col_idx)
        ws.column_dimensions[col_letter].width = w

    buf = io.BytesIO()
    wb.save(buf)
    return buf.getvalue()
