"""Builds the README media in docs/media.

- Screenshots: docs/media/raw/*.png -> docs/media/*.png, same name, with
  rounded corners, a hairline border and a soft drop shadow. GitHub strips
  CSS from READMEs, so the frame has to be part of the image. The shadow is on
  a transparent background, so one file works on both themes.
- Videos: docs/media/raw/<name>.mp4 -> docs/media/<name>.mp4, cut and sped up.
  GitHub only plays videos uploaded through its web UI, so upload the result
  (for example into a PR description) and put the user-attachments link on
  its own line in the README.

Run from the repo root:
  nix-shell -p 'python3.withPackages (p: [p.pillow])' ffmpeg-headless \
    --run 'python3 docs/media/frame/make-frames.py'
"""

import subprocess
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

MEDIA = Path("docs/media")
RAW = MEDIA / "raw"

RADIUS = 20
BORDER = 2
PAD = 64
BLUR = 18
OFFSET = 8

THEMES = {
    # border, shadow opacity
    "light": ((0, 0, 0, 28), 60),
    "dark": ((255, 255, 255, 30), 150),
}

# name, [(start s, end s or None, speed-up)] in the source video
VIDEOS = [
    # enter numbers, let ratatatata dial and rate calls, scroll to the results
    ("flow", [(0, 16, 1.5), (16, 148, 8), (148, 156, 4), (156, None, 1.25)]),
]

SS = 4  # supersampling for smooth corners


def layers(size, theme):
    """Mask, shadow and border for a card of `size`, on its padded canvas."""
    border, shadow_alpha = THEMES[theme]
    w, h = size
    cw, ch = w + 2 * PAD, h + 2 * PAD

    big = Image.new("L", (cw * SS, ch * SS), 0)
    box = (PAD * SS, PAD * SS, (PAD + w) * SS - 1, (PAD + h) * SS - 1)
    ImageDraw.Draw(big).rounded_rectangle(box, RADIUS * SS, fill=255)
    mask = big.resize((cw, ch), Image.LANCZOS)

    ring = Image.new("RGBA", (cw * SS, ch * SS), (0, 0, 0, 0))
    ImageDraw.Draw(ring).rounded_rectangle(box, RADIUS * SS, outline=border, width=BORDER * SS)
    ring = ring.resize((cw, ch), Image.LANCZOS)

    shadow = Image.new("RGBA", (cw, ch), (0, 0, 0, 0))
    shadow.putalpha(mask.point(lambda v: v * shadow_alpha // 255))
    shadow = shadow.transform(shadow.size, Image.AFFINE, (1, 0, 0, 0, 1, -OFFSET))
    shadow = shadow.filter(ImageFilter.GaussianBlur(BLUR))
    return mask, ring, shadow


def theme_of(name):
    return "dark" if name.endswith("-dark") else "light"


def frame_png(src):
    im = Image.open(src).convert("RGBA")
    mask, ring, shadow = layers(im.size, theme_of(src.stem))
    card = Image.new("RGBA", mask.size, (0, 0, 0, 0))
    card.paste(im, (PAD, PAD))
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


def export_mp4(name, segments):
    subprocess.run(
        ["ffmpeg", "-y", "-loglevel", "error", "-i", RAW / f"{name}.mp4",
         "-filter_complex", f"{retime(segments)},fps=30,format=yuv420p",
         "-an", "-c:v", "libx264", "-preset", "slow", "-crf", "24",
         "-movflags", "+faststart", MEDIA / f"{name}.mp4"],
        check=True,
    )


for src in sorted(RAW.glob("*.png")):
    frame_png(src)
    print(src.name)

for name, segments in VIDEOS:
    export_mp4(name, segments)
    print(f"{name}.mp4")
