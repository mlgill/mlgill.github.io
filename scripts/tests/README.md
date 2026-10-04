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
node scripts/generate-cv-pdf.js --file --prepared-date 2026-07-29
npm --prefix scripts run test:update-pdf-baselines
npm --prefix scripts run test:pdf
```

Visual failures save expected, actual, and diff images under
`tmp/pdfs/visual-diffs`.
