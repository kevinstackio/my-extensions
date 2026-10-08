#!/bin/zsh

set -euo pipefail

HELPER_ROOT="${0:A:h:h}"
APP_BUNDLE="$HELPER_ROOT/.build/Build/Products/Debug/X Download Helper.app"

"$HELPER_ROOT/scripts/build.sh"
open "$APP_BUNDLE"
