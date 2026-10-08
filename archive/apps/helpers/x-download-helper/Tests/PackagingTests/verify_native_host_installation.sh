#!/bin/zsh

set -euo pipefail

HELPER_ROOT="${0:A:h:h:h}"
TMP_ROOT="$(mktemp -d)"
trap 'rm -rf "$TMP_ROOT"' EXIT

fake_app="$TMP_ROOT/X Download Helper.app"
mkdir -p "$fake_app/Contents/Helpers"
touch "$fake_app/Contents/Helpers/x-download-native-host"
chmod 755 "$fake_app/Contents/Helpers/x-download-native-host"

X_DOWNLOAD_HELPER_APP="$fake_app" "$HELPER_ROOT/scripts/install-native-host.sh" "$TMP_ROOT"
for browser in Google/Chrome Microsoft\ Edge; do
  manifest="$TMP_ROOT/Library/Application Support/$browser/NativeMessagingHosts/dev.kevinstack.xdownloadhelper.nativehost.json"
  [[ -f "$manifest" ]] || { print -u2 "缺少 $browser Host Manifest"; exit 1; }
  /usr/bin/python3 -c 'import json,sys; value=json.load(open(sys.argv[1])); assert value["name"] == "dev.kevinstack.xdownloadhelper.nativehost"; assert value["type"] == "stdio"; assert value["path"].startswith("/"); assert value["allowed_origins"] == ["chrome-extension://mdkcfihmaejbecgoinnnlkjmbpmnfekl/"]' "$manifest"
done

"$HELPER_ROOT/scripts/uninstall-native-host.sh" "$TMP_ROOT"
for browser in Google/Chrome Microsoft\ Edge; do
  [[ ! -e "$TMP_ROOT/Library/Application Support/$browser/NativeMessagingHosts/dev.kevinstack.xdownloadhelper.nativehost.json" ]] || { print -u2 "未移除 $browser Host Manifest"; exit 1; }
done

print "Native Host 安装与卸载验证通过"
