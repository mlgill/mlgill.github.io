import fs from "node:fs";
import path from "node:path";

import { contentFixtureRoot, contentSnapshotGroups, pdfSnapshotGroups } from "./helpers/content-snapshots.mjs";

fs.mkdirSync(contentFixtureRoot, { recursive: true });

for (const [name, build] of Object.entries({ ...contentSnapshotGroups, ...pdfSnapshotGroups })) {
  for (const { file, content } of await build()) {
    fs.writeFileSync(path.join(contentFixtureRoot, file), content);
    console.log(`Updated ${name} snapshot ${file}`);
  }
}
