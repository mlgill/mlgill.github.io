import { checkSnapshots, contentSnapshotGroups } from "./helpers/content-snapshots.mjs";

// Regenerate fixtures with `npm --prefix scripts run test:update-content-snapshots`.
checkSnapshots(contentSnapshotGroups);
