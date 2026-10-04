import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";

import { PNG } from "pngjs";

import { browserActualRoot, browserBaselineRoot, browserDiffRoot, captureBrowserScreenshots } from "./helpers/browser.mjs";
import { compareScreenshotPixels, maximumVisualDifferenceRatio } from "./helpers/visual-comparison.mjs";

test("visual comparison ignores color-level raster variation and detects icon or text changes", () => {
  const expected = new PNG({ width: 64, height: 32 });
  expected.data.fill(255);
  for (let x = 12; x < 28; x++) {
    const offset = (12 * expected.width + x) * 4;
    expected.data.fill(0, offset, offset + 3);
  }
  for (let y = 8; y < 17; y++) {
    const offset = (y * expected.width + 44) * 4;
    expected.data.fill(0, offset, offset + 3);
  }

  const rasterVariation = new PNG({ width: expected.width, height: expected.height });
  rasterVariation.data.set(expected.data);
  for (let x = 12; x < 28; x++) {
    const offset = (11 * expected.width + x) * 4;
    rasterVariation.data.fill(235, offset, offset + 3);
  }
  const toleratedVariation = compareScreenshotPixels(expected.data, rasterVariation.data, expected.width, expected.height);
  assert.ok(toleratedVariation.differentPixels <= toleratedVariation.allowedDifferentPixels);

  const missingIcon = new PNG({ width: expected.width, height: expected.height });
  missingIcon.data.set(expected.data);
  for (let y = 8; y < 17; y++) {
    const offset = (y * expected.width + 44) * 4;
    missingIcon.data.fill(255, offset, offset + 4);
  }
  assert.ok(
    compareScreenshotPixels(expected.data, missingIcon.data, expected.width, expected.height).differentPixels >
      Math.floor(expected.width * expected.height * maximumVisualDifferenceRatio),
    "a missing icon must remain visible to the comparison"
  );

  const shiftedText = new PNG({ width: expected.width, height: expected.height });
  shiftedText.data.set(expected.data);
  for (let x = 11; x < 27; x++) {
    const offset = (12 * expected.width + x) * 4;
    shiftedText.data.fill(255, offset, offset + 4);
  }
  for (let x = 13; x < 29; x++) {
    const offset = (12 * expected.width + x) * 4;
    shiftedText.data.fill(0, offset, offset + 3);
  }
  assert.ok(
    compareScreenshotPixels(expected.data, shiftedText.data, expected.width, expected.height).differentPixels >
      Math.floor(expected.width * expected.height * maximumVisualDifferenceRatio),
    "a one-pixel text shift must remain visible to the comparison"
  );
});

test("representative website views match reviewed browser baselines", async (t) => {
  fs.rmSync(browserDiffRoot, { recursive: true, force: true });
  const actualFiles = await captureBrowserScreenshots(browserActualRoot);
  assert.equal(actualFiles.length, 24, "Expected 20 page captures and four social icon captures");

  for (const actualFile of actualFiles) {
    await t.test(path.basename(actualFile, ".png"), () => {
      const baselineFile = path.join(browserBaselineRoot, path.basename(actualFile));
      assert.ok(fs.existsSync(baselineFile), `Missing browser baseline ${baselineFile}`);
      compareScreenshot(baselineFile, actualFile);
    });
  }
});

function compareScreenshot(expectedFile, actualFile) {
  const expected = PNG.sync.read(fs.readFileSync(expectedFile));
  const actual = PNG.sync.read(fs.readFileSync(actualFile));

  assert.equal(actual.width, expected.width, `${path.basename(actualFile)} width changed`);
  assert.equal(actual.height, expected.height, `${path.basename(actualFile)} height changed`);

  const { differentPixels, allowedDifferentPixels, diff } = compareScreenshotPixels(expected.data, actual.data, expected.width, expected.height);
  if (diff) {
    fs.mkdirSync(browserDiffRoot, { recursive: true });
    const baseName = path.basename(actualFile, ".png");
    fs.copyFileSync(expectedFile, path.join(browserDiffRoot, `${baseName}-expected.png`));
    fs.copyFileSync(actualFile, path.join(browserDiffRoot, `${baseName}-actual.png`));
    fs.writeFileSync(path.join(browserDiffRoot, `${baseName}-diff.png`), PNG.sync.write(diff));
  }

  assert.ok(
    differentPixels <= allowedDifferentPixels,
    `${path.basename(
      actualFile
    )} differs from its baseline by ${differentPixels} pixels (maximum ${allowedDifferentPixels}); visual artifacts are in ${browserDiffRoot}`
  );
}
