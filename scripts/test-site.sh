#!/usr/bin/env bash
set -euo pipefail

repository_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repository_root"

bash scripts/setup-pdf-environment.sh
node scripts/prebuild-bibliography.js --check
bash scripts/build-site.sh production
npm --prefix scripts run test:content
node scripts/generate-cv-pdf.js --file --prepared-date 2026-07-29
npm --prefix scripts run test:pdf
