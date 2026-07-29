import { browserBaselineRoot, captureBrowserScreenshots } from "./helpers/browser.mjs";

const screenshots = await captureBrowserScreenshots(browserBaselineRoot);
console.log(`Updated browser baseline (${screenshots.length} screenshots)`);
