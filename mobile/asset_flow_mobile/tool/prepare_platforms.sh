#!/usr/bin/env bash
set -euo pipefail
flutter create --platforms=android,ios,web --project-name asset_flow_mobile .
python3 - <<'PY'
from pathlib import Path
p = Path("android/app/src/main/AndroidManifest.xml")
if p.exists():
    s = p.read_text()
    permission = '    <uses-permission android:name="android.permission.CAMERA" />\n'
    if "android.permission.CAMERA" not in s:
        s = s.replace("<manifest xmlns:android=\"http://schemas.android.com/apk/res/android\">\n",
                      "<manifest xmlns:android=\"http://schemas.android.com/apk/res/android\">\n" + permission)
        p.write_text(s)
p = Path("ios/Runner/Info.plist")
if p.exists():
    s = p.read_text()
    if "NSCameraUsageDescription" not in s:
        s = s.replace("</dict>", "  <key>NSCameraUsageDescription</key>\n  <string>نحتاج إلى الكاميرا لمسح باركود الأجهزة والعُهد.</string>\n</dict>")
        p.write_text(s)
PY
