# Site regression tests

Run the complete production-build and CV test suite from the repository root:

```sh
bash scripts/test-site.sh
```

The PDF tests use `pdfinfo`, `pdftotext`, and `pdftoppm` from Poppler. They render
every page at a fixed resolution and compare it with the reviewed PNG fixtures in
`scripts/tests/fixtures/pdf`.

After an intentional PDF layout change, review the generated PDFs and update the
fixtures explicitly:

```sh
node scripts/generate-cv-pdf.js --file --prepared-date 2026-07-29
npm --prefix scripts run test:update-pdf-baselines
npm --prefix scripts run test:pdf
```

Visual failures save expected, actual, and diff images under
`tmp/pdfs/visual-diffs`.
