import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";

import { bibliographyFlags, loadRoute, renderedPublications, rootDirectory } from "./helpers/site.mjs";

const bibEntries = bibliographyFlags();
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

// jekyll-scholar renders papers.bib in file order (scholar.sort_by is unset),
// and the CV publication list follows that order.
test("papers.bib entries are ordered by year descending, then key ascending", () => {
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

test("local publication PDF buttons point to existing files", () => {
  const { $ } = loadRoute("/publications/");
  const hrefs = $(".publications a.btn-pdf")
    .map((_, link) => $(link).attr("href"))
    .get()
    .filter((href) => !href.includes("://"));

  assert.ok(hrefs.length > 0, "Expected at least one local publication PDF button");
  for (const href of hrefs) {
    const pdfFile = path.join(rootDirectory, decodeURIComponent(href));
    assert.ok(fs.existsSync(pdfFile), `${href} points to missing PDF ${pdfFile}`);
  }
});
