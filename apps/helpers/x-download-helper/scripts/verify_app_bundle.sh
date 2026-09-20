#!/bin/zsh

set -euo pipefail

HELPER_ROOT="${0:A:h:h}"
APP_BUNDLE="${1:-$HELPER_ROOT/.build/Build/Products/Debug/X Download Helper.app}"
TOOLS_ROOT="$APP_BUNDLE/Contents/Resources/Tools"

fail() {
  print -u2 "Helper Bundle 验证失败：$1"
  exit 1
}

assert_version() {
  local executable="$1"
  local expected="$2"
  shift 2
  local output
  output="$($executable "$@" 2>&1)" || fail "工具执行失败：$executable"
  [[ "$output" == *"$expected"* ]] || fail "版本不匹配：$executable，实际输出为 $output"
}

[[ -d "$APP_BUNDLE" ]] || fail "Bundle 不存在：$APP_BUNDLE"
[[ -f "$TOOLS_ROOT/yt-dlp" ]] || fail "缺少 Bundle 工具：yt-dlp"
[[ -f "$TOOLS_ROOT/ffmpeg" ]] || fail "缺少 Bundle 工具：ffmpeg"
[[ -f "$TOOLS_ROOT/THIRD_PARTY_NOTICES.md" ]] || fail "缺少 Bundle 许可文件"
[[ -x "$TOOLS_ROOT/yt-dlp" ]] || fail "yt-dlp 不可执行"
[[ -x "$TOOLS_ROOT/ffmpeg" ]] || fail "ffmpeg 不可执行"

assert_version "$TOOLS_ROOT/yt-dlp" "2026.08.19" --ignore-config --no-update --version
assert_version "$TOOLS_ROOT/ffmpeg" "9.0.2" -version
[[ "$(lipo -archs "$TOOLS_ROOT/ffmpeg")" == *"arm64"* ]] || fail "ffmpeg 不包含 arm64"

print "Helper Bundle 工具验证通过：$TOOLS_ROOT"
