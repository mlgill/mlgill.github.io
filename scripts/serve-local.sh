#!/bin/bash
# Local development server with CV PDF generation
# This script builds the site, generates CV PDFs, and serves locally
# Use this instead of `jekyll serve` when testing PDF generation

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

# Initialize rbenv if available
if command -v rbenv &> /dev/null; then
    eval "$(rbenv init -)"
fi

echo "==> Building Jekyll site..."
bundle exec jekyll build

echo "==> Generating CV PDFs..."
cd "$SCRIPT_DIR"
npm install --silent
node generate-cv-pdf.js --file

echo "==> Starting local server on http://localhost:4000"
echo "    Press Ctrl+C to stop"
cd "$PROJECT_DIR/_site"
python3 -m http.server 4000
