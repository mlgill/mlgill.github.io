# Plan: Fix PDF Build on Netlify

## Problem
PDF generation fails on Netlify because Chrome/Chromium is not available in the build environment.

## Solutions (pick one)

### 1. Skip PDF generation on Netlify (recommended if PDFs are not required on every deploy)

Edit your build command in `netlify.toml` so the PDF generation step runs only if Chrome is available:

```toml
# in netlify.toml
[build]
  command = """
bundle exec jekyll build && \
cd scripts && npm install && \
if command -v chromium-browser >/dev/null 2>&1 || command -v chromium >/dev/null 2>&1 || [ -n "$CHROME_PATH" ]; then \
  node generate-cv-pdf.js --file; \
else \
  echo "Skipping PDF generation: Chrome/Chromium not found"; \
fi
"""
```

This avoids failing the whole deploy when the build environment lacks Chrome.

### 2. Install Chromium in the Netlify build image and set CHROME_PATH

Add an `Aptfile` to the repository root with a Chromium package name:

```
chromium-browser
```

or, depending on the build image:

```
chromium
```

Netlify's build images automatically install packages listed in an Aptfile.

After Chromium is available, set `CHROME_PATH` to the Chromium executable path in Netlify environment variables (Site > Site settings > Build & deploy > Environment > Environment variables). Common paths:
- `/usr/bin/chromium-browser`
- `/usr/bin/chromium`

Then your original build command will find Chrome and the PDF generation step should succeed.

### 3. Use a headless-chrome binary installed via npm (alternate)

If using Puppeteer, ensure the dependency actually downloads Chromium during `npm install` on Netlify:
- Unset any environment variables that skip the download (e.g. `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD`)
- Use `puppeteer` (which downloads Chromium) instead of `puppeteer-core`
- Or use `chrome-aws-lambda` + `puppeteer-core` for lambda-friendly binaries

Verify the package is listed in `package.json` and committed before relying on it in builds.

## Additional Notes

- The failing build command shows `CHROME_PATH` as a known variable name but it was not set to a usable binary
- If you install or rely on an OS package (Aptfile), test with a branch deploy to confirm
