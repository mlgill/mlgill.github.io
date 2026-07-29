#!/usr/bin/env bash
set -euo pipefail

repository_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repository_root"

if command -v rbenv >/dev/null 2>&1; then
  eval "$(rbenv init -)"
fi

bundle install
npm ci
bash scripts/setup-pdf-environment.sh
