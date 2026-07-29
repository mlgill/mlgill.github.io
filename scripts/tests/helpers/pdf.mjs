import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

import { rootDirectory } from "./site.mjs";

export const renderDpi = 110;
export const pdfPreparedDate = "2026-07-29";
export const expectedPreparedText = "Prepared 07/29/2026";

export const pdfConfigurations = [
  {
    name: "descriptive",
    title: "Descriptive CV",
    file: path.join(rootDirectory, "_site", "assets", "pdf", "GillMichelle_DescriptiveCV.pdf"),
  },
  {
    name: "concise",
    title: "Concise CV",
    file: path.join(rootDirectory, "_site", "assets", "pdf", "GillMichelle_ConciseCV.pdf"),
  },
];

export const baselineRoot = path.join(rootDirectory, "scripts", "tests", "fixtures", "pdf");
export const actualRoot = path.join(rootDirectory, "tmp", "pdfs", "actual");
export const diffRoot = path.join(rootDirectory, "tmp", "pdfs", "visual-diffs");

export function runCommand(command, args) {
  const result = spawnSync(command, args, {
    cwd: rootDirectory,
    encoding: "utf8",
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(`${command} failed with status ${result.status}\n${result.stdout}\n${result.stderr}`.trim());
  }

  return result.stdout;
}

export function renderPdf(pdfFile, outputDirectory) {
  fs.rmSync(outputDirectory, { recursive: true, force: true });
  fs.mkdirSync(outputDirectory, { recursive: true });
  runCommand("pdftoppm", ["-png", "-r", String(renderDpi), pdfFile, path.join(outputDirectory, "page")]);
  return listPageImages(outputDirectory);
}

export function listPageImages(directory) {
  if (!fs.existsSync(directory)) {
    return [];
  }

  return fs
    .readdirSync(directory)
    .filter((file) => /^page-\d+\.png$/.test(file))
    .sort((left, right) => pageNumber(left) - pageNumber(right))
    .map((file) => path.join(directory, file));
}

function pageNumber(file) {
  return Number(/^page-(\d+)\.png$/.exec(file)[1]);
}
