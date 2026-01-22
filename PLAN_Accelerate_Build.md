# Plan: Netlify Build Optimization

## Overview
Plan to further optimize Netlify build times. Priorities 1-3 from the original plan (smart PDF generation, npm ci, bibliography caching) have been implemented.

**Current build time:** ~2.5-3 minutes locally

---

## Priority 1: Exclude scripts/node_modules from Terser

### Problem
Terser is minifying hundreds of JS files in `scripts/node_modules/` (puppeteer dependencies, zod, yargs, etc.) on every build. These files are only used during build-time PDF generation and don't need to be in `_site/`.

### Solution
Configure Jekyll to exclude `scripts/` from the site output, or configure Terser to skip `node_modules` directories.

### Expected Impact
Could save 30-60 seconds per build.

---

## Priority 2: Optimize Image Processing

### Problem
Jekyll-imagemagick processes images on every build, generating 60+ responsive WebP versions even when source images haven't changed.

### Solution Options
1. **Pre-generate and commit:** Generate responsive images ahead of time and commit them to the repository
2. **Hash-based caching:** Similar to bibliography caching, skip regeneration if source images haven't changed
3. **Use Netlify Image CDN:** Let Netlify handle responsive image generation at request time

### Expected Impact
Saves 10-30 seconds depending on image count.

---

## Priority 3: Evaluate Heavy Jekyll Plugins

### Problem
Some Jekyll plugins add significant build time but may not be critical.

### Candidates for Review
- `jekyll-minifier`: Consider using Netlify's built-in asset optimization instead
- `jekyll-twitter-plugin`: Consider static embeds if not frequently updated
- `jekyll-jupyter-notebook`: Only enable if actively using notebooks

### Expected Impact
Variable, could save 10-30 seconds depending on plugins disabled.

---

## Priority 4: Split Build into Stages

### Problem
Critical site deployment waits for non-critical PDF generation to complete.

### Solution
Use Netlify build plugins to parallelize or defer non-critical tasks:
- Main site build (required for deployment)
- PDF generation (optional, can run in background or manually)

### Expected Impact
Makes builds feel faster by deploying site immediately, with PDFs generated afterward.

---

## Completed Optimizations

- **Smart PDF generation:** HTML-diff-based change detection, only regenerates PDFs when CV content changes
- **npm ci optimization:** Faster, more consistent npm installs
- **Bibliography caching:** Pre-processes papers.bib into cached YAML, skips regeneration when unchanged
