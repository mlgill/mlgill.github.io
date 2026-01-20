#!/usr/bin/env node
/**
 * Generate CV PDFs using Puppeteer
 * Works both locally (macOS Chromium) and on Netlify (system Chrome)
 *
 * Usage:
 *   node generate-cv-pdf.js                           # Generate both PDFs (uses localhost:4000)
 *   node generate-cv-pdf.js --base-url <url>          # Generate both PDFs with custom base URL
 *   node generate-cv-pdf.js --file                    # Generate from _site/ files directly
 *   node generate-cv-pdf.js descriptive               # Generate descriptive CV only
 *   node generate-cv-pdf.js concise                   # Generate concise CV only
 */

const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

// Find Chrome/Chromium executable
function findChromePath() {
  const possiblePaths = [
    // Netlify build environment
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
    // Local macOS
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }

  // Check CHROME_PATH environment variable
  if (process.env.CHROME_PATH && fs.existsSync(process.env.CHROME_PATH)) {
    return process.env.CHROME_PATH;
  }

  throw new Error('Could not find Chrome/Chromium. Set CHROME_PATH environment variable.');
}

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const result = {
    baseUrl: 'http://localhost:4000',
    useFile: false,
    cvType: null, // null means both
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--base-url' && args[i + 1]) {
      result.baseUrl = args[i + 1];
      i++;
    } else if (args[i] === '--file') {
      result.useFile = true;
    } else if (args[i] === 'descriptive' || args[i] === 'concise') {
      result.cvType = args[i];
    }
  }

  return result;
}

// CV configurations
function getCVConfigs(baseUrl, useFile) {
  const siteDir = path.join(__dirname, '..', '_site');

  if (useFile) {
    return {
      descriptive: {
        url: `file://${path.join(siteDir, 'cv', 'index.html')}`,
        output: path.join(siteDir, 'assets', 'pdf', 'GillMichelle_DescriptiveCV.pdf'),
        title: 'Descriptive CV',
      },
      concise: {
        url: `file://${path.join(siteDir, 'cv', 'concise', 'index.html')}`,
        output: path.join(siteDir, 'assets', 'pdf', 'GillMichelle_ConciseCV.pdf'),
        title: 'Concise CV',
      },
    };
  }

  return {
    descriptive: {
      url: `${baseUrl}/cv/`,
      output: path.join(siteDir, 'assets', 'pdf', 'GillMichelle_DescriptiveCV.pdf'),
      title: 'Descriptive CV',
    },
    concise: {
      url: `${baseUrl}/cv/concise/`,
      output: path.join(siteDir, 'assets', 'pdf', 'GillMichelle_ConciseCV.pdf'),
      title: 'Concise CV',
    },
  };
}

/**
 * Generate a footer template for the given CV type
 */
function getFooterTemplate(cvTitle) {
  const now = new Date();
  const preparedDate = `Prepared ${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}/${now.getFullYear()}`;

  return `
    <div style="font-family: Avenir, Verdana, sans-serif; font-size: 9px;
                color: #666; width: 100%; padding: 0 0.5in;
                display: flex; justify-content: space-between;">
      <span>Michelle Lynn Gill &middot; ${cvTitle}</span>
      <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
      <span>${preparedDate}</span>
    </div>
  `;
}

/**
 * Generate a PDF from a URL
 */
async function generatePDF(browser, url, outputPath, cvTitle) {
  // Ensure output directory exists
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const page = await browser.newPage();

  // Set viewport for consistent rendering
  await page.setViewport({ width: 1200, height: 800 });

  await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });

  // Emulate print media for proper print styles
  await page.emulateMediaType('print');

  // Add print-specific styles to hide navbar/footer and force light mode
  await page.addStyleTag({
    content: `
      @media print {
        /* Hide site navigation and footer */
        header, nav, #navbar, footer, .footer, .back-to-top { display: none !important; }

        /* Force light mode colors */
        html, body { background: white !important; color: black !important; }

        /* Reset container to allow full width */
        .container { max-width: none !important; padding: 0 !important; margin: 0 !important; }

        /* Ensure CV takes full width */
        .cv-standalone {
          width: 100% !important;
          left: 0 !important;
          margin-left: 0 !important;
          margin-right: 0 !important;
        }

        /* Hide download buttons in print */
        .cv-download-buttons { display: none !important; }
      }
    `
  });

  await page.pdf({
    path: outputPath,
    format: 'Letter',
    printBackground: true,
    scale: 1.0,
    margin: {
      top: '0.5in',
      right: '0.5in',
      bottom: '0.75in',
      left: '0.5in',
    },
    displayHeaderFooter: true,
    headerTemplate: '<div></div>',
    footerTemplate: getFooterTemplate(cvTitle),
  });

  console.log(`PDF saved to: ${outputPath}`);
}

/**
 * Main function
 */
async function main() {
  const args = parseArgs();
  const chromePath = findChromePath();
  console.log(`Using Chrome at: ${chromePath}`);

  const configs = getCVConfigs(args.baseUrl, args.useFile);

  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'], // Required for Netlify
  });

  try {
    if (args.cvType) {
      // Generate single CV
      const config = configs[args.cvType];
      await generatePDF(browser, config.url, config.output, config.title);
    } else {
      // Generate both CVs
      for (const [type, config] of Object.entries(configs)) {
        await generatePDF(browser, config.url, config.output, config.title);
      }
    }
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error('Error generating PDF:', err);
  process.exit(1);
});
