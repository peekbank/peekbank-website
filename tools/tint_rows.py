"""Shade every row that takes part in a relationship, matching its edge colour.

D2 has no per-row fill for sql_table shapes, so the bands are injected into the
rendered SVG: each table is a <g> keyed by the base64 of its name, and each row
is a <text> at the table's left edge.
"""

import base64
import re
import sys

from gen_schema_d2 import FKS, TARGET_COLOURS

ROW_HEIGHT = 36
BASELINE_OFFSET = 23  # text baseline sits this far below the row's top edge
INSET = 1  # half the table's stroke width, so the border stays visible


def tint(colour, weight=0.16):
    r, g, b = (int(colour[i:i + 2], 16) for i in (1, 3, 5))
    mix = lambda c: round(c * weight + 255 * (1 - weight))
    return f"#{mix(r):02x}{mix(g):02x}{mix(b):02x}"


def main(source, destination):
    # A foreign key takes the colour of what it points at, and so does the key
    # it points to.
    rows = {}
    for src, dst in FKS:
        colour = TARGET_COLOURS[dst.split(".")[0]]
        rows[src] = colour
        rows[dst] = colour

    svg = open(source).read()
    shaded = 0

    for table in {r.split(".")[0] for r in rows}:
        cls = base64.b64encode(table.encode()).decode()
        group = re.search(rf'<g class="{re.escape(cls)}">(.*?)</g>\s*</g>', svg, re.S)
        if not group:
            sys.exit(f"table group not found: {table}")
        group = group.group(1)

        box = re.search(
            r'<rect x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)"', group)
        x, y, width, height = (float(g) for g in box.groups())

        bands = []
        for column, colour in rows.items():
            if not column.startswith(table + "."):
                continue
            name = column.split(".", 1)[1]
            cell = re.search(
                rf'<text x="{x + 10:g}" y="([\d.]+)"[^>]*>{re.escape(name)}</text>', group)
            if not cell:
                sys.exit(f"row not found: {column}")
            top = float(cell.group(1)) - BASELINE_OFFSET
            # keep the band inside the table's border on every side
            band_top = max(top, y + INSET)
            band_bottom = min(top + ROW_HEIGHT, y + height - INSET)
            bands.append(f'<rect x="{x + INSET:g}" y="{band_top:g}" '
                         f'width="{width - 2 * INSET:g}" '
                         f'height="{band_bottom - band_top:g}" fill="{tint(colour)}" />')
            shaded += 1

        # inject after the header rect so the bands paint under the row text
        header_end = group.index("/>", group.index('class="class_header')) + 2
        svg = svg.replace(group, group[:header_end] + "".join(bands) + group[header_end:], 1)

    open(destination, "w").write(svg)
    print(f"shaded {shaded} rows")


main(sys.argv[1], sys.argv[2])
