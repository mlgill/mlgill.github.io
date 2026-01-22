# mlgill.github.io

Personal academic website for Michelle Lynn Gill, Ph.D.

## Local Development

### Prerequisites

- Ruby (managed via rbenv)
- Bundler
- Node.js (for PDF generation)
- Python 3 (for local server)

### Setup

```bash
# Initialize rbenv
eval "$(rbenv init -)"

# Install Ruby dependencies
bundle install

# Install Node dependencies for PDF generation
cd scripts && npm install && cd ..
```

### Running Locally with CV PDF Generation

```bash
# Clean previous build (recommended)
bundle exec jekyll clean

# Use the convenience script (recommended)
./scripts/serve-local.sh
```

This script:
1. Pre-processes the bibliography for faster builds
2. Builds the Jekyll site
3. Generates CV PDFs using Puppeteer
4. Serves the site using Python's HTTP server

The site will be available at http://localhost:4000

**Manual steps** (if you prefer):
```bash
# 1. Clean and build site
bundle exec jekyll clean
bundle exec jekyll build

# 2. Generate PDFs
cd scripts && npm install && node generate-cv-pdf.js --file && cd ..

# 3. Serve with Python
cd _site && python3 -m http.server 4000
```

**Note for AI assistants:** After running `jekyll build`, you MUST also run the PDF generation script (`node scripts/generate-cv-pdf.js --file`) or the CV download links will 404. The PDFs are not part of Jekyll's build - they're generated separately by Puppeteer. Always use `./scripts/serve-local.sh` for local development, or run both commands in sequence.

## Deployment

The site is automatically deployed via [Netlify](https://www.netlify.com/) when changes are pushed to the `master` branch. The build configuration is in `netlify.toml`.

Netlify handles:
- Jekyll site build
- Bibliography pre-processing
- CV PDF generation (with smart caching to skip unchanged CVs)

---

This site is based on the [al-folio](https://github.com/alshedivat/al-folio) Jekyll theme, available under the [MIT License](https://github.com/alshedivat/al-folio/blob/main/LICENSE).
