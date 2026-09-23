#!/bin/sh
# Regenerate public/diagrams/schema-preview.svg from the current release.
# Needs d2 on PATH (brew install d2).
#
# elk+layered is the only combination that anchors an edge to the row it
# references; mrtree and stress lay out more densely but land arrows anywhere
# on the box.
set -eu
cd "$(dirname "$0")"

tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT

{ echo "direction: right"; python3 gen_schema_d2.py; } > "$tmp/schema.d2"
d2 --layout=elk --theme=0 --pad=10 \
   --elk-nodeNodeBetweenLayers=30 --elk-edgeNodeBetweenLayers=20 \
   "$tmp/schema.d2" "$tmp/plain.svg"
python3 tint_rows.py "$tmp/plain.svg" ../public/diagrams/schema-preview.svg

echo "wrote public/diagrams/schema-preview.svg"
