#!/usr/bin/env python3
"""Create a Chrome Web Store ZIP without Firefox-only manifest settings."""

import json
from pathlib import Path
import zipfile


ROOT = Path(__file__).resolve().parents[1]
manifest = json.loads((ROOT / "manifest.json").read_text())
manifest.pop("browser_specific_settings", None)
manifest["minimum_chrome_version"] = "111"

output = ROOT / "dist" / f"42-events-chrome-{manifest['version']}.zip"
output.parent.mkdir(exist_ok=True)
with zipfile.ZipFile(output, "w", compression=zipfile.ZIP_DEFLATED) as archive:
    archive.writestr("manifest.json", json.dumps(manifest, indent=2) + "\n")
    for name in ("icon.png", "index.html", "libs/jquery-3.7.1.min.js", "scripts/index.js", "PRIVACY.md"):
        archive.write(ROOT / name, name)
print(output)
