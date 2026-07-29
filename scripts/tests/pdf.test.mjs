import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";

import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";

import {
  actualRoot,
  baselineRoot,
  diffRoot,
  expectedPreparedText,
  listPageImages,
  pdfConfigurations,
  renderPdf,
  runCommand,
} from "./helpers/pdf.mjs";
import { expectedRoleText, normalizeText } from "./helpers/site.mjs";

const letterWidthPoints = 612;
const letterHeightPoints = 792;
const pageSizeTolerancePoints = 0.5;
const requiredHeadings = ["Overview", "Education", "Experience", "Publications", "Patents", "Presentations", "Awards", "Service"];

test("generated CV PDFs are nonempty US Letter documents with expected text", async (t) => {
  for (const pdf of pdfConfigurations) {
    await t.test(pdf.name, () => {
      assert.ok(fs.existsSync(pdf.file), `Missing ${pdf.file}`);
      assert.ok(fs.statSync(pdf.file).size > 10_000, `${pdf.file} is unexpectedly small`);

      const info = runCommand("pdfinfo", [pdf.file]);
      const pages = Number(/^Pages:\s+(\d+)$/m.exec(info)?.[1]);
      const size = /^Page size:\s+([\d.]+) x ([\d.]+) pts/m.exec(info);

      assert.ok(Number.isInteger(pages) && pages > 0, `${pdf.file} has no pages`);
      assert.ok(size, `Could not read page size from ${pdf.file}`);
      assert.ok(Math.abs(Number(size[1]) - letterWidthPoints) <= pageSizeTolerancePoints, `${pdf.file} is not US Letter width`);
      assert.ok(Math.abs(Number(size[2]) - letterHeightPoints) <= pageSizeTolerancePoints, `${pdf.file} is not US Letter height`);

      const text = normalizeText(runCommand("pdftotext", [pdf.file, "-"]));
      assert.ok(text.includes(expectedRoleText()), `${pdf.file} is missing the shared role`);
      assert.ok(text.includes(expectedPreparedText), `${pdf.file} lacks the fixed prepared date`);
      for (const heading of requiredHeadings) {
        assert.ok(text.includes(heading), `${pdf.file} is missing the ${heading} heading`);
      }
    });
  }
});

test("every rendered PDF page contains body content", async (t) => {
  for (const pdf of pdfConfigurations) {
    await t.test(pdf.name, () => {
      const pages = renderPdf(pdf.file, path.join(actualRoot, pdf.name));
      assert.ok(pages.length > 0, `${pdf.file} rendered no pages`);

      for (const page of pages) {
        const image = PNG.sync.read(fs.readFileSync(page));
        const bodyHeight = Math.floor(image.height * 0.92);
        let nonWhitePixels = 0;

        for (let y = 0; y < bodyHeight; y++) {
          for (let x = 0; x < image.width; x++) {
            const offset = (image.width * y + x) * 4;
            if (image.data[offset] < 250 || image.data[offset + 1] < 250 || image.data[offset + 2] < 250) {
              nonWhitePixels++;
            }
          }
        }

        const ratio = nonWhitePixels / (image.width * bodyHeight);
        assert.ok(ratio > 0.001, `${page} appears blank`);
      }
    });
  }
});

test("full-page PDF rendering matches reviewed baselines", async (t) => {
  fs.rmSync(diffRoot, { recursive: true, force: true });

  for (const pdf of pdfConfigurations) {
    await t.test(pdf.name, () => {
      const actualPages = listPageImages(path.join(actualRoot, pdf.name));
      const expectedPages = listPageImages(path.join(baselineRoot, pdf.name));

      assert.ok(expectedPages.length > 0, `No baseline for ${pdf.name}; run npm --prefix scripts run test:update-pdf-baselines`);
      assert.equal(actualPages.length, expectedPages.length, `${pdf.name} PDF page count changed`);

      for (let index = 0; index < expectedPages.length; index++) {
        comparePage(pdf.name, index + 1, expectedPages[index], actualPages[index]);
      }
    });
  }
});

function comparePage(pdfName, pageNumber, expectedFile, actualFile) {
  const expected = PNG.sync.read(fs.readFileSync(expectedFile));
  const actual = PNG.sync.read(fs.readFileSync(actualFile));

  assert.equal(actual.width, expected.width, `${pdfName} page ${pageNumber} width changed`);
  assert.equal(actual.height, expected.height, `${pdfName} page ${pageNumber} height changed`);

  let differentPixels = 0;
  for (let offset = 0; offset < expected.data.length; offset += 4) {
    if (
      expected.data[offset] !== actual.data[offset] ||
      expected.data[offset + 1] !== actual.data[offset + 1] ||
      expected.data[offset + 2] !== actual.data[offset + 2] ||
      expected.data[offset + 3] !== actual.data[offset + 3]
    ) {
      differentPixels++;
    }
  }

  const diff = new PNG({ width: expected.width, height: expected.height });
  pixelmatch(expected.data, actual.data, diff.data, expected.width, expected.height, {
    threshold: 0,
    includeAA: true,
  });

  if (differentPixels > 0) {
    const outputDirectory = path.join(diffRoot, pdfName);
    fs.mkdirSync(outputDirectory, { recursive: true });
    const prefix = `page-${String(pageNumber).padStart(2, "0")}`;
    fs.copyFileSync(expectedFile, path.join(outputDirectory, `${prefix}-expected.png`));
    fs.copyFileSync(actualFile, path.join(outputDirectory, `${prefix}-actual.png`));
    fs.writeFileSync(path.join(outputDirectory, `${prefix}-diff.png`), PNG.sync.write(diff));
  }

  assert.equal(
    differentPixels,
    0,
    `${pdfName} page ${pageNumber} differs from baseline by ${differentPixels} pixels; visual artifacts are in ${diffRoot}`
  );
}
