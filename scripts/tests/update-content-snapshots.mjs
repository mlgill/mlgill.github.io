import fs from "node:fs";
import path from "node:path";

import { contentFixtureRoot, snapshotGroups } from "./helpers/content-snapshots.mjs";

fs.mkdirSync(contentFixtureRoot, { recursive: true });

for (const [name, group] of Object.entries(snapshotGroups)) {
  for (const { file, content } of await group.build()) {
    fs.writeFileSync(path.join(contentFixtureRoot, file), content);
    console.log(`Updated ${name} snapshot ${file}`);
  }
}
