#!/bin/zsh
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
REPOSITORY_DIR="$(cd "$ROOT_DIR/../.." && pwd)"
DERIVED_DATA_DIR="$REPOSITORY_DIR/dist/.cache/desktop/DerivedData"
cd "$ROOT_DIR"

if [[ "$(uname -s)" != 'Darwin' ]]; then
  print -u2 '桌面应用需要在 macOS 上运行和构建'
  exit 1
fi
VERSION="$(node "$REPOSITORY_DIR/scripts/version.mjs")"

MODE="${1:-dev}"
case "$MODE" in
  dev)
    CONFIGURATION="Debug"
    OUTPUT_DIR="$REPOSITORY_DIR/dist/dev"
    APP_NAME='exts-dev.app'
    BUNDLE_ID='dev.linguio.exts.dev'
    ;;
  build)
    CONFIGURATION="Release"
    OUTPUT_DIR="$REPOSITORY_DIR/dist/build"
    APP_NAME='exts.app'
    BUNDLE_ID='dev.linguio.exts'
    ;;
  *) print -u2 '桌面命令仅支持 dev 或 build 模式'; exit 2 ;;
esac

xcodegen generate

xcodebuild build \
  -project exts.xcodeproj \
  -scheme exts \
  -sdk macosx \
  -configuration "$CONFIGURATION" \
  -derivedDataPath "$DERIVED_DATA_DIR" \
  "EXTS_BUILD_VERSION=$VERSION" \
  "MARKETING_VERSION=$VERSION" \
  "CURRENT_PROJECT_VERSION=$VERSION" \
  CODE_SIGNING_ALLOWED=NO

# 两种模式均从完整包发布，编译缓存和符号产物不进入公共输出目录。
mkdir -p "$OUTPUT_DIR"
STAGING_DIR="$(mktemp -d "$OUTPUT_DIR/.exts-publish.XXXXXX")"
trap 'rm -rf "$STAGING_DIR"' EXIT
ditto "$DERIVED_DATA_DIR/Build/Products/$CONFIGURATION/exts.app" "$STAGING_DIR/$APP_NAME"
APP_PLIST="$STAGING_DIR/$APP_NAME/Contents/Info.plist"
/usr/libexec/PlistBuddy -c 'Print CFBundleIconName' "$APP_PLIST" >/dev/null
test -f "$STAGING_DIR/$APP_NAME/Contents/Resources/exts.icns"
test "$(/usr/libexec/PlistBuddy -c 'Print CFBundleIdentifier' "$APP_PLIST")" = "$BUNDLE_ID"
test "$(/usr/libexec/PlistBuddy -c 'Print CFBundleShortVersionString' "$APP_PLIST")" = "$VERSION"
test "$(/usr/libexec/PlistBuddy -c 'Print CFBundleVersion' "$APP_PLIST")" = "$VERSION"
test "$(node "$REPOSITORY_DIR/scripts/version.mjs")" = "$VERSION"
rm -f "$STAGING_DIR/$APP_NAME/Contents/Resources/AppIcon.icns"
if [[ -e "$OUTPUT_DIR/$APP_NAME" ]]; then
  mv "$OUTPUT_DIR/$APP_NAME" "$STAGING_DIR/previous.app"
fi
if ! mv "$STAGING_DIR/$APP_NAME" "$OUTPUT_DIR/$APP_NAME"; then
  if [[ -e "$STAGING_DIR/previous.app" ]]; then
    if ! mv "$STAGING_DIR/previous.app" "$OUTPUT_DIR/$APP_NAME"; then
      # 回滚异常保留备份，禁止退出时删掉上一份应用。
      trap - EXIT
      print -u2 "应用替换失败，旧应用保留在 $STAGING_DIR/previous.app"
    fi
  fi
  exit 1
fi
print "桌面构建产物：$OUTPUT_DIR/$APP_NAME"
if [[ "$MODE" == 'dev' ]]; then
  open "$OUTPUT_DIR/$APP_NAME"
fi
