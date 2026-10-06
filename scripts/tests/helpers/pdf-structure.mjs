import fs from "node:fs";

import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

import { normalizeText, requiredHeadings } from "./site.mjs";

export const letterWidthPoints = 612;
export const letterHeightPoints = 792;
export const pageSizeTolerancePoints = 0.5;

export function parsePreparedDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(`Prepared date must be YYYY-MM-DD, got ${value}`);
  }
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() + 1 !== month || date.getDate() !== day) {
    throw new Error(`Prepared date is not a valid date: ${value}`);
  }
  return date;
}

export function expectedPreparedText(date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `Prepared ${month}/${day}/${date.getFullYear()}`;
}

export async function inspectPdf(file) {
  const bytes = fs.readFileSync(file);
  const task = getDocument({ data: new Uint8Array(bytes), useSystemFonts: true });

  try {
    const document = await task.promise;
    const pages = [];

    for (let number = 1; number <= document.numPages; number++) {
      const page = await document.getPage(number);
      const { width, height } = page.getViewport({ scale: 1 });
      const items = (await page.getTextContent()).items;
      pages.push({
        width,
        height,
        text: normalizeText(items.map((item) => item.str).join(" ")),
        // The generated footer sits below this line on every Letter page.
        bodyText: normalizeText(
          items
            .filter((item) => item.transform[5] > 48)
            .map((item) => item.str)
            .join(" ")
        ),
      });
    }

    return { bytes: bytes.length, pages };
  } finally {
    await task.destroy();
  }
}

export function validatePdfStructure(summary, { file, title, role, preparedText }) {
  if (summary.bytes <= 10_000) {
    throw new Error(`${file} is unexpectedly small`);
  }
  if (summary.pages.length === 0) {
    throw new Error(`${file} has no pages`);
  }

  for (const [index, page] of summary.pages.entries()) {
    const pageLabel = `${file} page ${index + 1}`;
    if (Math.abs(page.width - letterWidthPoints) > pageSizeTolerancePoints || Math.abs(page.height - letterHeightPoints) > pageSizeTolerancePoints) {
      throw new Error(`${pageLabel} is not US Letter size`);
    }
    if (page.bodyText.length === 0) {
      throw new Error(`${pageLabel} has no body content and may be blank`);
    }
    if (!page.text.includes(preparedText)) {
      throw new Error(`${pageLabel} is missing ${preparedText}`);
    }
    if (!page.text.includes(`Michelle Lynn Gill · ${title}`)) {
      throw new Error(`${pageLabel} is missing the ${title} footer`);
    }
  }

  const documentText = normalizeText(summary.pages.map((page) => page.text).join(" "));
  for (const expected of [role, ...requiredHeadings]) {
    if (!documentText.includes(expected)) {
      throw new Error(`${file} is missing ${expected}`);
    }
  }
}
