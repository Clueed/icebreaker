"""Generates the README header images in docs/media:

- logo.svg, logo-dark.svg: the nav logo from
  apps/nextjs/src/app/_components/nav/nav.tsx. Urbanist 400 at 16px, a 4px
  gap, and the ship icon at h-[1.65cap] in its 24px wide box with stroke 1.25.
- tag.svg, tag-dark.svg: the "experimental" status tag, in the destructive
  color from apps/nextjs/src/app/globals.css.
- tag-handwritten.svg, tag-handwritten-dark.svg: the "handwritten" tag, in the
  primary color.

Text is converted to outlines so the SVGs render the same everywhere.

Run from the repo root (needs network for the font):
  nix shell --impure --expr 'with import <nixpkgs> {}; python3.withPackages (p: [p.uharfbuzz p.fonttools])' \
    -c python3 docs/media/logo/make-logo.py
"""

import io
import re
import urllib.request

import uharfbuzz as hb
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont

# --foreground, --destructive and --primary, light and dark
THEMES = {
    "": {"fg": "#09090b", "accent": "#eb0177", "primary": "#008ec2"},
    "-dark": {"fg": "#fafafa", "accent": "#ff3d9e", "primary": "#3dcbff"},
}
SHIP = """<path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1 .6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
<path d="M19.38 20A11.6 11.6 0 0 0 21 14l-9-4-9 4c0 2.9.94 5.34 2.81 7.76"/>
<path d="M19 13V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6"/><path d="M12 10v4"/><path d="M12 2v3"/>"""
FLASK = """<path d="M14 2v6a2 2 0 0 0 .245.96l5.51 10.08A2 2 0 0 1 18 22H6a2 2 0 0 1-1.755-2.96l5.51-10.08A2 2 0 0 0 10 8V2"/>
<path d="M6.453 15h11.094"/><path d="M8.5 2h7"/>"""
PEN = """<path d="M12 20h9"/>
<path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z"/>"""


def fetch_font(weight):
    css = urllib.request.urlopen(
        urllib.request.Request(
            f"https://fonts.googleapis.com/css2?family=Urbanist:wght@{weight}",
            headers={"User-Agent": "Mozilla/4.0"},  # old agent gets a plain ttf
        )
    ).read().decode()
    data = urllib.request.urlopen(re.search(r"url\((.+?)\)", css)[1]).read()
    return data, TTFont(io.BytesIO(data))


def outline(font, text, size, x, baseline, tracking=0.0):
    """Returns (svg path data, advance width) for text shaped with kerning."""
    data, tt = font
    scale = size / tt["head"].unitsPerEm
    buf = hb.Buffer()
    buf.add_str(text)
    buf.guess_segment_properties()
    hb.shape(hb.Font(hb.Face(data)), buf, {"kern": True})
    glyphs, names = tt.getGlyphSet(), tt.getGlyphOrder()
    pen = SVGPathPen(glyphs)
    cursor = 0.0
    for i, (info, pos) in enumerate(zip(buf.glyph_infos, buf.glyph_positions)):
        if i:
            cursor += tracking * size
        # flip y: font units grow upwards
        t = TransformPen(pen, (scale, 0, 0, -scale, x + cursor + pos.x_offset * scale, baseline))
        glyphs[names[info.codepoint]].draw(t)
        cursor += pos.x_advance * scale
    return pen.getCommands(), cursor


def cap_height(font, size):
    tt = font[1]
    return tt["OS/2"].sCapHeight * size / tt["head"].unitsPerEm


def x_height(font, size):
    tt = font[1]
    return tt["OS/2"].sxHeight * size / tt["head"].unitsPerEm


def write(name, viewbox, scale, body):
    x, y, w, h = viewbox
    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="{x:.3f} {y:.3f} {w:.3f} {h:.3f}" width="{w * scale:.0f}" height="{h * scale:.0f}">
{body}
</svg>
"""
    with open(f"docs/media/{name}", "w") as f:
        f.write(svg)
    print(name, f"{w:.1f}x{h:.1f}")


def logo(font):
    size, gap = 16, 4
    cap = cap_height(font, size)
    # icon: an svg box 24px wide and 1.65cap high, the 24x24 drawing fitted inside,
    # centered on the cap height as items-center does in the nav
    icon_h = 1.65 * cap
    icon_x, icon_y = (24 - icon_h) / 2, (cap - icon_h) / 2
    text, width = outline(font, "ICEBREAKER", size, 24 + gap, cap)
    width += 24 + gap
    top = min(0, icon_y)
    height = max(cap, icon_y + icon_h) - top
    for suffix, c in THEMES.items():
        write(
            f"logo{suffix}.svg",
            (-1, top - 1, width + 2, height + 2),
            2,
            f"""<title>Icebreaker</title>
<g transform="translate({icon_x:.3f} {icon_y:.3f}) scale({icon_h / 24:.5f})" fill="none" stroke="{c['fg']}" stroke-width="1.25" stroke-linejoin="round">
{SHIP}
</g>
<path fill="{c['fg']}" d="{text}"/>""",
        )


def tag(font, name, text, icon_svg, color):
    size, pad_x, height, icon, gap = 11, 9, 22, 12, 5
    xh = x_height(font, size)
    baseline = (height + xh) / 2  # lowercase text: center the x-height
    text_x = pad_x + icon + gap
    label, width = outline(font, text, size, text_x, baseline, 0.02)
    width += text_x + pad_x
    r = height / 2
    for suffix, c in THEMES.items():
        write(
            f"{name}{suffix}.svg",
            (0, 0, width, height),
            2,
            f"""<title>{text}</title>
<rect x=".5" y=".5" width="{width - 1:.3f}" height="{height - 1}" rx="{r - .5}" fill="{c[color]}" fill-opacity=".08" stroke="{c[color]}" stroke-opacity=".6"/>
<g transform="translate({pad_x} {(height - icon) / 2}) scale({icon / 24})" fill="none" stroke="{c[color]}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
{icon_svg}
</g>
<path fill="{c[color]}" d="{label}"/>""",
        )


logo(fetch_font(400))
tag_font = fetch_font(500)
tag(tag_font, "tag", "experimental", FLASK, "accent")
tag(tag_font, "tag-handwritten", "handwritten", PEN, "primary")
