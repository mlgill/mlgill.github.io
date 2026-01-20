# Plan: Cache Bibliography Processing to Speed Up Builds

## Problem
Jekyll-scholar processes the full bibliography on every build (~2 min), even when publications haven't changed.

## Proposed Solution
Pre-process `papers.bib` into a cached JSON/YAML data file that Jekyll can read directly, bypassing repeated BibTeX parsing and filter application.

## Implementation Steps

1. **Create a preprocessing script** (`scripts/prebuild-bibliography.js` or Ruby)
   - Parse `papers.bib` using a BibTeX library
   - Apply LaTeX filters (mathmode, subscript, superscript, italics)
   - Output to `_data/bibliography_cache.yml`
   - Include a hash of `papers.bib` to detect changes

2. **Modify build process**
   - Check if `papers.bib` hash matches cached version
   - Only regenerate cache when bibliography changes
   - Update `netlify.toml` to run preprocessing before Jekyll build

3. **Update CV templates**
   - Read from `site.data.bibliography_cache` instead of using `{% bibliography %}` tag
   - Or create a custom Jekyll plugin that checks cache first

## Alternative: Incremental Builds
- Use `jekyll build --incremental` for local development
- Less invasive but won't help Netlify cold builds

## Estimated Effort
- Script creation: ~2-3 hours
- Template updates: ~1 hour
- Testing: ~1 hour
