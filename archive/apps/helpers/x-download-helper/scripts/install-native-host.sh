#!/bin/zsh

set -euo pipefail

HELPER_ROOT="${0:A:h:h}"
APP_BUNDLE="${X_DOWNLOAD_HELPER_APP:-$HELPER_ROOT/.build/Build/Products/Debug/X Download Helper.app}"
BRIDGE="$APP_BUNDLE/Contents/Helpers/x-download-native-host"
TEMPLATE="$HELPER_ROOT/NativeMessaging/dev.kevinstack.xdownloadhelper.nativehost.json.template"
HOST_NAME="dev.kevinstack.xdownloadhelper.nativehost"
TARGET_ROOT="${1:-$HOME}"

[[ -f "$TEMPLATE" ]] || { print -u2 "缺少 Native Host 模板"; exit 1; }
[[ -x "$BRIDGE" ]] || { print -u2 "缺少可执行 Bridge，请先构建 Helper"; exit 1; }
[[ "$BRIDGE" == /* ]] || { print -u2 "Bridge 路径必须是绝对路径"; exit 1; }

for browser in Google/Chrome Microsoft\ Edge; do
  manifest_dir="$TARGET_ROOT/Library/Application Support/$browser/NativeMessagingHosts"
  mkdir -p "$manifest_dir"
  manifest_path="$manifest_dir/$HOST_NAME.json"
  sed "s|__BRIDGE_PATH__|${BRIDGE//|/\\|}|g" "$TEMPLATE" > "$manifest_path.tmp"
  mv "$manifest_path.tmp" "$manifest_path"
done

print "Native Host 已注册到 Chrome 和 Edge"
