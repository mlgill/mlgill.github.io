import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import * as cheerio from "cheerio";
import YAML from "yaml";

const helperDirectory = path.dirname(fileURLToPath(import.meta.url));

export const scriptsDirectory = path.resolve(helperDirectory, "..", "..");
export const rootDirectory = path.resolve(scriptsDirectory, "..");
export const siteDirectory = path.join(rootDirectory, "_site");

export function readYaml(relativePath) {
  const source = fs.readFileSync(path.join(rootDirectory, relativePath), "utf8");
  return YAML.parse(source);
}

export function routeFile(route) {
  if (route === "/") {
    return path.join(siteDirectory, "index.html");
  }

  const routePath = route.replace(/^\/|\/$/g, "");
  return path.join(siteDirectory, routePath, "index.html");
}

export function loadRoute(route) {
  const file = routeFile(route);
  const html = fs.readFileSync(file, "utf8");
  return { file, html, $: cheerio.load(html) };
}

export function normalizeText(value) {
  return String(value).replace(/\s+/g, " ").trim();
}

export function plainText(value) {
  return normalizeText(
    cheerio
      .load(`<body>${value ?? ""}</body>`)("body")
      .text()
  );
}

export function selectedText($, selector) {
  return normalizeText($(selector).text());
}

export function expectedRoleText() {
  const { role } = readYaml("_data/bio.yml");
  return normalizeText(`${role.title}, ${role.organization} ${role.team}`);
}

// Entries as jekyll-scholar renders them on /publications/, in page order. The
// year comes from the preceding group heading; the title drops the period that
// _layouts/bib.liquid appends.
export function renderedPublications() {
  const { $ } = loadRoute("/publications/");
  const publications = [];
  let year = null;

  $(".publications h2.bibliography, .publications [id]").each((_, element) => {
    const node = $(element);
    if (node.is("h2.bibliography")) {
      year = Number(normalizeText(node.text()));
      return;
    }
    publications.push({
      key: node.attr("id"),
      year,
      title: normalizeText(node.find(".title").first().text()).replace(/\.$/, ""),
    });
  });

  return publications;
}

// Reads only each entry's key and the two flags the site filters on; all other
// publication fields come from the rendered pages.
export function bibliographyFlags() {
  const source = fs.readFileSync(path.join(rootDirectory, "_bibliography", "papers.bib"), "utf8");

  return source
    .split(/^@/m)
    .slice(1)
    .map((block) => {
      const keyMatch = block.match(/^\w+\s*\{\s*([^,\s]+)\s*,/);
      if (!keyMatch) {
        throw new Error(`Cannot read the entry key in papers.bib near "@${block.slice(0, 40)}"`);
      }
      return {
        key: keyMatch[1],
        selected: /^\s*selected\s*=\s*\{true\}/m.test(block),
        recent: /^\s*recent\s*=\s*\{true\}/m.test(block),
      };
    });
}
