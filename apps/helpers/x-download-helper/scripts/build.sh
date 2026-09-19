#!/bin/zsh

set -euo pipefail

HELPER_ROOT="${0:A:h:h}"

exec xcodebuild \
  -project "$HELPER_ROOT/XDownloadHelper.xcodeproj" \
  -scheme XDownloadHelper \
  -configuration Debug \
  -derivedDataPath "$HELPER_ROOT/.build" \
  CODE_SIGNING_ALLOWED=NO \
  build
