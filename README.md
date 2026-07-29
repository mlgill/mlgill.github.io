# mlgill.github.io

Personal academic website for Michelle Lynn Gill, Ph.D. The site is built with
Jekyll, deployed by Netlify, and uses Puppeteer to generate descriptive and
concise CV PDFs.

## Requirements

Runtime versions are pinned in `.ruby-version` and `.node-version`:

- Ruby 3.3.10 with Bundler
- Node.js 24.18.0 with npm
- Python 3 for the local static server
- Poppler for PDF regression tests (`brew install poppler` on macOS)

Using `rbenv` and a Node version manager is recommended. Netlify and GitHub
Actions read the same version files used locally.

## Initial setup

From the repository root:

```sh
bash scripts/setup.sh
```

This installs the Ruby and Node dependencies, installs a project-local Chrome
for Puppeteer, and launches Chrome once to verify the installation.

## Local development

Build the website, generate both CV PDFs, and serve the built site:

```sh
bash scripts/site.sh serve
```

Open <http://localhost:4000>. Press `Ctrl+C` to stop the server.

To build the Jekyll site without serving it:

```sh
bash scripts/site.sh build development
```

That command does not generate PDFs. For a complete production-equivalent build,
including both CV PDFs, use:

```sh
bash scripts/site.sh netlify
```

## Testing

Run the complete production-build and regression suite:

```sh
bash scripts/site.sh test
```

The suite verifies important routes and content, CV web/print parity,
bibliography synchronization, PDF metadata and text, and reviewed page images
for both CV versions. PDF failures place expected, actual, and diff images under
`tmp/pdfs/visual-diffs`.

The PDF tests use a fixed prepared date so the image baselines are deterministic.
Production PDFs continue to use the build date.

After an intentional PDF layout change:

```sh
node scripts/generate-cv-pdf.js --file --prepared-date 2026-07-29
npm --prefix scripts run test:update-pdf-baselines
npm --prefix scripts run test:pdf
```

Review every changed baseline image before committing it. More details are in
[`scripts/tests/README.md`](scripts/tests/README.md).

## Puppeteer browser maintenance

Puppeteer uses `.cache/puppeteer` inside this repository. The directory is
ignored by Git and can be repaired without touching browser caches used by other
projects.

```sh
# Confirm Chrome exists and can launch
npm --prefix scripts run browser:verify

# Remove only this repository's Puppeteer cache
npm --prefix scripts run browser:clean

# Verify Chrome, reinstalling it if missing or incomplete
npm --prefix scripts run browser:setup
```

The normal setup, test, local-server, and Netlify build scripts run the
verification automatically.

## Deployment

Netlify deploys the `master` branch using `netlify.toml`, which calls
`bash scripts/site.sh netlify`. The same orchestrator is used locally and in
GitHub Actions. Every Netlify build generates and verifies both CV PDFs before
`_site` is published.

GitHub Actions runs the site and CV regression suite on pushes and pull requests.
It caches the project-local Puppeteer browser between runs, but still verifies
that Chrome launches before testing.

---

This site is based on the
[al-folio](https://github.com/alshedivat/al-folio) Jekyll theme, available under
the [MIT License](https://github.com/alshedivat/al-folio/blob/main/LICENSE).
