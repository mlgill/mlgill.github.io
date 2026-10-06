#!/usr/bin/env node
/**
 * Generate CV PDFs using Puppeteer
 * Uses Puppeteer's bundled Chromium for consistent rendering across environments
 * Renders the built print pages in _site/ via file:// (run `jekyll build` first)
 *
 * Usage:
 *   node generate-cv-pdf.js                            # Generate both PDFs
 *   node generate-cv-pdf.js --prepared-date 2026-07-29 # Use a fixed footer date
 *   node generate-cv-pdf.js descriptive                # Generate descriptive CV only
 *   node generate-cv-pdf.js concise                    # Generate concise CV only
 */

const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const result = {
    cvType: null, // null means both
    preparedDate: null,
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--prepared-date" && args[i + 1]) {
      result.preparedDate = parsePreparedDate(args[i + 1]);
      i++;
    } else if (args[i] === "descriptive" || args[i] === "concise") {
      result.cvType = args[i];
    }
  }

  return result;
}

function parsePreparedDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    throw new Error(`Invalid --prepared-date "${value}"; expected YYYY-MM-DD`);
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (date.getUTCFullYear() !== year || date.getUTCMonth() + 1 !== month || date.getUTCDate() !== day) {
    throw new Error(`Invalid --prepared-date "${value}"`);
  }

  return { year, month, day };
}

// CV configurations: dedicated print pages with minimal layout, read from the built site
const SITE_DIR = path.join(__dirname, "..", "_site");
const PDF_DIR = path.join(SITE_DIR, "assets", "pdf");
const CV_CONFIGS = {
  descriptive: {
    path: path.join(SITE_DIR, "cv", "print", "index.html"),
    output: path.join(PDF_DIR, "GillMichelle_DescriptiveCV.pdf"),
    title: "Descriptive CV",
  },
  concise: {
    path: path.join(SITE_DIR, "cv", "concise", "print", "index.html"),
    output: path.join(PDF_DIR, "GillMichelle_ConciseCV.pdf"),
    title: "Concise CV",
  },
};

/**
 * Generate a footer template for the given CV type
 */
function getFooterTemplate(cvTitle, fixedDate) {
  const now = new Date();
  const year = fixedDate ? fixedDate.year : now.getFullYear();
  const month = fixedDate ? fixedDate.month : now.getMonth() + 1;
  const day = fixedDate ? fixedDate.day : now.getDate();
  const preparedDate = `Prepared ${String(month).padStart(2, "0")}/${String(day).padStart(2, "0")}/${year}`;

  return `
    <div style="font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 9px;
                color: #666; width: 100%; padding: 0 0.5in;
                display: flex; justify-content: space-between;">
      <span>Michelle Lynn Gill &middot; ${cvTitle}</span>
      <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
      <span>${preparedDate}</span>
    </div>
  `;
}

/**
 * Generate a PDF from a built HTML file
 */
async function generatePDF(browser, htmlPath, outputPath, cvTitle, preparedDate) {
  // Ensure output directory exists
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const page = await browser.newPage();

  // Set viewport for consistent rendering
  await page.setViewport({ width: 1200, height: 800 });

  await page.goto(`file://${htmlPath}`, { waitUntil: "networkidle0", timeout: 60000 });
  await page.evaluate(() => document.fonts.ready);

  // Emulate print media for proper print styles
  await page.emulateMediaType("print");

  await page.pdf({
    path: outputPath,
    format: "Letter",
    printBackground: true,
    scale: 1.0,
    margin: {
      top: "0.5in",
      right: "0.5in",
      bottom: "0.75in",
      left: "0.5in",
    },
    displayHeaderFooter: true,
    headerTemplate: "<div></div>",
    footerTemplate: getFooterTemplate(cvTitle, preparedDate),
  });

  console.log(`PDF saved to: ${outputPath}`);
}

/**
 * Main function
 */
async function main() {
  const args = parseArgs();

  const executablePath = await puppeteer.executablePath();

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"], // Required for CI environments
  });
  console.log(`Using Chrome at ${executablePath}`);

  try {
    const types = args.cvType ? [args.cvType] : Object.keys(CV_CONFIGS);
    for (const type of types) {
      const config = CV_CONFIGS[type];
      await generatePDF(browser, config.path, config.output, config.title, args.preparedDate);
    }
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error("Error generating PDF:", err);
  process.exit(1);
});
