#!/bin/zsh

set -euo pipefail

HELPER_ROOT="${0:A:h:h:h}"
PREPARE_SCRIPT="$HELPER_ROOT/scripts/prepare-video-tools.sh"
TEST_ROOT="$(mktemp -d "${TMPDIR:-/tmp}/x-download-toolchain-test.XXXXXX")"
trap 'rm -rf "$TEST_ROOT"' EXIT

fail() {
  print -u2 "工具准备测试失败：$1"
  exit 1
}

assert_file_content() {
  local path="$1"
  local expected="$2"
  [[ -f "$path" ]] || fail "缺少文件 $path"
  [[ "$(<"$path")" == "$expected" ]] || fail "文件内容被意外替换：$path"
}

run_prepare() {
  local output_dir="$1"
  local yt_source="$2"
  local ffmpeg_source="$3"
  local yt_hash="$4"
  local ffmpeg_hash="$5"
  local yt_version="$6"
  local ffmpeg_version="$7"
  local ffmpeg_arch="$8"

  zsh "$PREPARE_SCRIPT" \
    --test-fixture \
    --output-dir "$output_dir" \
    --yt-dlp-source "$yt_source" \
    --ffmpeg-source "$ffmpeg_source" \
    --yt-dlp-sha256 "$yt_hash" \
    --ffmpeg-sha256 "$ffmpeg_hash" \
    --yt-dlp-version "$yt_version" \
    --ffmpeg-version "$ffmpeg_version" \
    --ffmpeg-arch "$ffmpeg_arch"
}

[[ -x "$PREPARE_SCRIPT" ]] || fail "准备脚本不存在或不可执行"

FIXTURES="$TEST_ROOT/fixtures"
OUTPUT="$TEST_ROOT/output"
mkdir -p "$FIXTURES" "$OUTPUT"

LOCAL_FFMPEG_ARCHIVE="$FIXTURES/ffmpeg-9.0.2.tar.xz"
print -r -- 'local ffmpeg archive fixture' > "$LOCAL_FFMPEG_ARCHIVE"
RESOLVED_ARCHIVE="$(zsh "$PREPARE_SCRIPT" --print-ffmpeg-archive-source --ffmpeg-archive-source "$LOCAL_FFMPEG_ARCHIVE")"
[[ "$RESOLVED_ARCHIVE" == "$LOCAL_FFMPEG_ARCHIVE" ]] || fail "未优先使用本地 FFmpeg 归档"

YT_SOURCE="$FIXTURES/yt-dlp"
FFMPEG_SOURCE="$FIXTURES/ffmpeg"
print -r -- '#!/bin/zsh' > "$YT_SOURCE"
print -r -- '[[ " $* " == *" --version "* ]] && print 2026.08.19' >> "$YT_SOURCE"
print -r -- '#!/bin/zsh' > "$FFMPEG_SOURCE"
print -r -- '[[ " $* " == *" -version "* ]] && print "ffmpeg version 9.0.2 fixture"' >> "$FFMPEG_SOURCE"
chmod 755 "$YT_SOURCE" "$FFMPEG_SOURCE"
YT_HASH="$(shasum -a 256 "$YT_SOURCE" | cut -d ' ' -f 1)"
FFMPEG_HASH="$(shasum -a 256 "$FFMPEG_SOURCE" | cut -d ' ' -f 1)"

run_prepare "$OUTPUT" "$YT_SOURCE" "$FFMPEG_SOURCE" "$YT_HASH" "$FFMPEG_HASH" "2026.08.19" "9.0.2" "arm64"
[[ -x "$OUTPUT/yt-dlp" ]] || fail "成功准备后 yt-dlp 不可执行"
[[ -x "$OUTPUT/ffmpeg" ]] || fail "成功准备后 ffmpeg 不可执行"

OLD_YT="$OUTPUT/yt-dlp"
OLD_FFMPEG="$OUTPUT/ffmpeg"
print -r -- 'old yt-dlp' > "$OLD_YT"
print -r -- 'old ffmpeg' > "$OLD_FFMPEG"
chmod 755 "$OLD_YT" "$OLD_FFMPEG"

MUTATED_YT="$TEST_ROOT/mutated-yt-dlp"
print -r -- 'mutated yt-dlp' > "$MUTATED_YT"
if run_prepare "$OUTPUT" "$MUTATED_YT" "$FFMPEG_SOURCE" "$YT_HASH" "$FFMPEG_HASH" "2026.08.19" "9.0.2" "arm64"; then
  fail "错误 yt-dlp SHA-256 未被拒绝"
fi
assert_file_content "$OLD_YT" 'old yt-dlp'
assert_file_content "$OLD_FFMPEG" 'old ffmpeg'

WRONG_YT_SOURCE="$TEST_ROOT/wrong-version-yt-dlp"
print -r -- '#!/bin/zsh' > "$WRONG_YT_SOURCE"
print -r -- '[[ " $* " == *" --version "* ]] && print 2026.08.20' >> "$WRONG_YT_SOURCE"
chmod 755 "$WRONG_YT_SOURCE"
WRONG_YT_HASH="$(shasum -a 256 "$WRONG_YT_SOURCE" | cut -d ' ' -f 1)"
if run_prepare "$OUTPUT" "$WRONG_YT_SOURCE" "$FFMPEG_SOURCE" "$WRONG_YT_HASH" "$FFMPEG_HASH" "2026.08.19" "9.0.2" "arm64"; then
  fail "错误 yt-dlp 版本未被拒绝"
fi
assert_file_content "$OLD_YT" 'old yt-dlp'

if run_prepare "$OUTPUT" "$YT_SOURCE" "$FFMPEG_SOURCE" "$YT_HASH" "$FFMPEG_HASH" "2026.08.19" "9.0.2" "x86_64"; then
  fail "仅 x86_64 的 FFmpeg 未被拒绝"
fi
assert_file_content "$OLD_YT" 'old yt-dlp'
assert_file_content "$OLD_FFMPEG" 'old ffmpeg'

print "工具准备行为测试通过"
