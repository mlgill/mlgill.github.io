import fs from "node:fs";
import http from "node:http";
import path from "node:path";

import puppeteer from "puppeteer";

import { rootDirectory, siteDirectory } from "./site.mjs";

export const browserBaselineRoot = path.join(rootDirectory, "scripts", "tests", "fixtures", "browser");
export const browserActualRoot = path.join(rootDirectory, "tmp", "browser", "actual");
export const browserDiffRoot = path.join(rootDirectory, "tmp", "browser", "visual-diffs");

const routes = [
  { name: "landing", route: "/" },
  { name: "cv", route: "/cv/" },
  { name: "publications", route: "/publications/" },
  { name: "presentations", route: "/presentations/" },
  { name: "blog", route: "/blog/" },
];

const themes = ["light", "dark"];

const viewports = [
  {
    name: "desktop",
    settings: { width: 1440, height: 1000, deviceScaleFactor: 1 },
  },
  {
    name: "mobile",
    settings: { width: 390, height: 844, deviceScaleFactor: 1, isMobile: true, hasTouch: true },
  },
];

const mimeTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".gif", "image/gif"],
  [".html", "text/html; charset=utf-8"],
  [".ico", "image/x-icon"],
  [".jpeg", "image/jpeg"],
  [".jpg", "image/jpeg"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".ttf", "font/ttf"],
  [".webp", "image/webp"],
  [".woff", "font/woff"],
  [".woff2", "font/woff2"],
  [".xml", "application/xml; charset=utf-8"],
]);

export async function captureBrowserScreenshots(outputRoot) {
  fs.rmSync(outputRoot, { recursive: true, force: true });
  fs.mkdirSync(outputRoot, { recursive: true });

  const siteServer = await startSiteServer();
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-gpu",
      "--disable-lcd-text",
      "--font-render-hinting=none",
    ],
  });

  const captures = [];

  try {
    for (const route of routes) {
      for (const viewport of viewports) {
        for (const theme of themes) {
          const fileName = `${route.name}-${viewport.name}-${theme}.png`;
          const outputFile = path.join(outputRoot, fileName);
          const additionalCaptures = await captureCase(browser, siteServer.origin, route, viewport, theme, outputFile);
          captures.push(outputFile);
          captures.push(...additionalCaptures);
        }
      }
    }
  } finally {
    await browser.close();
    await siteServer.close();
  }

  return captures;
}

async function captureCase(browser, origin, route, viewport, theme, outputFile) {
  const page = await browser.newPage();
  const failedLocalRequests = [];
  const additionalCaptures = [];

  try {
    await page.setCacheEnabled(false);
    await page.setViewport(viewport.settings);
    await page.emulateMediaFeatures([{ name: "prefers-color-scheme", value: theme }]);
    await page.evaluateOnNewDocument((selectedTheme) => {
      localStorage.setItem("theme", selectedTheme);
    }, theme);

    await page.setRequestInterception(true);
    page.on("request", (request) => {
      const requestUrl = new URL(request.url());
      const isLocal = requestUrl.origin === origin;
      const isVisualDependency = request.resourceType() === "stylesheet" || request.resourceType() === "font";

      if (isLocal || isVisualDependency) {
        request.continue();
      } else {
        request.abort();
      }
    });
    page.on("requestfailed", (request) => {
      if (request.url().startsWith(origin)) {
        failedLocalRequests.push(`${request.method()} ${request.url()}: ${request.failure()?.errorText}`);
      }
    });

    await page.goto(`${origin}${route.route}`, { waitUntil: "networkidle2" });
    await page.waitForFunction(
      (selectedTheme) => document.documentElement.getAttribute("data-theme") === selectedTheme,
      {},
      theme
    );
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(async () => {
      await Promise.all(
        [...document.images].map(
          (image) =>
            image.complete ||
            new Promise((resolve) => {
              image.addEventListener("load", resolve, { once: true });
              image.addEventListener("error", resolve, { once: true });
            })
        )
      );
    });

    await page.addStyleTag({
      content: `
        *,
        *::before,
        *::after {
          animation: none !important;
          caret-color: transparent !important;
          transition: none !important;
        }
      `,
    });
    await page.evaluate(() => {
      document.querySelectorAll("footer").forEach((footer) => {
        footer.innerHTML = footer.innerHTML.replace(
          /Updated: [A-Z][a-z]+ \d{1,2}, \d{4}\./,
          "Updated: July 29, 2026."
        );
      });
      window.scrollTo(0, 0);
    });

    if (route.name === "landing") {
      const icons = await page.evaluate(async () => {
        const beaker = document.querySelector('.contact-icons a[title="Blog"] .fa-flask');
        const themeToggle = [...document.querySelectorAll("#light-toggle i")].find(
          (icon) => getComputedStyle(icon).display !== "none"
        );
        const themeToggleContent = themeToggle
          ? getComputedStyle(themeToggle, "::before").content.replaceAll('"', "")
          : "";
        const themeToggleFont = themeToggle ? getComputedStyle(themeToggle, "::before").fontFamily : null;

        if (themeToggleContent && themeToggleFont) {
          await document.fonts.load(`400 16px ${themeToggleFont}`, themeToggleContent);
        }

        const fontFaces = [...document.fonts];

        return {
          beakerContent: beaker ? getComputedStyle(beaker, "::before").content : null,
          beakerFont: beaker ? getComputedStyle(beaker, "::before").fontFamily : null,
          fontAwesomeLoaded: fontFaces.some(
            (font) => font.family.includes("Font Awesome 6 Free") && font.status === "loaded"
          ),
          tablerLoaded: fontFaces.some(
            (font) => themeToggleFont?.includes(font.family.replaceAll('"', "")) && font.status === "loaded"
          ),
          themeToggleContent,
          themeToggleFont,
        };
      });

      if (
        !icons.fontAwesomeLoaded ||
        !icons.tablerLoaded ||
        !icons.beakerContent ||
        icons.beakerContent === "none" ||
        !icons.beakerFont?.includes("Font Awesome") ||
        !icons.themeToggleContent ||
        icons.themeToggleContent === "none" ||
        !icons.themeToggleFont?.includes("tabler-icons")
      ) {
        throw new Error(`Expected social and navigation icon glyphs were not rendered: ${JSON.stringify(icons)}`);
      }
    }

    if (failedLocalRequests.length > 0) {
      throw new Error(`Local browser assets failed to load:\n${failedLocalRequests.join("\n")}`);
    }

    await page.screenshot({
      path: outputFile,
      captureBeyondViewport: false,
    });

    if (route.name === "landing") {
      const socialIcons = await page.$(".contact-icons");
      if (!socialIcons) {
        throw new Error("Landing page is missing the social icon row");
      }

      await page.evaluate(() => {
        const backToTop = document.querySelector("#back-to-top");
        if (backToTop) {
          backToTop.style.display = "none";
        }
      });
      const socialIconsFile = outputFile.replace(/\.png$/, "-social-icons.png");
      await socialIcons.screenshot({ path: socialIconsFile });
      additionalCaptures.push(socialIconsFile);
    }

    return additionalCaptures;
  } finally {
    await page.close();
  }
}

async function startSiteServer() {
  const server = http.createServer((request, response) => {
    try {
      const requestUrl = new URL(request.url, "http://127.0.0.1");
      const requestPath = decodeURIComponent(requestUrl.pathname);
      let filePath = path.resolve(siteDirectory, `.${requestPath}`);

      if (!filePath.startsWith(`${siteDirectory}${path.sep}`) && filePath !== siteDirectory) {
        response.writeHead(403);
        response.end("Forbidden");
        return;
      }

      if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
        filePath = path.join(filePath, "index.html");
      }

      if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
        response.writeHead(404);
        response.end("Not found");
        return;
      }

      response.writeHead(200, {
        "Cache-Control": "no-store",
        "Content-Type": mimeTypes.get(path.extname(filePath).toLowerCase()) ?? "application/octet-stream",
      });
      fs.createReadStream(filePath).pipe(response);
    } catch (error) {
      response.writeHead(500);
      response.end(error.message);
    }
  });

  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });

  const address = server.address();
  const origin = `http://127.0.0.1:${address.port}`;

  return {
    origin,
    close: () =>
      new Promise((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });
      }),
  };
}
