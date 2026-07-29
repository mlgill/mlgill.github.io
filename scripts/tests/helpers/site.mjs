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
