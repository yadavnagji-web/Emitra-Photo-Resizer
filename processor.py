"""
E-Mitra Photo & Signature Processing Engine (Pure Algorithmic - NO AI)
Optimized for Rajasthan E-Mitra, CSC, and Cyber Cafe Operators.
Auto-adjusts standard dimensions based on target KB input.
"""

import io
import os
import base64
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageEnhance

# Preset default KBs
PRESETS = {
    "rsmssb": {
        "id": "rsmssb",
        "name": "RSMSSB (CET / पटवारी / LDC / ग्राम सेवक)",
        "photo_kb": 80,
        "sign_kb": 35
    },
    "rpsc": {
        "id": "rpsc",
        "name": "RPSC (RAS / 1st & 2nd Grade / SI)",
        "photo_kb": 80,
        "sign_kb": 35
    },
    "police": {
        "id": "police",
        "name": "राजस्थान पुलिस कांस्टेबल",
        "photo_kb": 80,
        "sign_kb": 35
    },
    "ssc": {
        "id": "ssc",
        "name": "SSC (CGL / CHSL / MTS / GD)",
        "photo_kb": 40,
        "sign_kb": 18
    },
    "railway": {
        "id": "railway",
        "name": "रेलवे (RRB ALP / Technician / NTPC)",
        "photo_kb": 55,
        "sign_kb": 50
    },
    "upsc": {
        "id": "upsc",
        "name": "UPSC (Civil Services / NDA)",
        "photo_kb": 100,
        "sign_kb": 100
    }
}


def get_auto_standard_dimensions(target_kb: float, is_photo: bool = True, item_type: str = None) -> tuple:
    """
    Auto-adjusts optimal standard pixel dimensions according to the requested KB size:
    - Photo: Maintains official 3.5 : 4.5 aspect ratio. Scales resolution so low KB
      doesn't look pixelated, and high KB stays ultra sharp.
    - Signature: Maintains official ~ 2.5 : 1 / 7 : 2 aspect ratio.
    - Thumb: Maintains official square/thumb ratio ~ 1 : 1 (e.g. 260x260 px).
    """
    if item_type is None:
        item_type = "photo" if is_photo else "sign"

    if item_type == "photo":
        # Standard aspect ratio 3.5 : 4.5 (ratio = 4.5 / 3.5 ~ 1.2857)
        if target_kb <= 25:
            w = 240
        elif target_kb <= 50:
            w = 300
        elif target_kb <= 100:
            w = 350  # Official Rajasthan E-Mitra standard (350x450 px)
        else:
            w = 420
        h = int(w * (4.5 / 3.5))
        return (w, h)
    elif item_type == "thumb":
        # Standard square/thumb ratio ~ 1 : 1
        if target_kb <= 25:
            w, h = 220, 220
        elif target_kb <= 50:
            w, h = 280, 280
        else:
            w, h = 340, 340
        return (w, h)
    else:
        # Standard aspect ratio ~ 2.5:1 to 2.8:1
        if target_kb <= 15:
            w, h = 220, 90
        elif target_kb <= 35:
            w, h = 280, 115  # Official Rajasthan standard
        elif target_kb <= 60:
            w, h = 340, 140
        else:
            w, h = 420, 170
        return (w, h)


def rotate_image(img: np.ndarray, angle: int) -> np.ndarray:
    """Rotates image by 90, 180, or 270 degrees clockwise."""
    angle = int(angle) % 360
    if angle == 90:
        return cv2.rotate(img, cv2.ROTATE_90_CLOCKWISE)
    elif angle == 180:
        return cv2.rotate(img, cv2.ROTATE_180)
    elif angle == 270:
        return cv2.rotate(img, cv2.ROTATE_90_COUNTERCLOCKWISE)
    return img


def adjust_brightness_contrast(img: np.ndarray, brightness: int = 0, contrast: int = 0) -> np.ndarray:
    """Adjusts brightness (-50 to +50) and contrast (-50 to +50)."""
    if brightness == 0 and contrast == 0:
        return img
    alpha = max(0.5, min(2.0, 1.0 + (contrast / 100.0)))
    beta = max(-100.0, min(100.0, float(brightness)))
    return cv2.convertScaleAbs(img, alpha=alpha, beta=beta)


def change_photo_background(bgr_photo: np.ndarray, bg_mode: str = "original") -> np.ndarray:
    """
    Algorithmic background replacement for passport photo (Original, White, or Light Sky Blue).
    Fast, completely offline, zero AI.
    """
    if not bg_mode or bg_mode in ("original", "none") or bgr_photo is None or bgr_photo.size == 0:
        return bgr_photo

    h, w, _ = bgr_photo.shape
    if h < 40 or w < 40:
        return bgr_photo

    try:
        # Scale down for ultra-fast GrabCut execution (~30ms)
        scale = min(1.0, 240.0 / max(h, w))
        sw = max(10, int(w * scale))
        sh = max(10, int(h * scale))
        small = cv2.resize(bgr_photo, (sw, sh), interpolation=cv2.INTER_AREA)

        mask = np.zeros((sh, sw), np.uint8)
        rect = (int(sw * 0.08), int(sh * 0.04), int(sw * 0.84), int(sh * 0.94))
        bgd_model = np.zeros((1, 65), np.float64)
        fgd_model = np.zeros((1, 65), np.float64)

        cv2.grabCut(small, mask, rect, bgd_model, fgd_model, iterCount=3, mode=cv2.GC_INIT_WITH_RECT)
        fg_mask = np.where((mask == cv2.GC_FGD) | (mask == cv2.GC_PR_FGD), 255, 0).astype("uint8")

        fg_mask = cv2.resize(fg_mask, (w, h), interpolation=cv2.INTER_LINEAR)
        fg_mask = cv2.GaussianBlur(fg_mask, (5, 5), 0)
        alpha = (fg_mask.astype(float) / 255.0)[:, :, np.newaxis]

        if bg_mode == "blue":
            target_color = np.array([245, 215, 170], dtype=np.uint8)  # Passport light sky-blue (BGR)
        else:
            target_color = np.array([255, 255, 255], dtype=np.uint8)  # Pure white

        bg_layer = np.full_like(bgr_photo, target_color)
        blended = (bgr_photo.astype(float) * alpha + bg_layer.astype(float) * (1.0 - alpha)).astype(np.uint8)
        return blended
    except Exception as e:
        print("Background change error:", e)
        return bgr_photo


def clean_thumb_impression(cropped_thumb: np.ndarray) -> np.ndarray:
    """
    Cleans thumb impression (LTI):
    - Normalizes lighting and removes shadows/paper tint.
    - Enhances fingerprint ridge lines (contrast & detail).
    - Makes background clean white while preserving ink detail (blue/black).
    """
    if cropped_thumb is None or cropped_thumb.size == 0:
        return cropped_thumb

    gray = cv2.cvtColor(cropped_thumb, cv2.COLOR_BGR2GRAY)
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (25, 25))
    bg = cv2.dilate(gray, kernel)
    bg = cv2.GaussianBlur(bg, (25, 25), 0)

    diff = 255 - cv2.absdiff(gray, bg)
    norm = cv2.normalize(diff, None, alpha=0, beta=255, norm_type=cv2.NORM_MINMAX, dtype=cv2.CV_8UC1)

    norm = cv2.convertScaleAbs(norm, alpha=1.25, beta=-15)
    _, cleaned = cv2.threshold(norm, 235, 255, cv2.THRESH_TRUNC)
    cleaned = cv2.normalize(cleaned, None, alpha=0, beta=255, norm_type=cv2.NORM_MINMAX, dtype=cv2.CV_8UC1)

    return cv2.cvtColor(cleaned, cv2.COLOR_GRAY2BGR)


def load_image(image_bytes: bytes) -> np.ndarray:
    """Decodes bytes to BGR numpy array using OpenCV or PyMuPDF if PDF."""
    if not image_bytes:
        return None
    # Check if PDF file
    if len(image_bytes) > 4 and image_bytes[:4] == b"%PDF":
        try:
            import fitz
            doc = fitz.open(stream=image_bytes, filetype="pdf")
            if len(doc) > 0:
                page = doc.load_page(0)
                pix = page.get_pixmap(dpi=150)
                img = np.frombuffer(pix.samples, dtype=np.uint8).reshape((pix.height, pix.width, pix.n))
                if pix.n == 4:
                    return cv2.cvtColor(img, cv2.COLOR_RGBA2BGR)
                elif pix.n == 3:
                    return cv2.cvtColor(img, cv2.COLOR_RGB2BGR)
                elif pix.n == 1:
                    return cv2.cvtColor(img, cv2.COLOR_GRAY2BGR)
        except Exception as e:
            print("PDF decode error:", e)

    nparr = np.frombuffer(image_bytes, np.uint8)
    return cv2.imdecode(nparr, cv2.IMREAD_COLOR)


def to_base64_data_url(image_bytes: bytes, mime_type: str = "image/jpeg") -> str:
    """Encodes raw bytes to base64 data URL for direct browser rendering."""
    b64 = base64.b64encode(image_bytes).decode("utf-8")
    return f"data:{mime_type};base64,{b64}"


def detect_photo_box_algorithmic(img: np.ndarray, target_aspect_ratio: float = 3.5 / 4.5) -> list:
    """
    Pure algorithmic detection of face/passport photo region.
    Uses YCrCb skin-color segmentation and contour geometry (Zero AI).
    """
    h, w, _ = img.shape
    ycrcb = cv2.cvtColor(img, cv2.COLOR_BGR2YCrCb)

    lower_skin = np.array([0, 133, 77], dtype=np.uint8)
    upper_skin = np.array([255, 173, 127], dtype=np.uint8)
    skin_mask = cv2.inRange(ycrcb, lower_skin, upper_skin)

    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (15, 15))
    skin_mask = cv2.morphologyEx(skin_mask, cv2.MORPH_CLOSE, kernel)
    skin_mask = cv2.morphologyEx(skin_mask, cv2.MORPH_OPEN, kernel)

    contours, _ = cv2.findContours(skin_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    valid_candidates = []
    total_area = w * h

    for c in contours:
        area = cv2.contourArea(c)
        if area > total_area * 0.03:
            bx, by, bw, bh = cv2.boundingRect(c)
            if by < h * 0.75:
                valid_candidates.append((bx, by, bw, bh, area))

    if valid_candidates:
        valid_candidates.sort(key=lambda item: item[4], reverse=True)
        bx, by, bw, bh, _ = valid_candidates[0]

        cx = bx + bw / 2.0
        cy = by + bh / 2.0

        crop_h = max(bh * 1.6, h * 0.6)
        crop_w = crop_h * target_aspect_ratio

        if crop_w > w or crop_h > h:
            scale = min(w / crop_w, h / crop_h) * 0.95
            crop_w *= scale
            crop_h *= scale

        x1 = max(0, int(cx - crop_w / 2.0))
        y1 = max(0, int(cy - crop_h * 0.42))
        x2 = min(w, int(x1 + crop_w))
        y2 = min(h, int(y1 + crop_h))
        return [x1, y1, x2 - x1, y2 - y1]

    # Fallback: centered passport ratio crop
    crop_h = int(h * 0.9)
    crop_w = int(crop_h * target_aspect_ratio)
    if crop_w > w:
        crop_w = int(w * 0.9)
        crop_h = int(crop_w / target_aspect_ratio)
    x1 = (w - crop_w) // 2
    y1 = (h - crop_h) // 2
    return [max(0, x1), max(0, y1), min(w, crop_w), min(h, crop_h)]


def detect_signature_box_algorithmic(img: np.ndarray, exclude_box: list = None) -> list:
    """
    Pure algorithmic detection of handwriting/signature strokes.
    Zero AI models used.
    """
    h, w, _ = img.shape
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    mask = np.ones((h, w), dtype=np.uint8) * 255
    if exclude_box is not None:
        ex, ey, ew, eh = exclude_box
        pad = int(min(w, h) * 0.04)
        mx1, my1 = max(0, ex - pad), max(0, ey - pad)
        mx2, my2 = min(w, ex + ew + pad), min(h, ey + eh + pad)
        mask[my1:my2, mx1:mx2] = 0

    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    thresh = cv2.adaptiveThreshold(
        blurred, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY_INV, 25, 10
    )
    thresh = cv2.bitwise_and(thresh, thresh, mask=mask)

    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (25, 7))
    dilated = cv2.dilate(thresh, kernel, iterations=2)

    contours, _ = cv2.findContours(dilated, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    candidates = []
    total_area = w * h

    for c in contours:
        x, y, cw, ch = cv2.boundingRect(c)
        area = cw * ch
        if area < total_area * 0.002 or area > total_area * 0.85:
            continue
        aspect = cw / float(ch) if ch > 0 else 0
        if 1.0 <= aspect <= 8.0 and cw > 35 and ch > 12:
            candidates.append((x, y, cw, ch, area))

    if candidates:
        candidates.sort(key=lambda item: item[4], reverse=True)
        x, y, cw, ch, _ = candidates[0]
        pad_x = int(cw * 0.08)
        pad_y = int(ch * 0.12)
        x1 = max(0, x - pad_x)
        y1 = max(0, y - pad_y)
        x2 = min(w, x + cw + pad_x)
        y2 = min(h, y + ch + pad_y)
        return [x1, y1, x2 - x1, y2 - y1]

    if exclude_box is not None:
        ey = exclude_box[1] + exclude_box[3]
        if ey < h - 40:
            return [0, ey, w, h - ey]

    return [0, int(h * 0.65), w, int(h * 0.35)]


def clean_signature(cropped_sign: np.ndarray) -> np.ndarray:
    """Normalizes lighting, eliminates dark shadows, makes background pure white."""
    if cropped_sign is None or cropped_sign.size == 0:
        return cropped_sign

    gray = cv2.cvtColor(cropped_sign, cv2.COLOR_BGR2GRAY)
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (21, 21))
    bg = cv2.dilate(gray, kernel)
    bg = cv2.GaussianBlur(bg, (21, 21), 0)

    diff = 255 - cv2.absdiff(gray, bg)
    norm = cv2.normalize(diff, None, alpha=0, beta=255, norm_type=cv2.NORM_MINMAX, dtype=cv2.CV_8UC1)

    _, cleaned = cv2.threshold(norm, 230, 255, cv2.THRESH_TRUNC)
    cleaned = cv2.normalize(cleaned, None, alpha=0, beta=255, norm_type=cv2.NORM_MINMAX, dtype=cv2.CV_8UC1)

    return cv2.cvtColor(cleaned, cv2.COLOR_GRAY2BGR)


def enhance_photo(cropped_photo: np.ndarray) -> np.ndarray:
    """Auto color, contrast & sharpness enhancement for photo."""
    if cropped_photo is None or cropped_photo.size == 0:
        return cropped_photo

    rgb = cv2.cvtColor(cropped_photo, cv2.COLOR_BGR2RGB)
    pil_img = Image.fromarray(rgb)

    enhancer = ImageEnhance.Contrast(pil_img)
    pil_img = enhancer.enhance(1.08)
    enhancer = ImageEnhance.Sharpness(pil_img)
    pil_img = enhancer.enhance(1.12)

    return cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)


def add_name_and_date(bgr_img: np.ndarray, candidate_name: str, photo_date: str) -> np.ndarray:
    """Adds white strip at bottom of photo with candidate name & date."""
    if not candidate_name and not photo_date:
        return bgr_img

    rgb = cv2.cvtColor(bgr_img, cv2.COLOR_BGR2RGB)
    pil_img = Image.fromarray(rgb)
    draw = ImageDraw.Draw(pil_img)
    w, h = pil_img.size

    banner_h = int(h * 0.18)
    banner_y0 = h - banner_h

    draw.rectangle([(0, banner_y0), (w, h)], fill="white")
    draw.line([(0, banner_y0), (w, banner_y0)], fill="#d0d0d0", width=1)

    font_size = max(11, int(banner_h * 0.32))
    try:
        font = ImageFont.truetype("arial.ttf", font_size)
    except IOError:
        font = ImageFont.load_default()

    lines = []
    if candidate_name:
        lines.append(candidate_name.upper().strip())
    if photo_date:
        lines.append(f"DOP: {photo_date.strip()}")

    total_text_h = len(lines) * (font_size + 3)
    start_y = banner_y0 + (banner_h - total_text_h) // 2

    for i, line in enumerate(lines):
        line_y = start_y + i * (font_size + 4)
        try:
            bbox = draw.textbbox((0, 0), line, font=font)
            line_w = bbox[2] - bbox[0]
        except AttributeError:
            line_w = len(line) * (font_size * 0.6)
        line_x = max(2, (w - line_w) // 2)
        draw.text((line_x, line_y), line, fill="black", font=font)

    return cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)


def compress_to_target_kb(bgr_img: np.ndarray, target_w: int, target_h: int,
                           min_kb: int, max_kb: int, target_kb: int = None) -> bytes:
    """
    Compresses image to hit target KB while strictly respecting [min_kb, max_kb].
    """
    if target_kb is None:
        target_kb = int((min_kb + max_kb) / 2.0)

    resized = cv2.resize(bgr_img, (target_w, target_h), interpolation=cv2.INTER_AREA)
    rgb = cv2.cvtColor(resized, cv2.COLOR_BGR2RGB)
    pil_img = Image.fromarray(rgb)

    low_q, high_q = 15, 95
    best_bytes = None
    best_diff = float("inf")

    for _ in range(8):
        mid_q = (low_q + high_q) // 2
        buffer = io.BytesIO()
        pil_img.save(buffer, format="JPEG", quality=mid_q, optimize=True)
        size_kb = len(buffer.getvalue()) / 1024.0

        diff = abs(size_kb - target_kb)
        if diff < best_diff:
            best_diff = diff
            best_bytes = buffer.getvalue()

        if size_kb < min_kb:
            low_q = mid_q + 1
        elif size_kb > max_kb:
            high_q = mid_q - 1
        else:
            best_bytes = buffer.getvalue()
            break

    final_kb = len(best_bytes) / 1024.0
    if final_kb < min_kb:
        needed_bytes = int((min_kb + 1 - final_kb) * 1024)
        if needed_bytes > 0:
            best_bytes = best_bytes + b"\x00" * needed_bytes

    return best_bytes


def process_image_pipeline(image_bytes: bytes,
                           preset_id: str = "rsmssb",
                           candidate_name: str = "",
                           photo_date: str = "",
                           add_date_stamp: bool = False,
                           mode: str = "auto",
                           custom_photo_box: list = None,
                           custom_sign_box: list = None,
                           photo_user_kb: float = 80,
                           sign_user_kb: float = 35,
                           angle: int = 0,
                           brightness: int = 0,
                           contrast: int = 0,
                           bg_color: str = "original") -> dict:
    """
    Unified Pipeline:
    - Supports rotation (90, 180, 270)
    - Brightness / Contrast adjustments
    - Background color (Original, White, Light Sky Blue)
    - Mode: photo, sign, thumb (Left Thumb Impression), auto (both)
    - Auto-adjusts standard dimensions based strictly on target KB.
    """
    img = load_image(image_bytes)
    if img is None:
        raise ValueError("Invalid or corrupted image format")

    # Apply Rotation if requested
    if angle != 0:
        img = rotate_image(img, angle)

    # Apply Brightness / Contrast adjustments
    if brightness != 0 or contrast != 0:
        img = adjust_brightness_contrast(img, brightness, contrast)

    h, w, _ = img.shape

    # Set safe default KBs
    target_photo_kb = float(photo_user_kb) if photo_user_kb and photo_user_kb > 5 else 80.0
    target_sign_kb = float(sign_user_kb) if sign_user_kb and sign_user_kb > 5 else 35.0

    # Auto-adjust standard dimensions based on KB
    photo_w, photo_h = get_auto_standard_dimensions(target_photo_kb, is_photo=True)
    is_thumb_mode = (mode == "thumb")
    sign_w, sign_h = get_auto_standard_dimensions(target_sign_kb, is_photo=False, item_type="thumb" if is_thumb_mode else "sign")

    preset_name = PRESETS.get(preset_id, {}).get("name", "कस्टम (KB अनुसार)")

    result = {
        "original_width": w,
        "original_height": h,
        "preset_used": preset_name,
        "photo": None,
        "sign": None,
        "annotated_preview": None,
        "detected_boxes": {
            "photo": None,
            "sign": None
        }
    }

    annotated = img.copy()

    # Step 1: Photo Box
    photo_box = None
    if mode in ["auto", "photo"]:
        if custom_photo_box and len(custom_photo_box) == 4 and custom_photo_box[2] > 10 and custom_photo_box[3] > 10:
            photo_box = [int(v) for v in custom_photo_box]
        else:
            photo_box = detect_photo_box_algorithmic(img)

        if photo_box:
            px, py, pw, ph = photo_box
            px = max(0, min(w - 1, px))
            py = max(0, min(h - 1, py))
            pw = max(10, min(w - px, pw))
            ph = max(10, min(h - py, ph))
            photo_box = [px, py, pw, ph]
            result["detected_boxes"]["photo"] = photo_box

            photo_crop = img[py:py + ph, px:px + pw]
            if photo_crop.size > 0:
                photo_enhanced = enhance_photo(photo_crop)
                if bg_color and bg_color != "original":
                    photo_enhanced = change_photo_background(photo_enhanced, bg_color)
                if add_date_stamp:
                    photo_enhanced = add_name_and_date(photo_enhanced, candidate_name, photo_date)

                min_p_kb = max(5, int(target_photo_kb * 0.75))
                max_p_kb = int(target_photo_kb)

                photo_bytes = compress_to_target_kb(
                    photo_enhanced,
                    photo_w, photo_h,
                    min_p_kb, max_p_kb, int(target_photo_kb * 0.95)
                )

                result["photo"] = {
                    "data_url": to_base64_data_url(photo_bytes),
                    "size_kb": round(len(photo_bytes) / 1024.0, 1),
                    "width": photo_w,
                    "height": photo_h,
                    "box": photo_box,
                    "raw_bytes": photo_bytes
                }

                cv2.rectangle(annotated, (px, py), (px + pw, py + ph), (0, 200, 0), 3)
                cv2.putText(annotated, f"Photo ({target_photo_kb}KB)", (px + 5, max(25, py - 10)),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 200, 0), 2)

    # Step 2: Signature / Thumb Impression Box
    sign_box = None
    if mode in ["auto", "sign", "thumb"]:
        if custom_sign_box and len(custom_sign_box) == 4 and custom_sign_box[2] > 10 and custom_sign_box[3] > 10:
            sign_box = [int(v) for v in custom_sign_box]
        else:
            sign_box = detect_signature_box_algorithmic(img, exclude_box=photo_box)

        if sign_box:
            sx, sy, sw, sh = sign_box
            sx = max(0, min(w - 1, sx))
            sy = max(0, min(h - 1, sy))
            sw = max(10, min(w - sx, sw))
            sh = max(10, min(h - sy, sh))
            sign_box = [sx, sy, sw, sh]
            result["detected_boxes"]["sign"] = sign_box

            sign_crop = img[sy:sy + sh, sx:sx + sw]
            if sign_crop.size > 0:
                if is_thumb_mode:
                    sign_cleaned = clean_thumb_impression(sign_crop)
                    label_name = "Thumb"
                else:
                    sign_cleaned = clean_signature(sign_crop)
                    label_name = "Signature"

                min_s_kb = max(5, int(target_sign_kb * 0.75))
                max_s_kb = int(target_sign_kb)

                sign_bytes = compress_to_target_kb(
                    sign_cleaned,
                    sign_w, sign_h,
                    min_s_kb, max_s_kb, int(target_sign_kb * 0.95)
                )

                result["sign"] = {
                    "data_url": to_base64_data_url(sign_bytes),
                    "size_kb": round(len(sign_bytes) / 1024.0, 1),
                    "width": sign_w,
                    "height": sign_h,
                    "box": sign_box,
                    "raw_bytes": sign_bytes,
                    "is_thumb": is_thumb_mode
                }

                box_color = (180, 50, 220) if is_thumb_mode else (220, 100, 0)
                cv2.rectangle(annotated, (sx, sy), (sx + sw, sy + sh), box_color, 3)
                cv2.putText(annotated, f"{label_name} ({target_sign_kb}KB)", (sx + 5, max(25, sy - 10)),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.8, box_color, 2)

    _, buf = cv2.imencode(".jpg", annotated, [cv2.IMWRITE_JPEG_QUALITY, 80])
    result["annotated_preview"] = to_base64_data_url(buf.tobytes())

    return result


def process_document_pipeline(
    file1_bytes: bytes,
    file2_bytes: bytes = None,
    mode: str = "single",          # "single" or "id_merge"
    target_kb: float = 150.0,
    doc_format: str = "pdf",       # "pdf" or "jpeg"
    brightness: int = 0,
    contrast: int = 0
) -> dict:
    """
    Document / Marksheet & ID Card Pipeline:
    - Single mode: Marksheet / Certificate (100-300 KB) in PDF or JPG
    - ID Merge mode: Aadhaar / Voter ID (Front + Back joined on single A4/card canvas)
    """
    img1 = load_image(file1_bytes)
    if img1 is None:
        raise ValueError("Invalid document image")

    if brightness != 0 or contrast != 0:
        img1 = adjust_brightness_contrast(img1, brightness, contrast)

    if mode == "id_merge" and file2_bytes:
        img2 = load_image(file2_bytes)
        if img2 is not None:
            if brightness != 0 or contrast != 0:
                img2 = adjust_brightness_contrast(img2, brightness, contrast)

            # Standard card dimensions for ID cards (Aadhaar / Voter ID / Driving License)
            card_w, card_h = 1000, 630
            card1 = cv2.resize(img1, (card_w, card_h), interpolation=cv2.INTER_AREA)
            card2 = cv2.resize(img2, (card_w, card_h), interpolation=cv2.INTER_AREA)

            # Canvas: 1200 x 1650 (Portrait Page)
            canvas_w, canvas_h = 1200, 1650
            final_img = np.full((canvas_h, canvas_w, 3), 255, dtype=np.uint8)

            # Center cards
            x_offset = (canvas_w - card_w) // 2
            y_offset1 = 120
            y_offset2 = y_offset1 + card_h + 160

            # Draw subtle card frames & labels
            cv2.rectangle(final_img, (x_offset - 2, y_offset1 - 2), (x_offset + card_w + 2, y_offset1 + card_h + 2), (180, 180, 180), 2)
            final_img[y_offset1:y_offset1 + card_h, x_offset:x_offset + card_w] = card1
            cv2.putText(final_img, "FRONT SIDE (MUKHYA PRISHTH)", (x_offset + 10, y_offset1 - 15),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.75, (60, 60, 60), 2)

            cv2.rectangle(final_img, (x_offset - 2, y_offset2 - 2), (x_offset + card_w + 2, y_offset2 + card_h + 2), (180, 180, 180), 2)
            final_img[y_offset2:y_offset2 + card_h, x_offset:x_offset + card_w] = card2
            cv2.putText(final_img, "BACK SIDE (PICHHLA PRISHTH)", (x_offset + 10, y_offset2 - 15),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.75, (60, 60, 60), 2)
        else:
            final_img = img1
    else:
        # Single document: Marksheet / Certificate
        h, w, _ = img1.shape
        max_dim = 1600
        if max(h, w) > max_dim:
            scale = max_dim / float(max(h, w))
            final_img = cv2.resize(img1, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_AREA)
        else:
            final_img = img1

    # Convert to RGB PIL
    rgb = cv2.cvtColor(final_img, cv2.COLOR_BGR2RGB)
    pil_img = Image.fromarray(rgb)

    target_kb = float(target_kb) if target_kb and target_kb >= 20 else 150.0
    min_kb = max(20, int(target_kb * 0.7))
    max_kb = int(target_kb)

    # Iterative binary search for quality
    is_pdf = doc_format.lower() == "pdf"
    low_q, high_q = 15, 95
    best_bytes = None
    best_diff = float("inf")

    for _ in range(8):
        mid_q = (low_q + high_q) // 2
        buf = io.BytesIO()
        if is_pdf:
            pil_img.save(buf, format="PDF", quality=mid_q, resolution=150.0)
        else:
            pil_img.save(buf, format="JPEG", quality=mid_q, optimize=True)
        size_kb = len(buf.getvalue()) / 1024.0

        diff = abs(size_kb - target_kb)
        if diff < best_diff:
            best_diff = diff
            best_bytes = buf.getvalue()

        if size_kb < min_kb:
            low_q = mid_q + 1
        elif size_kb > max_kb:
            high_q = mid_q - 1
        else:
            best_bytes = buf.getvalue()
            break

    final_size_kb = round(len(best_bytes) / 1024.0, 1)

    # Thumbnail preview
    preview_buf = io.BytesIO()
    thumb_pil = pil_img.copy()
    thumb_pil.thumbnail((800, 1100), Image.Resampling.LANCZOS)
    thumb_pil.save(preview_buf, format="JPEG", quality=75)
    preview_data_url = to_base64_data_url(preview_buf.getvalue(), mime_type="image/jpeg")

    mime = "application/pdf" if is_pdf else "image/jpeg"

    return {
        "raw_bytes": best_bytes,
        "data_url": preview_data_url,
        "size_kb": final_size_kb,
        "format": doc_format.lower(),
        "mime_type": mime
    }
