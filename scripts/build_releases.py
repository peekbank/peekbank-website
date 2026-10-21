#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = ["redivis", "pyarrow"]
# ///
"""
List every released Redivis version of the peekbank dataset with the Peekbank
release it holds, read from that version's release_info table, newest release
first.

Writes viz_src/releases.json: [{"release": "2026.1", "redivisVersion": "v1.4"}, ...]

Needs a read-only Redivis token in REDIVIS_API_TOKEN, or in .env.local.

Usage: npm run releases:pull    (also part of npm run viz:pull)
"""

import json
import os
from pathlib import Path

import redivis  # pyright: ignore[reportMissingImports]

ROOT = Path(__file__).resolve().parent.parent
for line in (
    (ROOT / ".env.local").read_text().splitlines()
    if (ROOT / ".env.local").exists()
    else []
):
    line = line.strip()
    if line and not line.startswith("#") and "=" in line:
        k, v = line.split("=", 1)
        os.environ.setdefault(k.strip(), v.strip())

org = redivis.organization("datapages")
versions = [
    v.properties
    for v in org.dataset("peekbank:a3v0").list_versions()
    if v.properties["isReleased"]
]
releases = []
for v in versions:
    info = (
        org.dataset("peekbank:a3v0", version=v["tag"])
        .table("release_info")
        .to_arrow_table(progress=False)
        .to_pylist()
    )
    releases.append({"release": info[0]["release_name"], "redivisVersion": v["tag"]})

releases.sort(key=lambda r: [int(n) for n in r["release"].split(".")], reverse=True)
(ROOT / "viz_src" / "releases.json").write_text(json.dumps(releases, indent=1) + "\n")
print(f"wrote {len(releases)} releases")
