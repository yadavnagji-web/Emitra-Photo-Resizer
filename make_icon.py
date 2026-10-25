"""
Script to generate ultra-sharp, professional software icon (.ico and .png)
for 'Photo & Signature Resizer (E-Mitra Suite)'.
Creates a multi-resolution icon (256, 128, 64, 48, 32, 16) with:
- Modern squircle royal blue & cyan gradient container
- Crisp white passport photo silhouette
- Golden lightning bolt badge (Fast)
- Signature quill / pen nib accent
"""

import math
from PIL import Image, ImageDraw, ImageFont

def create_master_icon(size=512):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    margin = int(size * 0.05)
    corner_r = int(size * 0.22)
    box = [margin, margin, size - margin, size - margin]

    # 1. Base Squircle with Royal Blue to Deep Indigo Gradient
    base = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    base_draw = ImageDraw.Draw(base)
    base_draw.rounded_rectangle(box, radius=corner_r, fill=(255, 255, 255, 255))

    # Gradient fill
    grad = Image.new("RGBA", (size, size))
    for y in range(size):
        ratio = y / float(size)
        # Gradient: #1e3a8a (Dark Blue) -> #2563eb (Royal Blue) -> #0284c7 (Sky Blue)
        r = int(30 * (1 - ratio) + 2 * ratio)
        g = int(58 * (1 - ratio) + 132 * ratio)
        b = int(138 * (1 - ratio) + 225 * ratio)
        for x in range(size):
            grad.putpixel((x, y), (r, g, b, 255))

    # Mask gradient with rounded squircle
    img.paste(grad, (0, 0), base)

    # 2. Subtle Outer Glow / Border
    draw = ImageDraw.Draw(img)
    draw.rounded_rectangle(box, radius=corner_r, outline=(255, 255, 255, 60), width=int(size * 0.015))

    # 3. Inner Passport Photo Card (White Crisp Frame with Drop Shadow)
    pw = int(size * 0.46)
    ph = int(pw * (4.5 / 3.5))
    px = int(size * 0.16)
    py = int(size * 0.16)

    # Shadow
    shadow = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    s_draw = ImageDraw.Draw(shadow)
    s_draw.rounded_rectangle([px + 6, py + 8, px + pw + 6, py + ph + 8], radius=14, fill=(0, 0, 0, 80))
    img.alpha_composite(shadow)

    # White photo card
    draw = ImageDraw.Draw(img)
    draw.rounded_rectangle([px, py, px + pw, py + ph], radius=14, fill=(255, 255, 255, 255))
    draw.rounded_rectangle([px, py, px + pw, py + ph], radius=14, outline=(226, 232, 240, 255), width=3)

    # Person Avatar Silhouette inside Photo Card
    cx = px + pw // 2
    head_r = int(pw * 0.22)
    head_cy = py + int(ph * 0.35)

    # Head
    draw.ellipse([cx - head_r, head_cy - head_r, cx + head_r, head_cy + head_r], fill=(59, 130, 246, 255))

    # Shoulder / Bust
    shoulder_w = int(pw * 0.72)
    shoulder_top = head_cy + int(head_r * 1.1)
    shoulder_bottom = py + int(ph * 0.88)
    draw.chord(
        [cx - shoulder_w // 2, shoulder_top - 20, cx + shoulder_w // 2, shoulder_bottom + 40],
        start=0, end=180, fill=(37, 99, 235, 255)
    )

    # 4. Signature Line & Quill (Bottom Right)
    sx = int(size * 0.50)
    sy = int(size * 0.62)
    sw = int(size * 0.38)
    sh = int(size * 0.24)

    # Signature card background
    draw.rounded_rectangle([sx, sy, sx + sw, sy + sh], radius=12, fill=(255, 255, 255, 245), outline=(203, 213, 225, 255), width=2)
    # Signature scribble curve
    sig_points = [
        (sx + 20, sy + sh - 25),
        (sx + 45, sy + 30),
        (sx + 65, sy + sh - 20),
        (sx + 90, sy + 35),
        (sx + 115, sy + sh - 25),
        (sx + sw - 25, sy + sh - 25)
    ]
    draw.line(sig_points, fill=(15, 23, 42, 255), width=int(size * 0.012), joint="curve")

    # 5. Golden Lightning Bolt Badge on Top Right (⚡ Fast E-Mitra)
    bx = int(size * 0.74)
    by = int(size * 0.14)
    br = int(size * 0.12)
    draw.ellipse([bx - br, by - br, bx + br, by + br], fill=(245, 158, 11, 255), outline=(255, 255, 255, 240), width=4)

    # Lightning polygon inside golden badge
    bolt = [
        (bx + 4, by - int(br * 0.65)),
        (bx - int(br * 0.45), by + 2),
        (bx, by + 2),
        (bx - 4, by + int(br * 0.65)),
        (bx + int(br * 0.45), by - 2),
        (bx, by - 2)
    ]
    draw.polygon(bolt, fill=(255, 255, 255, 255))

    return img

def main():
    master = create_master_icon(512)
    master.save("static/app_icon.png", format="PNG")
    master.save("app_icon.png", format="PNG")

    # Generate multi-res .ico
    sizes = [(256, 256), (128, 128), (64, 64), (48, 48), (32, 32), (16, 16)]
    master.save("app_icon.ico", format="ICO", sizes=sizes)
    master.save("static/favicon.ico", format="ICO", sizes=[(32, 32), (16, 16)])

    print("Icons successfully created: app_icon.ico, app_icon.png, static/favicon.ico")

if __name__ == "__main__":
    main()
