#!/usr/bin/env bash
set -euo pipefail

repository_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repository_root"

bash scripts/setup-pdf-environment.sh
bash scripts/build-site.sh production
node scripts/generate-cv-pdf.js --file

test -s _site/assets/pdf/GillMichelle_DescriptiveCV.pdf
test -s _site/assets/pdf/GillMichelle_ConciseCV.pdf
