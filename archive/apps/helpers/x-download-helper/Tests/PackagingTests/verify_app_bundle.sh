#!/bin/zsh

set -euo pipefail

HELPER_ROOT="${0:A:h:h:h}"
BUILD_SCRIPT="$HELPER_ROOT/scripts/build.sh"
APP_BUNDLE="$HELPER_ROOT/.build/Build/Products/Debug/X Download Helper.app"
INFO_PLIST="$APP_BUNDLE/Contents/Info.plist"
EXECUTABLE="$APP_BUNDLE/Contents/MacOS/X Download Helper"
NATIVE_HOST="$APP_BUNDLE/Contents/Helpers/x-download-native-host"
ASSET_CATALOG="$APP_BUNDLE/Contents/Resources/Assets.car"

fail() {
  print -u2 "打包验证失败：$1"
  exit 1
}

[[ -x "$BUILD_SCRIPT" ]] || fail "缺少可执行的构建脚本 $BUILD_SCRIPT"

"$BUILD_SCRIPT"

[[ -d "$APP_BUNDLE" ]] || fail "未生成 App Bundle"
[[ -x "$EXECUTABLE" ]] || fail "未生成可执行文件"
[[ -x "$NATIVE_HOST" ]] || fail "未生成 Native Messaging Bridge"
[[ -f "$INFO_PLIST" ]] || fail "未生成 Info.plist"
[[ -f "$ASSET_CATALOG" ]] || fail "未编译菜单栏图标资源"

[[ "$(/usr/libexec/PlistBuddy -c 'Print :CFBundleName' "$INFO_PLIST")" == "X Download Helper" ]] || fail "产品名称不正确"
[[ "$(/usr/libexec/PlistBuddy -c 'Print :CFBundleIdentifier' "$INFO_PLIST")" == "dev.kevinstack.xdownloadhelper" ]] || fail "Bundle Identifier 不正确"
[[ "$(/usr/libexec/PlistBuddy -c 'Print :LSMinimumSystemVersion' "$INFO_PLIST")" == "14.0" ]] || fail "最低 macOS 版本不正确"
[[ "$(/usr/libexec/PlistBuddy -c 'Print :LSUIElement' "$INFO_PLIST")" == "true" ]] || fail "LSUIElement 未启用"

print "App Bundle 配置验证通过"
