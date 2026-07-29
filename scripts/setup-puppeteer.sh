#!/usr/bin/env bash
set -euo pipefail

repository_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repository_root"

if npm --prefix scripts run browser:verify; then
  exit 0
fi

echo "Chrome is missing or incomplete; reinstalling the project-local browser."
npm --prefix scripts run browser:clean
npm --prefix scripts run browser:install
npm --prefix scripts run browser:verify
