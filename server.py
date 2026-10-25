"""
FastAPI Server for Photo & Signature Resizer Tool
(Pure Algorithmic Engine - Direct KB Input, Native Save As, JPEG & PDF Support)
"""

import io
import os
import sys
import uuid
import json
from typing import Optional
import cv2
from PIL import Image
from fastapi import FastAPI, File, UploadFile, Form, HTTPException, Query
from fastapi.responses import HTMLResponse, StreamingResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

import processor

app = FastAPI(title="Photo & Sign Resizer Tool")

if getattr(sys, "frozen", False):
    BASE_DIR = getattr(sys, "_MEIPASS", os.path.dirname(sys.executable))
else:
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))

STATIC_DIR = os.path.join(BASE_DIR, "static")

# Temporary memory cache for downloads
CACHE = {}

app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


@app.get("/", response_class=HTMLResponse)
async def serve_index():
    index_path = os.path.join(STATIC_DIR, "index.html")
    if os.path.exists(index_path):
        with open(index_path, "r", encoding="utf-8") as f:
            return f.read()
    return "<h1>E-Mitra Photo Resizer</h1><p>Static index.html not found.</p>"


@app.post("/api/process")
async def process_image(
    file: UploadFile = File(...),
    preset_id: str = Form("general"),
    mode: str = Form("photo"),
    add_date_stamp: bool = Form(False),
    candidate_name: str = Form(""),
    photo_date: str = Form(""),
    photo_target_kb: Optional[float] = Form(50.0),
    sign_target_kb: Optional[float] = Form(20.0),
    angle: int = Form(0),
    brightness: int = Form(0),
    contrast: int = Form(0),
    bg_color: str = Form("original"),
    custom_boxes_json: Optional[str] = Form(None)
):
    try:
        content = await file.read()
        if len(content) == 0:
            raise HTTPException(status_code=400, detail="Empty file uploaded")

        custom_photo_box = None
        custom_sign_box = None
        if custom_boxes_json:
            try:
                boxes = json.loads(custom_boxes_json)
                custom_photo_box = boxes.get("photo")
                custom_sign_box = boxes.get("sign")
            except Exception:
                pass

        result = processor.process_image_pipeline(
            image_bytes=content,
            preset_id=preset_id,
            candidate_name=candidate_name,
            photo_date=photo_date,
            add_date_stamp=add_date_stamp,
            mode=mode,
            custom_photo_box=custom_photo_box,
            custom_sign_box=custom_sign_box,
            photo_user_kb=photo_target_kb,
            sign_user_kb=sign_target_kb,
            angle=angle,
            brightness=brightness,
            contrast=contrast,
            bg_color=bg_color
        )

        token = str(uuid.uuid4())
        CACHE[token] = {
            "photo": result["photo"]["raw_bytes"] if result["photo"] else None,
            "sign": result["sign"]["raw_bytes"] if result["sign"] else None,
        }

        if len(CACHE) > 50:
            oldest_key = next(iter(CACHE))
            del CACHE[oldest_key]

        if result["photo"]:
            del result["photo"]["raw_bytes"]
            result["photo"]["download_url"] = f"/api/download/{token}/photo"

        if result["sign"]:
            del result["sign"]["raw_bytes"]
            item_tag = "thumb" if mode == "thumb" else "sign"
            result["sign"]["download_url"] = f"/api/download/{token}/{item_tag}"

        result["token"] = token
        return JSONResponse(result)

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/process-document")
async def process_document_endpoint(
    file1: UploadFile = File(...),
    file2: Optional[UploadFile] = File(None),
    doc_mode: str = Form("single"),
    target_kb: float = Form(150.0),
    doc_format: str = Form("pdf"),
    doc_name: str = Form("marksheet"),
    brightness: int = Form(0),
    contrast: int = Form(0)
):
    try:
        content1 = await file1.read()
        if len(content1) == 0:
            raise HTTPException(status_code=400, detail="Empty primary document uploaded")

        content2 = None
        if file2:
            c2 = await file2.read()
            if len(c2) > 0:
                content2 = c2

        result = processor.process_document_pipeline(
            file1_bytes=content1,
            file2_bytes=content2,
            mode=doc_mode,
            target_kb=target_kb,
            doc_format=doc_format,
            brightness=brightness,
            contrast=contrast
        )

        token = str(uuid.uuid4())
        CACHE[token] = {
            "doc": result["raw_bytes"],
            "format": result["format"]
        }

        if len(CACHE) > 50:
            oldest_key = next(iter(CACHE))
            del CACHE[oldest_key]

        return JSONResponse({
            "token": token,
            "data_url": result["data_url"],
            "size_kb": result["size_kb"],
            "format": result["format"],
            "download_url": f"/api/download/{token}/doc?name={doc_name}&format={result['format']}"
        })

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/render-preview")
async def render_preview_endpoint(file: UploadFile = File(...)):
    """Accepts any image or PDF and returns an instant base64 JPEG data URL for browser display."""
    try:
        content = await file.read()
        img = processor.load_image(content)
        if img is None:
            raise HTTPException(status_code=400, detail="Invalid image or PDF file")
        h, w, _ = img.shape
        max_d = 1200
        if max(h, w) > max_d:
            s = max_d / float(max(h, w))
            img = cv2.resize(img, (int(w * s), int(h * s)), interpolation=cv2.INTER_AREA)
        _, buf = cv2.imencode(".jpg", img, [cv2.IMWRITE_JPEG_QUALITY, 85])
        return JSONResponse({
            "status": "ok",
            "data_url": processor.to_base64_data_url(buf.tobytes()),
            "width": img.shape[1],
            "height": img.shape[0]
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/download/{token}/{item_type}")
async def download_file(token: str, item_type: str, name: str = Query("ramesh"), format: str = Query("jpeg")):
    if token not in CACHE:
        raise HTTPException(status_code=404, detail="File expired or not found")

    cache_item = "sign" if item_type == "thumb" else item_type
    data = CACHE[token].get(cache_item)
    if not data:
        raise HTTPException(status_code=404, detail=f"No {item_type} found in session")

    # Sanitize name
    clean_name = "".join(c for c in name if c.isalnum() or c in ("-", "_")).strip().lower()
    if not clean_name:
        clean_name = "image"

    tag_map = {
        "photo": "photo",
        "sign": "sig",
        "thumb": "thumb",
        "doc": "doc",
        "sheet": "sheet"
    }
    tag = tag_map.get(item_type, item_type)

    # Handle PDF format
    if format.lower() == "pdf":
        try:
            # If the cached data is already PDF (from process_document_pipeline)
            if data[:4] == b"%PDF":
                pdf_bytes = data
            else:
                pil_img = Image.open(io.BytesIO(data))
                if pil_img.mode != "RGB":
                    pil_img = pil_img.convert("RGB")
                pdf_buf = io.BytesIO()
                pil_img.save(pdf_buf, format="PDF", resolution=150.0)
                pdf_bytes = pdf_buf.getvalue()

            filename = f"{clean_name}.{tag}.pdf"
            return StreamingResponse(
                io.BytesIO(pdf_bytes),
                media_type="application/pdf",
                headers={"Content-Disposition": f'attachment; filename="{filename}"'}
            )
        except Exception as e:
            print("Error converting to PDF:", e)

    # Default: JPEG format
    # If cached data is PDF but JPG requested, or already JPEG
    filename = f"{clean_name}.{tag}.jpg"
    return StreamingResponse(
        io.BytesIO(data),
        media_type="image/jpeg",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )


def _launch_and_resize_whatsapp_thread():
    """Background worker to launch WhatsApp and snap it to compact left half."""
    try:
        import subprocess
        import time
        import ctypes
        from ctypes import wintypes

        # Launch native WhatsApp Desktop app
        subprocess.Popen(["cmd.exe", "/c", "start", "whatsapp:"], shell=True)

        user32 = ctypes.windll.user32
        SW_RESTORE = 9
        SWP_SHOWWINDOW = 0x0040

        screen_w = user32.GetSystemMetrics(0)
        screen_h = user32.GetSystemMetrics(1)
        compact_w = max(450, int(screen_w * 0.42))

        for _ in range(12):
            time.sleep(0.25)
            hwnds = []

            def enum_cb(h, _):
                if user32.IsWindowVisible(h):
                    length = user32.GetWindowTextLengthW(h)
                    if length > 0:
                        buff = ctypes.create_unicode_buffer(length + 1)
                        user32.GetWindowTextW(h, buff, length + 1)
                        if "whatsapp" in buff.value.lower():
                            hwnds.append(h)
                return True

            WNDENUMPROC = ctypes.WINFUNCTYPE(wintypes.BOOL, wintypes.HWND, wintypes.LPARAM)
            user32.EnumWindows(WNDENUMPROC(enum_cb), 0)

            if hwnds:
                for h in hwnds:
                    user32.ShowWindow(h, SW_RESTORE)
                    user32.SetWindowPos(h, 0, 0, 0, compact_w, screen_h, SWP_SHOWWINDOW)
                    user32.SetForegroundWindow(h)
                break
    except Exception as e:
        print("Auto resize WhatsApp error:", e)


@app.post("/api/open-whatsapp")
async def open_whatsapp_native():
    """Instantly launches native WhatsApp Desktop app and automatically sizes it to left side."""
    try:
        import threading
        threading.Thread(target=_launch_and_resize_whatsapp_thread, daemon=True).start()
        return {"status": "ok", "type": "desktop"}
    except Exception as e:
        return {"status": "error", "message": str(e)}


@app.get("/api/check-whatsapp")
async def check_whatsapp_running():
    """Checks if WhatsApp Desktop is currently running."""
    try:
        import subprocess
        res = subprocess.run(
            ["powershell", "-NoProfile", "-Command", "if (Get-Process *whatsapp* -ErrorAction SilentlyContinue) { '1' } else { '0' }"],
            capture_output=True,
            text=True,
            timeout=1.5
        )
        return {"running": "1" in res.stdout}
    except Exception:
        return {"running": False}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="127.0.0.1", port=8000, reload=False)
