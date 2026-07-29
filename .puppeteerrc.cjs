const path = require("node:path");

module.exports = {
  cacheDirectory: path.join(__dirname, ".cache", "puppeteer"),
  chrome: {
    skipDownload: false,
  },
  "chrome-headless-shell": {
    skipDownload: true,
  },
};
