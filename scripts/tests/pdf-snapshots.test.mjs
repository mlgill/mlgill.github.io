import { checkSnapshots, pdfSnapshotGroups } from "./helpers/content-snapshots.mjs";

// Needs PDFs generated with `node scripts/generate-cv-pdf.js --prepared-date 2026-07-29`.
checkSnapshots(pdfSnapshotGroups);
