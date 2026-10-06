import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";

import { inspectPdf } from "./pdf-structure.mjs";
import { pdfConfigurations } from "./pdf.mjs";
import { loadRoute, normalizeText, scriptsDirectory } from "./site.mjs";

export const contentFixtureRoot = path.join(scriptsDirectory, "tests", "fixtures", "content");

const cvRoutes = [
  { name: "descriptive", route: "/cv/" },
  { name: "concise", route: "/cv/concise/" },
];

export function normalizeHtml(html) {
  return html.replace(/\s+/g, " ").replace(/> </g, "><").replace(/<\/li>/g, "</li>\n").trim();
}

// One line per outermost block element, in document order, so diffs are line-based.
function cvBlockLines($) {
  const blocks = "h1, h2, h3, p, li";
  return $(".cv-content")
    .find(blocks)
    .filter((_, element) => $(element).parentsUntil(".cv-content").filter(blocks).length === 0)
    .map((_, element) => normalizeText($(element).text()))
    .get()
    .filter((line) => line.length > 0);
}

function cvTextSnapshots() {
  return cvRoutes.map(({ name, route }) => ({
    file: `cv-${name}.txt`,
    content: `${cvBlockLines(loadRoute(route).$).join("\n")}\n`,
  }));
}

function cvBibliographySnapshots() {
  return cvRoutes.map(({ name, route }) => ({
    file: `cv-bibliography-${name}.html`,
    content: `${normalizeHtml(loadRoute(route).$("ol.bibliography").html())}\n`,
  }));
}

function publicationKeySnapshots() {
  const { $ } = loadRoute("/publications/");
  const keys = $(".publications [id]")
    .map((_, element) => $(element).attr("id"))
    .get();
  return [{ file: "publications-keys.txt", content: `${keys.join("\n")}\n` }];
}

async function pdfTextSnapshots() {
  const snapshots = [];
  for (const pdf of pdfConfigurations) {
    if (!fs.existsSync(pdf.file)) {
      throw new Error(`Missing ${pdf.file}; build the site and generate the PDFs first`);
    }
    const { pages } = await inspectPdf(pdf.file);
    const body = pages.map((page, index) => `---- page ${index + 1} ----\n${normalizeText(page.bodyText)}`).join("\n");
    snapshots.push({ file: `cv-pdf-${pdf.name}.txt`, content: `${body}\n` });
  }
  return snapshots;
}

export const contentSnapshotGroups = {
  "CV text": cvTextSnapshots,
  "CV bibliography HTML": cvBibliographySnapshots,
  "publication keys": publicationKeySnapshots,
};

export const pdfSnapshotGroups = {
  "CV PDF body text": pdfTextSnapshots,
};

export function checkSnapshots(groups) {
  for (const [name, build] of Object.entries(groups)) {
    test(`snapshot: ${name}`, async () => {
      for (const { file, content } of await build()) {
        const fixture = path.join(contentFixtureRoot, file);
        assert.ok(fs.existsSync(fixture), `Missing fixture ${file}; run test:update-content-snapshots`);
        assert.equal(content, fs.readFileSync(fixture, "utf8"), `${file} differs from its reviewed snapshot`);
      }
    });
  }
}
