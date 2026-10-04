import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";

import { expectedRoleText, loadRoute, normalizeText, routeFile, selectedText } from "./helpers/site.mjs";

const importantRoutes = [
  { route: "/", selector: ".post", text: "Michelle Lynn Gill" },
  { route: "/cv/", selector: ".cv-content", text: "Overview" },
  { route: "/cv/concise/", selector: ".cv-content", text: "Overview" },
  { route: "/cv/print/", selector: "#content", text: "Overview" },
  { route: "/cv/concise/print/", selector: "#content", text: "Overview" },
  { route: "/publications/", selector: ".publications", text: "publications" },
  { route: "/presentations/", selector: ".post", text: "presentations" },
  { route: "/patents/", selector: ".post", text: "patents" },
  { route: "/press/", selector: ".post", text: "press" },
];

test("production build contains every important route", async (t) => {
  for (const { route, selector, text } of importantRoutes) {
    await t.test(route, () => {
      const file = routeFile(route);
      assert.ok(fs.existsSync(file), `Expected ${file} to exist`);

      const { $ } = loadRoute(route);
      assert.ok($(selector).length > 0, `Expected ${selector} on ${route}`);
      assert.match(normalizeText($.text()), new RegExp(escapeRegExp(text), "i"));
    });
  }
});

test("theme demonstration routes are excluded from the published site", () => {
  for (const route of ["/blog/", "/books/", "/news/", "/people/", "/projects/", "/repositories/", "/teaching/"]) {
    assert.equal(fs.existsSync(path.dirname(routeFile(route))), false, `${route} and its child pages should not be published`);
  }
});

test("shared role data renders consistently on the landing page and every CV variant", () => {
  const expected = expectedRoleText();
  const locations = [
    { route: "/", selector: "p.desc" },
    { route: "/cv/", selector: ".cv-content h1 + p" },
    { route: "/cv/concise/", selector: ".cv-content h1 + p" },
    { route: "/cv/print/", selector: "#content h1 + p" },
    { route: "/cv/concise/print/", selector: "#content h1 + p" },
  ];

  for (const { route, selector } of locations) {
    const { $ } = loadRoute(route);
    assert.equal(selectedText($, selector), expected, `${route} should use the shared role`);
  }
});

test("landing page metadata agrees with the visible current role", () => {
  const { $ } = loadRoute("/");
  const description = $("meta[name='description']").attr("content");
  assert.ok(description, "Landing page is missing its description");
  assert.ok(normalizeText(description).includes(expectedRoleText()), "Landing page description should include the current shared role");
});

test("presentation links agree between the presentations page and full CV", () => {
  const { $: presentations } = loadRoute("/presentations/");
  const { $: cv } = loadRoute("/cv/");
  const pageLinks = presentations("a.btn-presentation")
    .map((_, link) => presentations(link).attr("href"))
    .get();
  const cvLinks = cv("a.pres-slides, a.pres-video, a.pres-abstract, a.pres-program, a.pres-code, a.pres-thesis")
    .map((_, link) => cv(link).attr("href"))
    .get();

  assert.ok(pageLinks.length > 0, "Presentations page should have resource links");
  assert.deepEqual(pageLinks, cvLinks, "Presentation resources should point to the same destinations on both pages");
});

test("CV variants retain the expected major section headings", () => {
  const headings = ["Overview", "Education", "Experience", "Publications", "Patents", "Presentations", "Awards", "Service"];

  for (const route of ["/cv/", "/cv/concise/", "/cv/print/", "/cv/concise/print/"]) {
    const { $ } = loadRoute(route);
    const actual = $("h2, h3")
      .map((_, heading) => normalizeText($(heading).text()))
      .get();

    for (const heading of headings) {
      assert.ok(actual.includes(heading), `${route} should contain the ${heading} heading`);
    }
  }
});

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
