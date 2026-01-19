# Website TODO

## Pending Issues

- [ ] **Search showing old content**: The search link in the navbar is surfacing old/stale content. Likely cause: example/template content from al-folio is being indexed (e.g., `_projects/`, `_posts/`, `_news/`, `_pages/about_einstein.md`, etc.). To fix, either delete the example content or exclude it from indexing.

- [ ] **Add year groupings to presentations and patents**: Should have year headings and a rule between years, similar to publications.

- [ ] **CV to PDF conversion**: Investigate how to convert CV to PDF when building (find markdown CV example on web). Create PDF and add a PDF link to the top right of the CV page, like in the template.

- [ ] **Consider adding Selected Presentations to CV**: Decide if Selected Presentations should be added to the CV.

## Blog Content Updates

- [ ] **Add CZ-benchmarks coverage to press**: Add press coverage of CZ-benchmarks.

- [ ] **Check patent grant status**: Search patents to determine which ones have been granted and update accordingly.

## CV to PDF Research Notes (2025-12-31)

### Current Setup
- CV data lives in `_data/cv.yml` (YAML format)
- CV page uses `_layouts/cv.liquid` template
- Template already supports `cv_pdf` front matter variable - if set, displays a PDF icon (`fa-solid fa-file-pdf`) in top right linking to the PDF
- Currently `cv_pdf:` is blank in `_pages/cv.md`
- No custom `@media print` styles exist

### Approaches Considered

**1. Browser-based rendering (Puppeteer/Playwright/wkhtmltopdf)**
- Renders the actual CV webpage as PDF
- Pros: Exact visual match, uses same data (no duplication)
- Cons: Requires headless browser in CI, may need print-specific CSS tweaks

**2. Pandoc with YAML input**
- Pandoc can read YAML data directly and apply templates
- Pros: Fast, lightweight, good PDF output via LaTeX
- Cons: Need to create a pandoc/LaTeX template that matches CV structure

**3. WeasyPrint (Python HTML→PDF)**
- Converts HTML to PDF with good CSS support
- Could render the Jekyll-generated `_site/cv/index.html`
- Pros: Python already in build process, respects CSS
- Cons: May need print CSS adjustments

**4. Print CSS only (manual)**
- Add `@media print` styles for clean printing
- Users print to PDF from browser (Cmd+P)
- Pros: Zero build complexity
- Cons: Not automatic

### Preferred Approach: davewhipp-style Template

Liked the davewhipp format from https://github.com/elipapa/markdown-cv
- Example output: https://davewhipp.github.io/markdown-cv/
- Clean, minimal academic design
- Right-aligned dates (in backticks/code tags)
- Bold for institutions/titles
- Horizontal rules between sections
- Uses print CSS for PDF output via browser print

**davewhipp CSS Assessment:**
- Complexity: Low-Medium (~100-150 lines of actual styling after reset)
- Uses positioning-based two-column layout (not flexbox/grid)
- Main content: 25% from left, 55-60% width
- Section headers (h2): Right-aligned in 20% left sidebar, burgundy color (#bc412b)
- Dates: Uses `<code>` tags with absolute positioning (`right: -20%`) to push to right margin
- Fonts: Avenir/Verdana sans-serif stack, 12pt for print
- Includes Meyer CSS reset

**Layout structure:**
```
|  h2 sidebar  |  main content  |  dates  |
|    (20%)     |    (55-60%)    |  (right)|
```

### Recommended Implementation

Create a `/cv-print/` page with davewhipp styling:
1. New Jekyll template that outputs `_data/cv.yml` in davewhipp HTML structure
2. h2 for section titles, entries in paragraphs/lists, dates in `<code>` tags
3. Include davewhipp screen and print CSS
4. Print to PDF from browser, or automate with Puppeteer

**Estimated effort:** 2-3 hours total

### Automation Options

To automatically generate PDF during build:
1. After Jekyll build, serve `_site` locally
2. Use Puppeteer to navigate to `/cv-print/` and print to PDF
3. Save PDF to `_site/assets/pdf/cv.pdf`
4. Deploy

Could add this as a step in `.github/workflows/deploy.yml` after the Jekyll build.

## Deployment Steps

Steps to run before deploying the blog:

1. Initialize rbenv (if not already in shell):
   ```bash
   eval "$(rbenv init -)" && rbenv local 3.3.10
   ```

2. Clean Jekyll cache:
   ```bash
   rm -rf _site .jekyll-cache .jekyll-metadata
   # or: bundle exec jekyll clean
   ```

3. Rebuild the site:
   ```bash
   bundle exec jekyll build
   ```

For local development:
```bash
eval "$(rbenv init -)" && rbenv local 3.3.10 && bundle exec jekyll serve
```

## Completed

- [x] Social icons too big
- [x] Left-align publications
- [x] Remove "Photos from Unsplash" from footer (required cache clean + server restart)
- [x] Convert site from old blog to al-folio template
- [x] Add poster links to publications with conference info
- [x] Add thesis presentation to presentations page
- [x] Update press section with Learning from Machine Learning podcast
- [x] Style publication/presentation buttons with colors
- [x] Create custom CV templates (experience, education, publications, awards)
- [x] Hide year for "In preparation" publications
- [x] Fix author list truncation
- [x] Add BioNeMo framework paper to publications
- [x] Selected Publications formatting in CV
- [x] Update asset link colors to jewel-toned palette with separate light/dark theme support
