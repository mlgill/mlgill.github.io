import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";

import { contentFixtureRoot, snapshotGroups } from "./helpers/content-snapshots.mjs";

// `test:content` runs the "content snapshot" tests and `test:pdf` runs the
// "pdf snapshot" test, which needs PDFs generated with the fixed prepared date.
// Regenerate fixtures with `npm --prefix scripts run test:update-content-snapshots`.
for (const [name, group] of Object.entries(snapshotGroups)) {
  test(`${group.kind} snapshot: ${name}`, async () => {
    for (const { file, content } of await group.build()) {
      const fixture = path.join(contentFixtureRoot, file);
      assert.ok(fs.existsSync(fixture), `Missing fixture ${file}; run test:update-content-snapshots`);
      assert.equal(content, fs.readFileSync(fixture, "utf8"), `${file} differs from its reviewed snapshot`);
    }
  });
}
