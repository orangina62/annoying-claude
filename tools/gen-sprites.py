"""Generate the pixel-art dino sprite PNGs used by the Claude renderer.

Source: the public-domain (CC0) FreeDinoSprite pack from OpenGameArt.org
(https://opengameart.org/content/free-dino-sprites). The pack ships
cartoon-style high-res PNGs; we downscale them to 32x32 with Lanczos
filtering so they read as crisp chunky pixels when the renderer paints
them at 64x64 with image smoothing disabled.

This is a build-time tool. Run it once when refreshing the asset set;
the project ships the resulting PNGs and does not depend on Python at
runtime.
"""

from __future__ import annotations

import os
import shutil
import sys
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC_DIR = Path(os.environ.get("DINO_SRC", r"C:\Users\lebes\AppData\Local\Temp\dino_extract\png"))
DST_DIR = ROOT / "src" / "renderer" / "claude" / "assets"
TARGET_SIZE = 32

# Which source frame becomes which named sprite.
FRAMES = {
    "idle-1": "Idle (1).png",
    "idle-2": "Idle (5).png",
    "walk-1": "Run (1).png",
    "walk-2": "Run (5).png",
    "dead": "Dead (1).png",
}


def crop_to_content(im: Image.Image) -> Image.Image:
    bbox = im.getbbox()
    return im.crop(bbox) if bbox else im


def fit_square(im: Image.Image, size: int) -> Image.Image:
    w, h = im.size
    scale = size / max(w, h)
    new_w = max(1, int(round(w * scale)))
    new_h = max(1, int(round(h * scale)))
    resized = im.resize((new_w, new_h), Image.LANCZOS)
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    canvas.paste(resized, ((size - new_w) // 2, (size - new_h) // 2), resized)
    return canvas


def main() -> int:
    if not SRC_DIR.exists():
        print(f"source dir not found: {SRC_DIR}", file=sys.stderr)
        return 1

    if DST_DIR.exists():
        shutil.rmtree(DST_DIR)
    DST_DIR.mkdir(parents=True)

    for out_name, in_name in FRAMES.items():
        src = Image.open(SRC_DIR / in_name).convert("RGBA")
        cropped = crop_to_content(src)
        fitted = fit_square(cropped, TARGET_SIZE)
        out = DST_DIR / f"dino-{out_name}.png"
        fitted.save(out, optimize=True)
        print(f"  {in_name:18} -> {out.relative_to(ROOT)}  ({TARGET_SIZE}x{TARGET_SIZE})")

    print(f"wrote {len(FRAMES)} sprites to {DST_DIR.relative_to(ROOT)}/")
    return 0


if __name__ == "__main__":
    sys.exit(main())
