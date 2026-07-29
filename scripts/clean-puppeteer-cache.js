#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const puppeteerConfig = require("../.puppeteerrc.cjs");

const repositoryRoot = path.resolve(__dirname, "..");
const expectedCacheDirectory = path.join(repositoryRoot, ".cache", "puppeteer");
const configuredCacheDirectory = path.resolve(puppeteerConfig.cacheDirectory);

if (configuredCacheDirectory !== expectedCacheDirectory) {
  throw new Error(`Refusing to remove unexpected cache directory: ${configuredCacheDirectory}`);
}

fs.rmSync(configuredCacheDirectory, { recursive: true, force: true });
console.log(`Removed Puppeteer cache: ${configuredCacheDirectory}`);
