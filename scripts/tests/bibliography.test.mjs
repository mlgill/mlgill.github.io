import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";

import { bibliographyFields, loadRoute, renderedPublications, rootDirectory } from "./helpers/site.mjs";

const bibEntries = bibliographyFields();
const publications = renderedPublications();

test("bibliography keys are unique", () => {
  const bibKeys = bibEntries.map((entry) => entry.key);
  assert.equal(new Set(bibKeys).size, bibKeys.length, `papers.bib has a duplicate key: ${bibKeys.join(", ")}`);

  const renderedKeys = publications.map((entry) => entry.key);
  assert.equal(new Set(renderedKeys).size, renderedKeys.length, `/publications/ has a duplicate id: ${renderedKeys.join(", ")}`);
});

test("publications page renders every papers.bib entry", () => {
  assert.deepEqual(
    publications.map((entry) => entry.key).sort(),
    bibEntries.map((entry) => entry.key).sort(),
    "/publications/ entries differ from papers.bib"
  );
});

// scholar.sort_by in _config.yml (with _plugins/scholar-sort-by-key.rb) orders
// every bibliography by year descending, then citation key ascending.
test("rendered publications are ordered by year descending, then key ascending", () => {
  for (let index = 1; index < publications.length; index += 1) {
    const previous = publications[index - 1];
    const current = publications[index];
    const ordered = previous.year > current.year || (previous.year === current.year && previous.key < current.key);
    assert.ok(ordered, `papers.bib lists ${previous.key} (${previous.year}) before ${current.key} (${current.year})`);
  }
});

test("landing page renders every publication marked recent", () => {
  const { $ } = loadRoute("/");
  const renderedIds = new Set(
    $("[id]")
      .map((_, element) => $(element).attr("id"))
      .get()
  );
  const recent = bibEntries.filter((entry) => entry.recent);

  assert.ok(recent.length > 0, "Expected at least one publication marked recent");
  for (const entry of recent) {
    assert.ok(renderedIds.has(entry.key), `Landing page is missing recent publication ${entry.key}`);
  }
});

test("entries with a local PDF render a button to an existing file", () => {
  const { $ } = loadRoute("/publications/");
  const localPdfEntries = bibEntries.filter((entry) => entry.pdf && !entry.pdf.includes("://"));

  assert.ok(localPdfEntries.length > 0, "Expected at least one publication with a local PDF");
  for (const entry of localPdfEntries) {
    const pdfFile = path.join(rootDirectory, "assets", "pdf", entry.pdf);
    assert.ok(fs.existsSync(pdfFile), `${entry.key} references missing PDF ${pdfFile}`);

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
