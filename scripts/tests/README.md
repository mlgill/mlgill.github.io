# Site regression tests

Run the complete production-build and CV test suite from the repository root:

```sh
bash scripts/site.sh test
```

The command installs the pinned test dependencies, verifies the repository-local
Puppeteer browser, and performs a production Jekyll build before running tests.
The build requires ImageMagick's `convert` command for Jekyll image processing;
the PDF tests require Poppler's `pdfinfo`, `pdftotext`, and `pdftoppm` commands.

Netlify runs `bash scripts/site.sh netlify`. After the production build, it checks
site content and routes, generates the current CV PDFs, then validates their PDF
structure before publishing. The build supplies the same explicit date to PDF
generation and validation, including across midnight. The PDF structure check uses pinned `pdfjs-dist`
and needs no Poppler installation. It checks Letter page size, the shared role,
section headings, the actual prepared date on every page, and body text on
every page. Run it against freshly generated PDFs with:

```sh
CV_PDF_EXPECTED_DATE=YYYY-MM-DD npm --prefix scripts run test:pdf:structure
```

GitHub can run the visual checks in separate steps after a shared setup/build:

```sh
bash scripts/site.sh visual:prepare
bash scripts/site.sh visual:browser
bash scripts/site.sh visual:pdf
```

The browser and PDF steps are independent once setup succeeds, so both can
report failures in one workflow run. For one local command that runs both visual
suites, use `bash scripts/site.sh visual`. Visual checks use the fixed
`2026-07-29` PDF date and do not repeat Netlify's content checks.

Visual comparisons require matching dimensions, ignore detected antialiasing,
and use a 0.1 perceptual color threshold with at most 0.07% differing pixels.
This accommodates small macOS rasterization differences while retaining checks
for missing content and layout changes. The comparator has negative controls
for removed and shifted elements; browser captures also require loaded images
and icon fonts. GitHub pins the macOS major version, and missing browser caches
are rebuilt using the pinned Puppeteer browser.

The browser visual tests capture the landing page, CV, publications,
presentations, and patents in light and dark themes at desktop and mobile sizes.
The pinned Puppeteer browser blocks external dynamic scripts, waits for fonts and
images, disables animation, and requires exact pixel matches with the reviewed
PNG fixtures in `scripts/tests/fixtures/browser`.

After an intentional website content or styling change, review the generated site and
update the fixtures explicitly:

```sh
bash scripts/site.sh build production
npm --prefix scripts run test:update-browser-baselines
npm --prefix scripts run test:browser
```

Browser visual failures place expected, actual, and diff images under
`tmp/browser/visual-diffs`.

The PDF tests use `pdfinfo`, `pdftotext`, and `pdftoppm` from Poppler. They render
every page at 144 DPI and require an exact pixel-for-pixel match with the reviewed
PNG fixtures in `scripts/tests/fixtures/pdf`.

After an intentional PDF content or layout change, review the generated PDFs and update the
fixtures explicitly:

```sh
node scripts/generate-cv-pdf.js --prepared-date 2026-07-29
npm --prefix scripts run test:update-pdf-baselines
npm --prefix scripts run test:pdf
```

Visual failures save expected, actual, and diff images under
`tmp/pdfs/visual-diffs`.

## Publications

jekyll-scholar renders `/publications/`, the landing page's recent papers, and
both CV publication lists (through `_layouts/cv_bib.liquid`) from
`_bibliography/papers.bib`. `bibliography.test.mjs` reads entry keys and titles
from the rendered `/publications/` page and only the `selected` and `recent`
flags from `papers.bib`. Because `scholar.sort_by` is unset, entries appear in
file order, so the test also requires `papers.bib` to list entries by year
descending, then key ascending.

## Content snapshots

Text-level snapshots in `scripts/tests/fixtures/content` make content changes
readable in diffs and let pipeline refactors be verified exactly. They are
checked by `content-snapshots.test.mjs` and `pdf-snapshots.test.mjs`:

- `cv-descriptive.txt`, `cv-concise.txt`: normalized text of `.cv-content` on `/cv/` and `/cv/concise/`, one line per block element (`h1, h2, h3, p, li`).
- `cv-bibliography-descriptive.html`, `cv-bibliography-concise.html`: inner HTML of
  `ol.bibliography` on the same routes, with whitespace runs collapsed to one
  space and spaces between tags removed, one `<li>` per line.
- `publications-keys.txt`: entry ids inside `.publications` on `/publications/`, one per line.
- `cv-pdf-descriptive.txt`, `cv-pdf-concise.txt`: per-page body text of the generated
  PDFs (footer excluded, as in `inspectPdf`), pages separated by `---- page N ----`.

The first three groups run in `test:content`. The PDF text group runs in
`test:pdf`, after the PDFs are generated with the fixed date `2026-07-29`.

After an intentional content change, review the site and PDFs and update all
snapshots explicitly (the PDF snapshots need the PDFs generated first):

```sh
bash scripts/site.sh build production
node scripts/generate-cv-pdf.js --prepared-date 2026-07-29
npm --prefix scripts run test:update-content-snapshots
npm --prefix scripts run test:content
npm --prefix scripts run test:pdf
```

Review every changed snapshot before committing it.
