"""Frames the README screenshots and GIFs in docs/media: rounded corners, a
hairline border and a soft drop shadow.

GitHub strips CSS from READMEs, so the frame has to be part of the image.

- Screenshots: docs/media/raw/*.png -> docs/media/*.png, same name. The
  shadow is on a transparent background, so one file works on both themes.
- GIFs: docs/media/raw/<name>.mp4 -> <name>.gif and <name>-dark.gif. GIF
  transparency is all or nothing, so each GIF is drawn on GitHub's light or
  dark page color and the README picks one with <picture>.

Run from the repo root:
  nix-shell -p 'python3.withPackages (p: [p.pillow])' ffmpeg-headless \
    --run 'python3 docs/media/frame/make-frames.py'
"""

import os
import subprocess
import tempfile
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

MEDIA = Path("docs/media")
RAW = MEDIA / "raw"

# Sizes for a 1440px wide screenshot; GIFs scale them down with their width.
RADIUS = 20
BORDER = 2
PAD = 64
BLUR = 18
OFFSET = 8

THEMES = {
    # border, shadow opacity, GitHub page color
    "light": ((0, 0, 0, 28), 60, (255, 255, 255)),
    "dark": ((255, 255, 255, 30), 150, (13, 17, 23)),
}

# name, [(start s, end s or None, speed-up)] in the source video
GIFS = [
    # enter numbers, let ratatatata dial and rate calls, scroll to the results
    ("flow", [(0, 16, 1.5), (16, 148, 8), (148, 156, 4), (156, None, 1.25)]),
    ("ratatatata", [(0, None, 3)]),
]
GIF_WIDTH = 960
GIF_FPS = 12

SS = 4  # supersampling for smooth corners


def layers(size, theme, k=1.0):
    """Mask, shadow and border for a card of `size`, on its padded canvas."""
    border, shadow_alpha, _ = THEMES[theme]
    w, h = size
    pad, r = round(PAD * k), RADIUS * k
    cw, ch = w + 2 * pad, h + 2 * pad

    big = Image.new("L", (cw * SS, ch * SS), 0)
    box = (pad * SS, pad * SS, (pad + w) * SS - 1, (pad + h) * SS - 1)
    ImageDraw.Draw(big).rounded_rectangle(box, r * SS, fill=255)
    mask = big.resize((cw, ch), Image.LANCZOS)

    ring = Image.new("RGBA", (cw * SS, ch * SS), (0, 0, 0, 0))
    ImageDraw.Draw(ring).rounded_rectangle(box, r * SS, outline=border, width=round(BORDER * k * SS))
    ring = ring.resize((cw, ch), Image.LANCZOS)

    shadow = Image.new("RGBA", (cw, ch), (0, 0, 0, 0))
    shadow.putalpha(mask.point(lambda v: v * shadow_alpha // 255))
    shadow = shadow.transform(shadow.size, Image.AFFINE, (1, 0, 0, 0, 1, -round(OFFSET * k)))
    shadow = shadow.filter(ImageFilter.GaussianBlur(BLUR * k))
    return pad, mask, ring, shadow


def theme_of(name):
    return "dark" if name.endswith("-dark") else "light"


def frame_png(src):
    im = Image.open(src).convert("RGBA")
    pad, mask, ring, shadow = layers(im.size, theme_of(src.stem))
    card = Image.new("RGBA", mask.size, (0, 0, 0, 0))
    card.paste(im, (pad, pad))
    card.putalpha(mask)
    out = Image.alpha_composite(Image.alpha_composite(shadow, card), ring)
    out.save(MEDIA / src.name, optimize=True)


def retime(segments):
    """Filter graph that cuts the source into segments and speeds each one up."""
    parts = []
    for i, (start, end, speed) in enumerate(segments):
        trim = f"trim=start={start}" + (f":end={end}" if end is not None else "")
        parts.append(f"[0:v]{trim},setpts=(PTS-STARTPTS)/{speed}[s{i}]")
    inputs = "".join(f"[s{i}]" for i in range(len(segments)))
    return ";".join(parts) + f";{inputs}concat=n={len(segments)}:v=1:a=0"


def frame_gif(name, segments, theme, tmp):
    """Pads the video with the page color and lays a frame overlay on top.

    The overlay is opaque outside the rounded card and transparent inside it,
    so the corners blend into the page color the same way the PNGs do.
    """
    w, h = GIF_WIDTH, GIF_WIDTH * 900 // 1440
    pad, mask, ring, shadow = layers((w, h), theme, k=GIF_WIDTH / 1440)
    page = THEMES[theme][2]
    overlay = Image.alpha_composite(Image.new("RGBA", mask.size, page + (255,)), shadow)
    overlay.putalpha(mask.point(lambda v: 255 - v))
    overlay = Image.alpha_composite(overlay, ring)
    ov = Path(tmp) / f"{name}-{theme}.png"
    overlay.save(ov)

    out = MEDIA / (f"{name}-dark.gif" if theme == "dark" else f"{name}.gif")
    color = "0x%02x%02x%02x" % page
    video = (
        f"{retime(segments)},fps={GIF_FPS},scale={w}:{h}:flags=lanczos,format=rgb24,"
        f"pad={mask.width}:{mask.height}:{pad}:{pad}:color={color}[v];"
        "[v][1:v]overlay=format=gbrp"
    )
    ffmpeg = ["ffmpeg", "-y", "-loglevel", "error", "-i", RAW / f"{name}.mp4", "-i", ov]

    # palettegen can shift the page color by a few levels, which shows as a
    # box around the GIF. Snap the closest palette entry back to it.
    pal = Path(tmp) / f"{name}-{theme}-palette.png"
    subprocess.run([*ffmpeg, "-filter_complex", f"{video},palettegen=max_colors=128", pal], check=True)
    im = Image.open(pal).convert("RGB")
    px = list(im.getdata())
    nearest = min(range(len(px)), key=lambda i: sum((a - b) ** 2 for a, b in zip(px[i], page)))
    im.putpixel((nearest % im.width, nearest // im.width), page)
    im.save(pal)

    use = "paletteuse=dither=bayer:bayer_scale=4:diff_mode=rectangle"
    subprocess.run([*ffmpeg, "-i", pal, "-filter_complex", f"{video}[f];[f][2:v]{use}", out], check=True)


for src in sorted(RAW.glob("*.png")):
    frame_png(src)
    print(src.name)

with tempfile.TemporaryDirectory() as tmp:
    for name, segments in GIFS:
        for theme in THEMES:
            frame_gif(name, segments, theme, tmp)
            print(f"{name} {theme}")
