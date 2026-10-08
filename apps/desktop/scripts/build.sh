#!/bin/zsh
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

MODE="${1:-dev}"
case "$MODE" in
  dev) CONFIGURATION="Debug" ;;
  build) CONFIGURATION="Release" ;;
  *) print -u2 '桌面命令仅支持 dev 或 build 模式'; exit 2 ;;
esac

xcodegen generate

# 正式产物直接写入固定目录，开发产物沿用 Xcode 的 Debug 目录。
OUTPUT_ARGUMENTS=()
if [[ "$MODE" == 'build' ]]; then
  OUTPUT_ARGUMENTS=("CONFIGURATION_BUILD_DIR=$ROOT_DIR/dist")
fi

xcodebuild build \
  -project OhMyPhotos.xcodeproj \
  -scheme OhMyPhotos \
  -sdk macosx \
  -configuration "$CONFIGURATION" \
  -derivedDataPath "$ROOT_DIR/DerivedData" \
  "${OUTPUT_ARGUMENTS[@]}" \
  CODE_SIGNING_ALLOWED=NO

if [[ "$MODE" == 'dev' ]]; then
  open "$ROOT_DIR/DerivedData/Build/Products/Debug/OhMyPhotos.app"
else
  print "桌面构建产物：$ROOT_DIR/dist/OhMyPhotos.app"
fi
