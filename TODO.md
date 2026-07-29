# Website TODO

## Pending Issues

- [ ] **Add year groupings to presentations and patents**: Should have year headings and a rule between years, similar to publications.
- [ ] **Evaluate removing year column for publications**: Publications already have years in their data (e.g., "(2024)"), so the year column on the left may be redundant.
- [ ] **Annotate presentations for concise CV**: Review presentations and add `selected: true` to those that should appear in the concise CV.
- [ ] **Some abbreviation of author lists**

## Blog Content Updates

- [ ] **Add CZ-benchmarks coverage to press**: Add press coverage of CZ-benchmarks.
- [ ] **Check patent grant status**: Search patents to determine which ones have been granted and update accordingly.

## CV to PDF Implementation Notes (Completed 2026-01-20)

### Final Implementation

Used Puppeteer with bundled Chromium to generate PDFs from dedicated print pages.

**Key files:**

- `_layouts/cv-print.liquid` - Minimal layout with embedded davewhipp CSS (no Bootstrap)
- `_pages/cv-print.md` - Print version of descriptive CV (`/cv/print/`)
- `_pages/cv-concise-print.md` - Print version of concise CV (`/cv/concise/print/`)
- `scripts/generate-cv-pdf.js` - Puppeteer script to generate PDFs
- `scripts/package.json` - Uses pinned Puppeteer and Chrome versions
- `_sass/_cv-standalone.scss` - Styles for website CV display

**How it works:**

1. Jekyll builds the site including print pages at `/cv/print/` and `/cv/concise/print/`
2. `generate-cv-pdf.js --file` loads the print pages via `file://` protocol
3. Puppeteer renders to PDF with custom footer (name, page numbers, date)
4. PDFs saved to `_site/assets/pdf/GillMichelle_DescriptiveCV.pdf` and `GillMichelle_ConciseCV.pdf`

**Netlify build:**

- `netlify.toml` calls `scripts/build-netlify.sh`
- Every deploy builds the site and verifies that both CV PDFs were generated

**Local development:**

- Use `./scripts/serve-local.sh` to build, generate PDFs, and serve
- Use `scripts/build-netlify.sh` for a complete production-equivalent build
- Don't use `jekyll serve --skip-initial-build` (won't pick up PDFs added after start)

**Testing and browser setup:**

- See `README.md` and `scripts/tests/README.md`
- Puppeteer uses the project-local `.cache/puppeteer` directory

## Deployment Steps

Steps to run before deploying the blog:

1. Run `bash scripts/test-site.sh`.
2. Push the reviewed commit to `master`; Netlify runs
   `bash scripts/build-netlify.sh`.

For local development:

```bash
bash scripts/serve-local.sh
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
- [x] Fix search indexing example content (added inline: true, disabled posts_in_search, fixed search script)
- [x] Disable search feature temporarily (search_enabled: false)
- [x] Fix Adams 2004 publication: correct volume (10) and DOI (10.1261/rna.7140504)
- [x] CV to PDF conversion: Implemented using Puppeteer with dedicated print layouts. PDFs auto-generated during Netlify build. Download buttons on CV pages (right-aligned).
- [x] Consolidate local, test, and Netlify builds around shared scripts with deterministic PDF generation.
- [x] Consider adding Selected Presentations to CV: Yes, presentations are included in CV.
- [x] Add email address to CV: Email displayed on own line above social links, matching Monaco/Menlo font.
- [x] Convert CV colors for dark format: HTML CV uses cyan highlight and bright jewel-tone link colors in dark mode (PDF stays light-only).
- [x] Light mode as default: Website now defaults to light mode for first-time visitors.
