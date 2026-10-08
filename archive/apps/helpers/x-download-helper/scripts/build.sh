#!/bin/zsh

set -euo pipefail

HELPER_ROOT="${0:A:h:h}"
VENDOR_TOOLS="$HELPER_ROOT/VendorTools"
LICENSES="$HELPER_ROOT/Tools/THIRD_PARTY_NOTICES.md"

[[ -x "$VENDOR_TOOLS/yt-dlp" ]] || { print -u2 "缺少 yt-dlp，请先运行 scripts/prepare-video-tools.sh"; exit 1; }
[[ -x "$VENDOR_TOOLS/ffmpeg" ]] || { print -u2 "缺少 ffmpeg，请先运行 scripts/prepare-video-tools.sh"; exit 1; }
[[ -f "$LICENSES" ]] || { print -u2 "缺少第三方许可文件：$LICENSES"; exit 1; }

xcodebuild \
  -project "$HELPER_ROOT/XDownloadHelper.xcodeproj" \
  -scheme XDownloadHelper \
  -configuration Debug \
  -derivedDataPath "$HELPER_ROOT/.build" \
  CODE_SIGNING_ALLOWED=NO \
  build

# 某些 Xcode 版本不会按自定义 Copy Files 目录放置工具，构建后再次校正 App Bundle 路径。
APP_BUNDLE="$HELPER_ROOT/.build/Build/Products/Debug/X Download Helper.app"
BUILT_HOST="$HELPER_ROOT/.build/Build/Products/Debug/x-download-native-host"
EMBEDDED_HOST="$APP_BUNDLE/Contents/Helpers/x-download-native-host"
if [[ -x "$BUILT_HOST" ]]; then
  mkdir -p "${EMBEDDED_HOST:h}"
  cp "$BUILT_HOST" "$EMBEDDED_HOST"
  chmod 755 "$EMBEDDED_HOST"
fi
