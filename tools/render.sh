#!/bin/sh
# Regenerate the schema diagrams in public/diagrams/, one per schema peekbank
# has had. Needs d2 on PATH (brew install d2).
#
# schema-2021.svg covers 2021.0 through 2022.1 and is pinned to v1.1 (2022.1).
# schema-2025.svg covers 2025.1 onward and follows the latest release.
#
# elk+layered is the only combination that anchors an edge to the row it
# references; mrtree and stress lay out more densely but land arrows anywhere
# on the box.
set -eu
cd "$(dirname "$0")"

tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT

# render OUTPUT [REDIVIS_TAG]
render() {
  out=$1; shift
  { echo "direction: right"; python3 gen_schema_d2.py "$@"; } > "$tmp/schema.d2"
  d2 --layout=elk --theme=0 --pad=10 \
     --elk-nodeNodeBetweenLayers=30 --elk-edgeNodeBetweenLayers=20 \
     "$tmp/schema.d2" "$tmp/plain.svg"
  python3 tint_rows.py "$tmp/plain.svg" "$out"
  echo "wrote $out"
}

render ../public/diagrams/schema-2021.svg v1.1
render ../public/diagrams/schema-2025.svg
