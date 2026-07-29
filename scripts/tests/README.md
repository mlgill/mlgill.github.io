# Site regression tests

Run the complete production-build and CV test suite from the repository root:

```sh
bash scripts/site.sh test
```

The command installs the pinned test dependencies, verifies the repository-local
Puppeteer browser, and performs a production Jekyll build before running tests.

The browser visual tests capture the landing page, CV, publications,
presentations, and blog in light and dark themes at desktop and mobile sizes.
The pinned Puppeteer browser blocks external dynamic scripts, waits for fonts and
images, disables animation, and requires exact pixel matches with the reviewed
PNG fixtures in `scripts/tests/fixtures/browser`.

After an intentional website styling change, review the generated site and
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

After an intentional PDF layout change, review the generated PDFs and update the
fixtures explicitly:

```sh
node scripts/generate-cv-pdf.js --file --prepared-date 2026-07-29
npm --prefix scripts run test:update-pdf-baselines
npm --prefix scripts run test:pdf
```

Visual failures save expected, actual, and diff images under
`tmp/pdfs/visual-diffs`.
