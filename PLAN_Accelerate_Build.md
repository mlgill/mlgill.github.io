# Plan: Netlify Build Optimization

## Overview
Comprehensive plan to optimize Netlify build times from estimated 5-8 minutes down to 30-60 seconds for typical content updates.

---

## Priority 1: Enable Netlify Build Cache

### Problem
Every build re-downloads Ruby gems (~100+ dependencies), Puppeteer/Chromium (51MB), and regenerates Jekyll caches.

### Solution
Add cache configuration to `netlify.toml`:

```toml
[build.processing]
  skip_processing = false

[[plugins]]
  package = "netlify-plugin-cache"
  [plugins.inputs]
    paths = [
      "vendor/bundle",           # Ruby gems
      "scripts/node_modules",    # Puppeteer dependencies (51MB)
      ".jekyll-cache",           # Jekyll incremental cache
      "_site"                    # For incremental builds
    ]
```

### Expected Impact
Saves 60-90 seconds on every build after the first.

---

## Priority 2: Implement Smart PDF Generation

### Problem
PDF generation with Puppeteer runs on every build, even when CV content hasn't changed. Downloads 51MB of dependencies each time if not cached.

### Solution A: Conditional Generation
Modify `netlify.toml` build command:

```bash
echo "Cleaning build artifacts..." && \
rm -rf _site assets/pdf/cv && \
bundle install && \
bundle exec jekyll build && \
if git diff --name-only HEAD~1 | grep -q "_data/cv.yml"; then \
  echo "CV changed, regenerating PDFs..." && \
  cd scripts && npm ci && node generate-cv-pdf.js --file; \
else \
  echo "CV unchanged, skipping PDF generation"; \
fi
```

### Solution B: Manual Trigger
Set `SKIP_PDF_GENERATION=true` by default, regenerate PDFs manually when needed.

### Expected Impact
Saves 20-40 seconds on builds where CV hasn't changed (most builds).

---

## Priority 3: Use `npm ci` Instead of `npm install`

### Problem
`npm install` in the build command is slower and can produce inconsistent results.

### Solution
Change `netlify.toml` line 16:
```bash
cd scripts && npm ci && node generate-cv-pdf.js --file
```

### Expected Impact
20-30% faster npm installs (5-10 seconds saved).

---

## Priority 4: Cache Bibliography Processing

### Problem
Jekyll-scholar processes the full bibliography on every build (~2 min), even when publications haven't changed.

### Solution
Pre-process `papers.bib` into a cached JSON/YAML data file that Jekyll can read directly, bypassing repeated BibTeX parsing and filter application.

### Implementation Steps

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

### Alternative: Incremental Builds
- Use `jekyll build --incremental` for local development
- Less invasive but won't help Netlify cold builds

### Expected Impact
Saves ~120 seconds on builds where bibliography hasn't changed (most builds).

---

## Priority 5: Optimize Image Processing

### Problem
Jekyll-imagemagick processes images on every build, generating responsive WebP versions.

### Solution
Cache generated responsive images:

```toml
paths = [
  "vendor/bundle",
  "scripts/node_modules",
  ".jekyll-cache",
  "_site",
  "assets/img/**/*.webp",  # Add cached responsive images
]
```

### Alternative
Generate responsive images ahead of time and commit them to the repository.

### Expected Impact
Saves 10-30 seconds depending on image count.

---

## Priority 6: Evaluate Heavy Jekyll Plugins

### Problem
Some Jekyll plugins add significant build time but may not be critical.

### Candidates for Review
- `jekyll-minifier`: Consider using Netlify's built-in asset optimization instead
- `jekyll-twitter-plugin`: Consider static embeds if not frequently updated
- `jekyll-jupyter-notebook`: Only enable if actively using notebooks

### Expected Impact
Variable, could save 10-30 seconds depending on plugins disabled.

---

## Priority 7: Split Build into Stages

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

### With Priorities 1-4 Implemented

| Scenario | Current | Optimized | Savings |
|----------|---------|-----------|---------|
| First build (cold cache) | 5-8 min | 5-8 min | 0 min |
| Content-only changes | 5-8 min | 1-2 min | 4-6 min |
| No CV/bib changes | 5-8 min | 0.5-1 min | 4.5-7 min |

### Breakdown by Priority

1. **Caching dependencies** (Priority 1) - saves 60-90s every build
2. **Conditional PDF generation** (Priority 2) - saves 20-40s most builds
3. **npm ci optimization** (Priority 3) - saves 5-10s every build
4. **Bibliography caching** (Priority 4) - saves ~120s most builds
5. **Image caching** (Priority 5) - saves 10-30s every build

### Total Potential Savings
**4-6 minutes** on typical content updates after implementing Priorities 1-4.
