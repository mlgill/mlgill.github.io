#!/usr/bin/env bash
set -euo pipefail

repository_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repository_root"

if [[ $# -ne 1 ]] || [[ "$1" != "development" && "$1" != "production" ]]; then
  echo "Usage: $0 <development|production>" >&2
  exit 2
fi

if command -v rbenv >/dev/null 2>&1; then
  eval "$(rbenv init -)"
fi

build_environment="$1"

node scripts/prebuild-bibliography.js
JEKYLL_ENV="$build_environment" bundle exec jekyll clean
JEKYLL_ENV="$build_environment" bundle exec jekyll build --trace
