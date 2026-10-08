#!/bin/zsh

set -euo pipefail

HOST_NAME="dev.kevinstack.xdownloadhelper.nativehost"
TARGET_ROOT="${1:-$HOME}"

for browser in Google/Chrome Microsoft\ Edge; do
  manifest_path="$TARGET_ROOT/Library/Application Support/$browser/NativeMessagingHosts/$HOST_NAME.json"
  [[ -e "$manifest_path" ]] && rm "$manifest_path"
done

print "Native Host 已从 Chrome 和 Edge 当前用户配置中移除"
