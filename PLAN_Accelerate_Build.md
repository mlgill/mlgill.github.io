# Plan: Netlify Build Optimization

## Overview
Comprehensive plan to optimize Netlify build times from estimated 5-8 minutes down to 30-60 seconds for typical content updates.

**Note:** Netlify already caches Ruby gems and node_modules by default, so explicit dependency caching is not needed.

---

## Priority 1: Implement Smart PDF Generation - DONE

### Problem
PDF generation with Puppeteer runs on every build, even when CV content hasn't changed.

### Solution Implemented
Created HTML-diff-based change detection that compares rendered CV HTML against cached versions:

**Scripts:**
- `scripts/check-cv-html-changes.sh` - Diffs current `_site/cv/*/print/index.html` against cached HTML
- `scripts/save-cv-html-cache.sh` - Saves HTML to Netlify cache after PDF generation

**How it works:**
1. Jekyll builds, generating HTML in `_site/`
2. `check-cv-html-changes.sh` compares rendered HTML against cached versions
3. Returns "none", "descriptive", "concise", or "both" based on what changed
4. Only regenerates PDFs for CVs whose HTML actually changed
5. `save-cv-html-cache.sh` updates the cache for next build

**Advantages over source-file monitoring:**
- Detects ANY change affecting output (content, styling, templates, includes, etc.)
- No false positives from unrelated site changes
- No need to maintain a list of monitored files

**Cache behavior:**
- Uses Netlify's build cache (`$NETLIFY_CACHE_DIR/cv-html-cache/`)
- If cache is cleared, both PDFs rebuild (safe default)

### Expected Impact
Saves 20-40 seconds on builds where CV hasn't changed (most builds).

---

## Priority 2: Use `npm ci` Instead of `npm install` - DONE

### Problem
`npm install` in the build command is slower and can produce inconsistent results.

### Solution Implemented
Changed to `npm ci` in the `netlify.toml` build command (implemented as part of Priority 1).

### Expected Impact
20-30% faster npm installs (5-10 seconds saved).

---

## Priority 3: Cache Bibliography Processing - DONE

### Problem
Jekyll-scholar processes the full bibliography on every build (~2 min), even when publications haven't changed.

### Solution Implemented
Created `scripts/prebuild-bibliography.js` that pre-processes `papers.bib` into cached YAML:

**Scripts:**
- `scripts/prebuild-bibliography.js` - Parses BibTeX, applies LaTeX filters, outputs to `_data/bibliography_cache.yml`
- Uses MD5 hash of `papers.bib` to detect changes (stored in `_data/.bibliography_hash`)

**Templates:**
- `_includes/cv_bibliography.liquid` - Renders bibliography from cached data
- CV pages (`cv.md`, `cv-print.md`, `cv-concise.md`, `cv-concise-print.md`) use cached data
- Main publications page (`publications.md`) still uses Jekyll-scholar for full functionality

**Build process:**
- `netlify.toml` runs `prebuild-bibliography.js` before Jekyll build
- Script skips regeneration if `papers.bib` hash matches cached version

**Note:** Full site builds still include Jekyll-scholar processing for `publications.md`. The caching primarily benefits CV page generation and incremental builds.

### Expected Impact
Saves ~120 seconds on builds where bibliography hasn't changed (most builds).

---

## Priority 4: Optimize Image Processing

### Problem
Jekyll-imagemagick processes images on every build, generating responsive WebP versions.

### Solution
Generate responsive images ahead of time and commit them to the repository.

### Expected Impact
Saves 10-30 seconds depending on image count.

---

## Priority 5: Evaluate Heavy Jekyll Plugins

### Problem
Some Jekyll plugins add significant build time but may not be critical.

### Candidates for Review
- `jekyll-minifier`: Consider using Netlify's built-in asset optimization instead
- `jekyll-twitter-plugin`: Consider static embeds if not frequently updated
- `jekyll-jupyter-notebook`: Only enable if actively using notebooks

### Expected Impact
Variable, could save 10-30 seconds depending on plugins disabled.

---

## Priority 6: Split Build into Stages

### Problem
Critical site deployment waits for non-critical PDF generation to complete.

### Solution
Use Netlify build plugins to parallelize or defer non-critical tasks:
- Main site build (required for deployment)
- PDF generation (optional, can run in background or manually)

### Expected Impact
Makes builds feel faster by deploying site immediately, with PDFs generated afterward.

---

## Summary of Expected Time Savings

### Current Estimated Build Time
5-8 minutes (cold start, no caching)

### With Priorities 1-3 Implemented

| Scenario | Current | Optimized | Savings |
|----------|---------|-----------|---------|
| First build (cold cache) | 5-8 min | 5-8 min | 0 min |
| Content-only changes | 5-8 min | 1-2 min | 4-6 min |
| No CV/bib changes | 5-8 min | 0.5-1 min | 4.5-7 min |

### Breakdown by Priority

1. **Conditional PDF generation** (Priority 1) - saves 20-40s most builds
2. **npm ci optimization** (Priority 2) - saves 5-10s every build
3. **Bibliography caching** (Priority 3) - saves ~120s most builds
4. **Image caching** (Priority 4) - saves 10-30s every build

### Total Potential Savings
**3-5 minutes** on typical content updates after implementing Priorities 1-3.
