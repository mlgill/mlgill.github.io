import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";

import { PNG } from "pngjs";

import {
  actualRoot,
  baselineRoot,
  diffRoot,
  listPageImages,
  pdfConfigurations,
  renderPdf,
  visualPdfDate,
} from "./helpers/pdf.mjs";
import { expectedPreparedText, inspectPdf, parsePreparedDate, validatePdfStructure } from "./helpers/pdf-structure.mjs";
import { expectedRoleText } from "./helpers/site.mjs";
import { compareScreenshotPixels } from "./helpers/visual-comparison.mjs";

const preparedText = expectedPreparedText(parsePreparedDate(visualPdfDate));

test("generated CV PDFs have valid pages, content, and prepared date", async (t) => {
  for (const pdf of pdfConfigurations) {
    await t.test(pdf.name, async () => {
      assert.ok(fs.existsSync(pdf.file), `Missing ${pdf.file}`);
      const summary = await inspectPdf(pdf.file);
      validatePdfStructure(summary, {
        file: pdf.file,
        title: pdf.title,
        role: expectedRoleText(),
        preparedText,
      });
    });
  }
});

test("full-page PDF rendering matches reviewed baselines", async (t) => {
  fs.rmSync(diffRoot, { recursive: true, force: true });

  for (const pdf of pdfConfigurations) {
    await t.test(pdf.name, async (t) => {
      const actualPages = renderPdf(pdf.file, path.join(actualRoot, pdf.name));
      const expectedPages = listPageImages(path.join(baselineRoot, pdf.name));

      assert.ok(expectedPages.length > 0, `No baseline for ${pdf.name}; run npm --prefix scripts run test:update-pdf-baselines`);
      assert.equal(actualPages.length, expectedPages.length, `${pdf.name} PDF page count changed`);

      for (let index = 0; index < expectedPages.length; index++) {
        await t.test(`page-${String(index + 1).padStart(2, "0")}`, () => {
          comparePage(pdf.name, index + 1, expectedPages[index], actualPages[index]);
        });
      }
    });
  }
});

function comparePage(pdfName, pageNumber, expectedFile, actualFile) {
  const expected = PNG.sync.read(fs.readFileSync(expectedFile));
  const actual = PNG.sync.read(fs.readFileSync(actualFile));

  assert.equal(actual.width, expected.width, `${pdfName} page ${pageNumber} width changed`);
  assert.equal(actual.height, expected.height, `${pdfName} page ${pageNumber} height changed`);

  const { differentPixels, allowedDifferentPixels, diff } = compareScreenshotPixels(expected.data, actual.data, expected.width, expected.height);

  if (diff) {
    const outputDirectory = path.join(diffRoot, pdfName);
    fs.mkdirSync(outputDirectory, { recursive: true });
    const prefix = `page-${String(pageNumber).padStart(2, "0")}`;
    fs.copyFileSync(expectedFile, path.join(outputDirectory, `${prefix}-expected.png`));
    fs.copyFileSync(actualFile, path.join(outputDirectory, `${prefix}-actual.png`));
    fs.writeFileSync(path.join(outputDirectory, `${prefix}-diff.png`), PNG.sync.write(diff));
  }

  assert.ok(
    differentPixels <= allowedDifferentPixels,
    `${pdfName} page ${pageNumber} differs from baseline by ${differentPixels} pixels (maximum ${allowedDifferentPixels}); visual artifacts are in ${diffRoot}`
  );
}
