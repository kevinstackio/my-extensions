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

# 正式产物直接写入固定目录；Debug 构建成功后再发布到独立开发启动目录。
OUTPUT_ARGUMENTS=()
if [[ "$MODE" == 'build' ]]; then
  OUTPUT_ARGUMENTS=("CONFIGURATION_BUILD_DIR=$ROOT_DIR/dist")
fi

xcodebuild build \
  -project exts.xcodeproj \
  -scheme exts \
  -sdk macosx \
  -configuration "$CONFIGURATION" \
  -derivedDataPath "$ROOT_DIR/DerivedData" \
  "${OUTPUT_ARGUMENTS[@]}" \
  CODE_SIGNING_ALLOWED=NO

if [[ "$MODE" == 'dev' ]]; then
  # 从完整 Debug 包发布，避免继续使用旧 DerivedData 路径的系统图标记录。
  DEV_DIR="$ROOT_DIR/dist/dev"
  mkdir -p "$DEV_DIR"
  STAGING_DIR="$(mktemp -d "$DEV_DIR/.exts-publish.XXXXXX")"
  trap 'rm -rf "$STAGING_DIR"' EXIT
  ditto "$ROOT_DIR/DerivedData/Build/Products/Debug/exts.app" "$STAGING_DIR/Exts.app"
  /usr/libexec/PlistBuddy -c 'Print CFBundleIconName' "$STAGING_DIR/Exts.app/Contents/Info.plist" >/dev/null
  test -f "$STAGING_DIR/Exts.app/Contents/Resources/exts.icns"
  # 清理被替代的旧图标，仅操作本次暂存的生成产物。
  rm -f "$STAGING_DIR/Exts.app/Contents/Resources/AppIcon.icns"
  if [[ -e "$DEV_DIR/Exts.app" ]]; then
    mv "$DEV_DIR/Exts.app" "$STAGING_DIR/previous.app"
  fi
  if ! mv "$STAGING_DIR/Exts.app" "$DEV_DIR/Exts.app"; then
    if [[ -e "$STAGING_DIR/previous.app" ]]; then
      mv "$STAGING_DIR/previous.app" "$DEV_DIR/Exts.app"
    fi
    exit 1
  fi
  open "$DEV_DIR/Exts.app"
else
  print "桌面构建产物：$ROOT_DIR/dist/exts.app"
fi
