import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";

import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";

import {
  browserActualRoot,
  browserBaselineRoot,
  browserDiffRoot,
  captureBrowserScreenshots,
} from "./helpers/browser.mjs";

test("representative website views match reviewed browser baselines", async () => {
  fs.rmSync(browserDiffRoot, { recursive: true, force: true });
  const actualFiles = await captureBrowserScreenshots(browserActualRoot);
  assert.equal(actualFiles.length, 24, "Expected 20 page captures and four social icon captures");

  for (const actualFile of actualFiles) {
    const baselineFile = path.join(browserBaselineRoot, path.basename(actualFile));
    assert.ok(fs.existsSync(baselineFile), `Missing browser baseline ${baselineFile}`);
    compareScreenshot(baselineFile, actualFile);
  }
});

function compareScreenshot(expectedFile, actualFile) {
  const expected = PNG.sync.read(fs.readFileSync(expectedFile));
  const actual = PNG.sync.read(fs.readFileSync(actualFile));

  assert.equal(actual.width, expected.width, `${path.basename(actualFile)} width changed`);
  assert.equal(actual.height, expected.height, `${path.basename(actualFile)} height changed`);

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

  if (differentPixels > 0) {
    const diff = new PNG({ width: expected.width, height: expected.height });
    pixelmatch(expected.data, actual.data, diff.data, expected.width, expected.height, {
      threshold: 0,
      includeAA: true,
    });

    fs.mkdirSync(browserDiffRoot, { recursive: true });
    const baseName = path.basename(actualFile, ".png");
    fs.copyFileSync(expectedFile, path.join(browserDiffRoot, `${baseName}-expected.png`));
    fs.copyFileSync(actualFile, path.join(browserDiffRoot, `${baseName}-actual.png`));
    fs.writeFileSync(path.join(browserDiffRoot, `${baseName}-diff.png`), PNG.sync.write(diff));
  }

  assert.equal(
    differentPixels,
    0,
    `${path.basename(actualFile)} differs from its baseline by ${differentPixels} pixels; visual artifacts are in ${browserDiffRoot}`
  );
}
