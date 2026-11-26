import asyncio
import json
import os
import sys
import fb_checker

try:
    from fastapi import FastAPI, Response
    from fastapi.middleware.cors import CORSMiddleware
    from fastapi.responses import JSONResponse, StreamingResponse
    import uvicorn
    USE_FASTAPI = True
except ImportError:
    USE_FASTAPI = False

if USE_FASTAPI:
    app = FastAPI(title="Facebook Link Auditor Service", version="1.0.0")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/api/ping")
    def ping():
        return {"status": "ok", "service": "fb-checker", "version": "1.0.0"}

    @app.post("/api/fb-check/stream")
    async def fb_check_stream_endpoint(payload: dict):
        links = [str(x).strip() for x in (payload.get("links") or []) if str(x).strip()]
        required_keywords = payload.get("required_keywords") or []
        keyword_mode = payload.get("keyword_mode", "any")
        require_public = bool(payload.get("require_public", True))
        date_from = str(payload.get("date_from") or "").strip()
        date_to = str(payload.get("date_to") or "").strip()
        delay_ms = max(0, min(5000, int(payload.get("delay_ms", 500))))

        async def event_gen():
            total = len(links)
            for idx, url in enumerate(links, start=1):
                res = await asyncio.to_thread(
                    fb_checker.check_single_fb_link,
                    url,
                    required_keywords,
                    keyword_mode,
                    require_public,
                    date_from,
                    date_to,
                )
                yield f"data: {json.dumps({'type': 'item', 'index': idx, 'total': total, 'data': res}, ensure_ascii=False)}\n\n"
                if idx < total and delay_ms > 0:
                    await asyncio.sleep(delay_ms / 1000.0)
            yield f"data: {json.dumps({'type': 'done', 'total': total})}\n\n"

        return StreamingResponse(event_gen(), media_type="text/event-stream")

    @app.post("/api/fb-check/export")
    def fb_check_export_endpoint(payload: dict):
        rows = payload.get("rows") or []
        criteria_note = str(payload.get("criteria_note") or "")
        xlsx_bytes = fb_checker.export_results_to_excel(rows, criteria_note=criteria_note)
        return Response(
            content=xlsx_bytes,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": 'attachment; filename="Bao_Cao_Tham_Dinh_Link_FB.xlsx"'},
        )

def main():
    port = int(os.environ.get("PORT", 8000))
    print("=" * 60)
    print("   MÁY CHỦ THẨM ĐỊNH LINK FACEBOOK - BỘ TIÊU CHÍ ĐOÀN")
    print(f"   Đang chạy tại: http://127.0.0.1:{port}")
    print("=" * 60)
    if USE_FASTAPI:
        uvicorn.run(app, host="0.0.0.0", port=port)
    else:
        print("[!] Vui lòng cài đặt fastapi và uvicorn: pip install fastapi uvicorn")

if __name__ == "__main__":
    main()
