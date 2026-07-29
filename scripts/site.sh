#!/usr/bin/env bash
set -euo pipefail

repository_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repository_root"

usage() {
  echo "Usage: $0 build <development|production> | netlify | test | serve" >&2
}

require_no_arguments() {
  local command_name="$1"
  local argument_count="$2"

  if [[ "$argument_count" -ne 0 ]]; then
    echo "$command_name does not accept arguments." >&2
    usage
    exit 2
  fi
}

initialize_ruby() {
  if command -v rbenv >/dev/null 2>&1; then
    eval "$(rbenv init -)"
  fi
}

build_site() {
  local build_environment="$1"

  if [[ "$build_environment" != "development" && "$build_environment" != "production" ]]; then
    echo "Build environment must be development or production." >&2
    usage
    exit 2
  fi

  initialize_ruby
  node scripts/prebuild-bibliography.js
  JEKYLL_ENV="$build_environment" bundle exec jekyll clean
  JEKYLL_ENV="$build_environment" bundle exec jekyll build --trace
}

prepare_pdf_environment() {
  bash scripts/setup-pdf-environment.sh
}

generate_pdfs() {
  node scripts/generate-cv-pdf.js --file "$@"
}

verify_pdfs() {
  test -s _site/assets/pdf/GillMichelle_DescriptiveCV.pdf
  test -s _site/assets/pdf/GillMichelle_ConciseCV.pdf
}

if [[ "$#" -lt 1 ]]; then
  usage
  exit 2
fi

site_command="$1"
shift

case "$site_command" in
  build)
    if [[ "$#" -ne 1 ]]; then
      usage
      exit 2
    fi
    build_site "$1"
    ;;
  netlify)
    require_no_arguments "$site_command" "$#"
    prepare_pdf_environment
    build_site production
    generate_pdfs
    verify_pdfs
    ;;
  test)
    require_no_arguments "$site_command" "$#"
    prepare_pdf_environment
    node scripts/prebuild-bibliography.js --check
    build_site production
    npm --prefix scripts run test:content
    generate_pdfs --prepared-date 2026-07-29
    npm --prefix scripts run test:pdf
    ;;
  serve)
    require_no_arguments "$site_command" "$#"
    prepare_pdf_environment
    build_site development
    generate_pdfs
    verify_pdfs
    echo "Serving the built site at http://localhost:4000"
    echo "Press Ctrl+C to stop."
    cd _site
    exec python3 -m http.server 4000
    ;;
  *)
    echo "Unknown command: $site_command" >&2
    usage
    exit 2
    ;;
esac
