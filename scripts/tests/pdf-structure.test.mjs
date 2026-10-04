import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";

import { pdfConfigurations } from "./helpers/pdf.mjs";
import { expectedPreparedText, inspectPdf, validatePdfStructure } from "./helpers/pdf-structure.mjs";
import { expectedRoleText } from "./helpers/site.mjs";

function preparedDate() {
  const fixedDate = process.env.CV_PDF_EXPECTED_DATE;
  if (fixedDate === undefined) {
    throw new Error("CV_PDF_EXPECTED_DATE is required and must be YYYY-MM-DD");
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fixedDate)) {
    throw new Error("CV_PDF_EXPECTED_DATE must be YYYY-MM-DD");
  }
  const [year, month, day] = fixedDate.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() + 1 !== month || date.getDate() !== day) {
    throw new Error("CV_PDF_EXPECTED_DATE is not a valid date");
  }
  return date;
}

const preparedText = expectedPreparedText(preparedDate());

test("generated CV PDFs have valid pages, content, and prepared date", async (t) => {
  for (const pdf of pdfConfigurations) {
    await t.test(pdf.name, async () => {
      assert.ok(fs.existsSync(pdf.file), `Missing ${pdf.file}`);
      const summary = await inspectPdf(pdf.file);
      validatePdfStructure(summary, {
        file: pdf.file,
        title: pdf.title,
        role: expectedRoleText(),
        preparedText,
      });
    });
  }
});

test("PDF structure checks reject corrupt files and missing content", async () => {
  const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "cv-pdf-check-"));
  const corruptFile = path.join(temporaryDirectory, "corrupt.pdf");
  try {
    fs.writeFileSync(corruptFile, "not a PDF");
    await assert.rejects(inspectPdf(corruptFile));

    const pdf = pdfConfigurations[0];
    const summary = await inspectPdf(pdf.file);
    const options = { file: pdf.file, title: pdf.title, role: expectedRoleText(), preparedText };
    const blankPage = { ...summary, pages: [{ ...summary.pages[0], bodyText: "" }, ...summary.pages.slice(1)] };
    assert.throws(() => validatePdfStructure(blankPage, options), /no body content/);

    const missingRole = { ...options, role: "Role deliberately absent from PDF" };
    assert.throws(() => validatePdfStructure(summary, missingRole), /missing Role deliberately absent/);
  } finally {
    fs.rmSync(temporaryDirectory, { recursive: true, force: true });
  }
});
