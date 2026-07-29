import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import assert from "node:assert/strict";

import { loadRoute, readYaml, rootDirectory } from "./helpers/site.mjs";

const entries = readYaml("_data/bibliography_cache.yml");

test("bibliography cache is synchronized with papers.bib", () => {
  const result = spawnSync("node", ["scripts/prebuild-bibliography.js", "--check"], {
    cwd: rootDirectory,
    encoding: "utf8",
  });

  assert.equal(result.status, 0, `Bibliography synchronization failed:\n${result.stdout}\n${result.stderr}`);
});

test("bibliography keys are unique and local paper PDFs exist", () => {
  const seen = new Set();

  for (const entry of entries) {
    assert.ok(!seen.has(entry.key), `Duplicate bibliography key: ${entry.key}`);
    seen.add(entry.key);

    if (entry.pdf && !entry.pdf.includes("://")) {
      const pdfFile = path.join(rootDirectory, "assets", "pdf", entry.pdf);
      assert.ok(fs.existsSync(pdfFile), `${entry.key} references missing PDF ${pdfFile}`);
    }
  }
});

test("publications page renders every cached bibliography entry", () => {
  const { $ } = loadRoute("/publications/");
  const renderedIds = new Set(
    $("[id]")
      .map((_, element) => $(element).attr("id"))
      .get()
  );

  for (const entry of entries) {
    assert.ok(renderedIds.has(entry.key), `Publications page is missing ${entry.key}`);
  }
});

test("landing page renders every publication marked recent", () => {
  const { $ } = loadRoute("/");
  const renderedIds = new Set(
    $("[id]")
      .map((_, element) => $(element).attr("id"))
      .get()
  );
  const recent = entries.filter((entry) => entry.recent === true);

  assert.ok(recent.length > 0, "Expected at least one publication marked recent");
  for (const entry of recent) {
    assert.ok(renderedIds.has(entry.key), `Landing page is missing recent publication ${entry.key}`);
  }
});

test("publication PDF buttons point to the cached local files", () => {
  const { $ } = loadRoute("/publications/");

  for (const entry of entries.filter((item) => item.pdf && !item.pdf.includes("://"))) {
    const hrefs = $(`[id="${entry.key}"]`)
      .find("a.btn-pdf")
      .map((_, link) => $(link).attr("href"))
      .get();
    assert.ok(
      hrefs.some((href) => href.endsWith(`/assets/pdf/${entry.pdf}`)),
      `${entry.key} is missing its PDF button`
    );
  }
});
