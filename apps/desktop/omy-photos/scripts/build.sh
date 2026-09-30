#!/bin/zsh
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

xcodegen generate
xcodebuild build \
  -project OmyPhotos.xcodeproj \
  -scheme OmyPhotos \
  -sdk macosx \
  -configuration Debug \
  -derivedDataPath "$ROOT_DIR/DerivedData" \
  CODE_SIGNING_ALLOWED=NO
