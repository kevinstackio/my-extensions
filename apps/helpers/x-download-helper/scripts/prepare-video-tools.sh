#!/bin/zsh

set -euo pipefail

HELPER_ROOT="${0:A:h:h}"
TOOLCHAIN_ENV="$HELPER_ROOT/Tools/toolchain.env"
DEFAULT_OUTPUT_DIR="$HELPER_ROOT/VendorTools"

source "$TOOLCHAIN_ENV"

DEFAULT_FFMPEG_ARCHIVE="$HELPER_ROOT/Tools/downloads/ffmpeg-$FFMPEG_VERSION.tar.xz"

TEST_FIXTURE=0
OUTPUT_DIR="$DEFAULT_OUTPUT_DIR"
YTDLP_SOURCE=""
FFMPEG_SOURCE=""
EXPECTED_YTDLP_SHA256="$YTDLP_SHA256"
EXPECTED_FFMPEG_SHA256=""
EXPECTED_YTDLP_VERSION="$YTDLP_VERSION"
EXPECTED_FFMPEG_VERSION="$FFMPEG_VERSION"
EXPECTED_FFMPEG_ARCH="arm64"
FFMPEG_ARCHIVE_SOURCE=""
PRINT_FFMPEG_ARCHIVE_SOURCE=0

fail() {
  print -u2 "视频工具准备失败：$1"
  exit 1
}

usage() {
  print -u2 "用法：$0 [--output-dir 目录]"
  print -u2 "测试用法：$0 --test-fixture --output-dir 目录 --yt-dlp-source 文件 --ffmpeg-source 文件 --yt-dlp-sha256 摘要 --ffmpeg-sha256 摘要 --yt-dlp-version 版本 --ffmpeg-version 版本 --ffmpeg-arch 架构"
  exit 2
}

while (( $# > 0 )); do
  case "$1" in
    --test-fixture)
      TEST_FIXTURE=1
      shift
      ;;
    --output-dir)
      (( $# >= 2 )) || usage
      OUTPUT_DIR="$2"
      shift 2
      ;;
    --yt-dlp-source)
      (( $# >= 2 )) || usage
      YTDLP_SOURCE="$2"
      shift 2
      ;;
    --ffmpeg-source)
      (( $# >= 2 )) || usage
      FFMPEG_SOURCE="$2"
      shift 2
      ;;
    --yt-dlp-sha256)
      (( $# >= 2 )) || usage
      EXPECTED_YTDLP_SHA256="$2"
      shift 2
      ;;
    --ffmpeg-sha256)
      (( $# >= 2 )) || usage
      EXPECTED_FFMPEG_SHA256="$2"
      shift 2
      ;;
    --yt-dlp-version)
      (( $# >= 2 )) || usage
      EXPECTED_YTDLP_VERSION="$2"
      shift 2
      ;;
    --ffmpeg-version)
      (( $# >= 2 )) || usage
      EXPECTED_FFMPEG_VERSION="$2"
      shift 2
      ;;
    --ffmpeg-arch)
      (( $# >= 2 )) || usage
      EXPECTED_FFMPEG_ARCH="$2"
      shift 2
      ;;
    --ffmpeg-archive-source)
      (( $# >= 2 )) || usage
      FFMPEG_ARCHIVE_SOURCE="$2"
      shift 2
      ;;
    --print-ffmpeg-archive-source)
      PRINT_FFMPEG_ARCHIVE_SOURCE=1
      shift
      ;;
    *)
      usage
      ;;
  esac
done

resolve_ffmpeg_archive() {
  if [[ -n "$FFMPEG_ARCHIVE_SOURCE" ]]; then
    [[ -f "$FFMPEG_ARCHIVE_SOURCE" ]] || fail "FFmpeg 本地归档不存在：$FFMPEG_ARCHIVE_SOURCE"
    print -r -- "$FFMPEG_ARCHIVE_SOURCE"
    return
  fi
  if [[ -f "$DEFAULT_FFMPEG_ARCHIVE" ]]; then
    print -r -- "$DEFAULT_FFMPEG_ARCHIVE"
    return
  fi
  print -r -- "$FFMPEG_SOURCE_URL"
}

if (( PRINT_FFMPEG_ARCHIVE_SOURCE )); then
  resolve_ffmpeg_archive
  exit 0
fi

if (( TEST_FIXTURE )); then
  [[ -n "$YTDLP_SOURCE" && -n "$FFMPEG_SOURCE" && -n "$EXPECTED_FFMPEG_SHA256" ]] || usage
fi

TEMP_ROOT="$(mktemp -d "${TMPDIR:-/tmp}/x-download-toolchain.XXXXXX")"
trap 'rm -rf "$TEMP_ROOT"' EXIT
STAGING_DIR="$TEMP_ROOT/staging"
mkdir -p "$STAGING_DIR"

sha256_of() {
  shasum -a 256 "$1" | cut -d ' ' -f 1
}

assert_sha256() {
  local file_path="$1"
  local expected="$2"
  local actual
  actual="$(sha256_of "$file_path")"
  [[ "$actual" == "$expected" ]] || fail "SHA-256 不匹配：$file_path"
}

assert_version() {
  local executable="$1"
  local expected="$2"
  shift 2
  local output
  output="$("$executable" "$@" 2>&1)" || fail "工具执行失败：$executable"
  [[ "$output" == *"$expected"* ]] || fail "版本不匹配：$executable，实际输出为 $output"
}

prepare_ytdlp() {
  local destination="$STAGING_DIR/yt-dlp"
  if [[ -n "$YTDLP_SOURCE" ]]; then
    cp "$YTDLP_SOURCE" "$destination"
  else
    command -v curl >/dev/null 2>&1 || fail "缺少 curl"
    curl -L --fail --silent --show-error "$YTDLP_URL" -o "$destination"
  fi
  assert_sha256 "$destination" "$EXPECTED_YTDLP_SHA256"
  chmod 755 "$destination"
  assert_version "$destination" "$EXPECTED_YTDLP_VERSION" --ignore-config --no-update --version
}

prepare_ffmpeg_fixture() {
  local destination="$STAGING_DIR/ffmpeg"
  cp "$FFMPEG_SOURCE" "$destination"
  assert_sha256 "$destination" "$EXPECTED_FFMPEG_SHA256"
  [[ "$EXPECTED_FFMPEG_ARCH" == "arm64" ]] || fail "FFmpeg 架构不受支持：$EXPECTED_FFMPEG_ARCH"
  chmod 755 "$destination"
  assert_version "$destination" "$EXPECTED_FFMPEG_VERSION" -version
}

prepare_ffmpeg() {
  local archive="$TEMP_ROOT/ffmpeg.tar.xz"
  local source_dir="$TEMP_ROOT/ffmpeg-$FFMPEG_VERSION"
  local install_dir="$TEMP_ROOT/ffmpeg-install"
  local clang_path
  local sdk_path
  local source_path
  command -v curl >/dev/null 2>&1 || fail "缺少 curl"
  command -v xcrun >/dev/null 2>&1 || fail "缺少 xcrun"
  command -v make >/dev/null 2>&1 || fail "缺少 make"
  command -v lipo >/dev/null 2>&1 || fail "缺少 lipo"
  source_path="$(resolve_ffmpeg_archive)"
  if [[ "$source_path" == http://* || "$source_path" == https://* ]]; then
    curl -L --fail --silent --show-error "$source_path" -o "$archive"
  else
    cp "$source_path" "$archive"
  fi
  assert_sha256 "$archive" "$FFMPEG_SOURCE_SHA256"
  tar -xf "$archive" -C "$TEMP_ROOT"
  [[ -d "$source_dir" ]] || fail "FFmpeg 源码目录不存在：$source_dir"
  clang_path="$(xcrun --find clang)"
  sdk_path="$(xcrun --sdk macosx --show-sdk-path)"
  mkdir -p "$install_dir"
  (
    cd "$source_dir"
    ./configure \
      --prefix="$install_dir" \
      --arch=arm64 \
      --target-os=darwin \
      --sysroot="$sdk_path" \
      --cc="$clang_path" \
      --host-cc="$clang_path" \
      --host-cflags="-isysroot $sdk_path" \
      --host-ldflags="-isysroot $sdk_path" \
      --disable-doc \
      --disable-debug \
      --disable-ffplay \
      --disable-ffprobe \
      --disable-autodetect \
      --disable-shared \
      --enable-static \
      --disable-everything \
      --enable-protocol=file \
      --enable-demuxer=mov,mpegts \
      --enable-muxer=mp4 \
      --enable-parser=aac,h264,hevc \
      --enable-bsf=aac_adtstoasc,h264_mp4toannexb,hevc_mp4toannexb
    make -j"$(sysctl -n hw.ncpu)"
    make install
  )
  [[ -x "$install_dir/bin/ffmpeg" ]] || fail "未生成 FFmpeg 可执行文件"
  [[ "$(lipo -archs "$install_dir/bin/ffmpeg")" == *"arm64"* ]] || fail "生成的 FFmpeg 不包含 arm64"
  cp "$install_dir/bin/ffmpeg" "$STAGING_DIR/ffmpeg"
  chmod 755 "$STAGING_DIR/ffmpeg"
  assert_version "$STAGING_DIR/ffmpeg" "$FFMPEG_VERSION" -version
}

prepare_ytdlp
if (( TEST_FIXTURE )); then
  prepare_ffmpeg_fixture
else
  prepare_ffmpeg
fi

mkdir -p "$OUTPUT_DIR"
mv "$STAGING_DIR/yt-dlp" "$OUTPUT_DIR/yt-dlp"
mv "$STAGING_DIR/ffmpeg" "$OUTPUT_DIR/ffmpeg"
print "视频工具准备完成：$OUTPUT_DIR"
