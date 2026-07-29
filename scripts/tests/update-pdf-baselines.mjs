import fs from "node:fs";
import path from "node:path";

import { baselineRoot, pdfConfigurations, renderPdf } from "./helpers/pdf.mjs";

for (const pdf of pdfConfigurations) {
  if (!fs.existsSync(pdf.file)) {
    throw new Error(`Missing ${pdf.file}; build the site and generate the PDFs first`);
  }

  const pages = renderPdf(pdf.file, path.join(baselineRoot, pdf.name));
  console.log(`Updated ${pdf.name} PDF baseline (${pages.length} pages)`);
}
