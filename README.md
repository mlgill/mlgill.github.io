# mlgill.github.io

Personal academic website for Michelle Lynn Gill, Ph.D.

## Local Development

### Prerequisites

- Ruby (managed via rbenv)
- Bundler

### Setup

```bash
# Initialize rbenv
eval "$(rbenv init -)"

# Install dependencies
bundle install
```

### Running Locally

```bash
# Start the development server
bundle exec jekyll serve
```

The site will be available at http://127.0.0.1:4000

### Running Locally with CV PDF Generation

The standard `jekyll serve` command doesn't include CV PDF generation. To test the site with PDFs:

```bash
# Use the convenience script (recommended)
./scripts/serve-local.sh
```

This script:
1. Builds the Jekyll site
2. Generates CV PDFs using Puppeteer
3. Serves the site using Python's HTTP server

**Why not `jekyll serve`?** Jekyll serve with `--skip-initial-build` caches the `_site` directory in memory and won't pick up PDFs generated after the server starts. The Python HTTP server serves files directly from disk, avoiding this issue.

**Manual steps** (if you prefer):
```bash
# 1. Build site
bundle exec jekyll build

# 2. Generate PDFs
cd scripts && npm install && node generate-cv-pdf.js --file && cd ..

# 3. Serve with Python (no caching)
cd _site && python3 -m http.server 4000
```

The site will be available at http://localhost:4000

### Building

```bash
# Clean previous build
bundle exec jekyll clean

# Build the site
bundle exec jekyll build
```

The built site will be in the `_site/` directory.

**IMPORTANT for AI assistants:** After running `jekyll build`, you MUST also run the PDF generation script (`node scripts/generate-cv-pdf.js --file`) or the CV download links will 404. The PDFs are not part of Jekyll's build - they're generated separately by Puppeteer. Always use `./scripts/serve-local.sh` for local development, or run both commands in sequence.

## Deployment

The site is automatically deployed to GitHub Pages when changes are pushed to the `master` branch.

---

This site is based on the [al-folio](https://github.com/alshedivat/al-folio) Jekyll theme, available under the [MIT License](https://github.com/alshedivat/al-folio/blob/main/LICENSE).
