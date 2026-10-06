import fs from "node:fs";
import path from "node:path";

import { inspectPdf } from "./pdf-structure.mjs";
import { pdfConfigurations } from "./pdf.mjs";
import { loadRoute, normalizeText, scriptsDirectory, selectedText } from "./site.mjs";

export const contentFixtureRoot = path.join(scriptsDirectory, "tests", "fixtures", "content");

const cvRoutes = [
  { name: "full", route: "/cv/" },
  { name: "concise", route: "/cv/concise/" },
];

export function normalizeHtml(html) {
  return html.replace(/\s+/g, " ").replace(/> </g, "><").trim();
}

function cvTextSnapshots() {
  return cvRoutes.map(({ name, route }) => ({
    file: `cv-${name}.txt`,
    content: `${selectedText(loadRoute(route).$, ".cv-content")}\n`,
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
    snapshots.push({ file: `cv-pdf-${pdf.name === "descriptive" ? "full" : "concise"}.txt`, content: `${body}\n` });
  }
  return snapshots;
}

// `content` groups need only the built site; the `pdf` group also needs the
// generated PDFs. The test names carry `kind` so each npm script can select its groups.
export const snapshotGroups = {
  "CV text": { kind: "content", build: cvTextSnapshots },
  "CV bibliography HTML": { kind: "content", build: cvBibliographySnapshots },
  "publication keys": { kind: "content", build: publicationKeySnapshots },
  "CV PDF body text": { kind: "pdf", build: pdfTextSnapshots },
};
