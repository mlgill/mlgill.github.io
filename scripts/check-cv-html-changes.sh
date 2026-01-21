#!/bin/bash
# Check which CV PDFs need regeneration by diffing rendered HTML against cached versions
# Returns: "none", "descriptive", "concise", or "both"
#
# This approach detects ANY change that affects rendered output (content, styling, templates, etc.)
# without false positives from unrelated site changes.
#
# Usage: ./check-cv-html-changes.sh [cache_dir]
#   cache_dir: Directory for HTML cache (default: uses NETLIFY_CACHE_DIR or /tmp/cv-html-cache)

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SITE_DIR="${SITE_DIR:-$SCRIPT_DIR/../_site}"

# Determine cache directory
if [ -n "$1" ]; then
    CACHE_DIR="$1"
elif [ -n "$NETLIFY_CACHE_DIR" ]; then
    CACHE_DIR="$NETLIFY_CACHE_DIR/cv-html-cache"
else
    CACHE_DIR="/tmp/cv-html-cache"
fi

# HTML files to check
DESCRIPTIVE_HTML="$SITE_DIR/cv/print/index.html"
CONCISE_HTML="$SITE_DIR/cv/concise/print/index.html"

# Cached HTML files
CACHED_DESCRIPTIVE="$CACHE_DIR/descriptive.html"
CACHED_CONCISE="$CACHE_DIR/concise.html"

# Verify current HTML files exist
if [ ! -f "$DESCRIPTIVE_HTML" ]; then
    echo "Error: $DESCRIPTIVE_HTML not found. Run Jekyll build first." >&2
    exit 1
fi

if [ ! -f "$CONCISE_HTML" ]; then
    echo "Error: $CONCISE_HTML not found. Run Jekyll build first." >&2
    exit 1
fi

NEED_DESCRIPTIVE=false
NEED_CONCISE=false

# Check descriptive CV
if [ ! -f "$CACHED_DESCRIPTIVE" ]; then
    # No cache - need to rebuild
    NEED_DESCRIPTIVE=true
elif ! diff -q "$DESCRIPTIVE_HTML" "$CACHED_DESCRIPTIVE" > /dev/null 2>&1; then
    # Files differ - need to rebuild
    NEED_DESCRIPTIVE=true
fi

# Check concise CV
if [ ! -f "$CACHED_CONCISE" ]; then
    # No cache - need to rebuild
    NEED_CONCISE=true
elif ! diff -q "$CONCISE_HTML" "$CACHED_CONCISE" > /dev/null 2>&1; then
    # Files differ - need to rebuild
    NEED_CONCISE=true
fi

# Return result
if [ "$NEED_DESCRIPTIVE" = true ] && [ "$NEED_CONCISE" = true ]; then
    echo "both"
elif [ "$NEED_DESCRIPTIVE" = true ]; then
    echo "descriptive"
elif [ "$NEED_CONCISE" = true ]; then
    echo "concise"
else
    echo "none"
fi
