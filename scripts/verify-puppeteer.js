#!/usr/bin/env node

const fs = require("node:fs");
const puppeteer = require("puppeteer");

async function main() {
  const executablePath = await puppeteer.executablePath();
  if (!fs.existsSync(executablePath)) {
    throw new Error(`Chrome executable is missing: ${executablePath}`);
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    console.log(`Chrome executable: ${executablePath}`);
    console.log(`Chrome version: ${await browser.version()}`);
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(`Puppeteer verification failed: ${error.message}`);
  process.exit(1);
});
