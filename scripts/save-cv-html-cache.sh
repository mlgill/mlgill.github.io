#!/bin/bash
# Save CV HTML to cache after PDF generation
# This allows the next build to compare against these versions
#
# Usage: ./save-cv-html-cache.sh [which] [cache_dir]
#   which: "descriptive", "concise", or "both" (default: both)
#   cache_dir: Directory for HTML cache (default: uses NETLIFY_CACHE_DIR or /tmp/cv-html-cache)

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SITE_DIR="${SITE_DIR:-$SCRIPT_DIR/../_site}"

WHICH="${1:-both}"

# Determine cache directory
if [ -n "$2" ]; then
    CACHE_DIR="$2"
elif [ -n "$NETLIFY_CACHE_DIR" ]; then
    CACHE_DIR="$NETLIFY_CACHE_DIR/cv-html-cache"
else
    CACHE_DIR="/tmp/cv-html-cache"
fi

# Ensure cache directory exists
mkdir -p "$CACHE_DIR"

# HTML files
DESCRIPTIVE_HTML="$SITE_DIR/cv/print/index.html"
CONCISE_HTML="$SITE_DIR/cv/concise/print/index.html"

# Save based on which CVs were rebuilt
if [ "$WHICH" = "both" ] || [ "$WHICH" = "descriptive" ]; then
    if [ -f "$DESCRIPTIVE_HTML" ]; then
        cp "$DESCRIPTIVE_HTML" "$CACHE_DIR/descriptive.html"
        echo "Cached descriptive CV HTML"
    fi
fi

if [ "$WHICH" = "both" ] || [ "$WHICH" = "concise" ]; then
    if [ -f "$CONCISE_HTML" ]; then
        cp "$CONCISE_HTML" "$CACHE_DIR/concise.html"
        echo "Cached concise CV HTML"
    fi
fi
