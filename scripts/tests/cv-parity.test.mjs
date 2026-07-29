import test from "node:test";
import assert from "node:assert/strict";

import { loadRoute, normalizeText, plainText, readYaml, selectedText } from "./helpers/site.mjs";

const fullRoutes = [
  { route: "/cv/", selector: ".cv-content" },
  { route: "/cv/print/", selector: "#content" },
];
const conciseRoutes = [
  { route: "/cv/concise/", selector: ".cv-content" },
  { route: "/cv/concise/print/", selector: "#content" },
];

const records = [
  ...flatRecords("education", readYaml("_data/education.yml"), (entry) => `${entry.year} ${entry.title} ${entry.institution}, ${entry.location}`),
  ...flatRecords("experience", readYaml("_data/experience.yml"), (entry) => `${entry.year} ${entry.title}, ${entry.institution}`),
  ...groupedRecords("patent", readYaml("_data/patents.yml"), (entry, group) => `${group.year} ${entry.title}`),
  ...groupedRecords("presentation", readYaml("_data/presentations.yml"), (entry, group) => `${group.year} ${entry.title}`),
  ...flatRecords("award", readYaml("_data/awards.yml"), (entry) => `${entry.year} ${entry.items.join("; ")}`),
  ...flatRecords("service", readYaml("_data/service.yml"), (entry) => `${entry.year} ${entry.title}, ${entry.institution}`),
  ...flatRecords("publication", readYaml("_data/bibliography_cache.yml"), (entry) => entry.title),
];

test("web and print CVs contain the same normalized content", () => {
  assert.equal(routeText(fullRoutes[0]), routeText(fullRoutes[1]), "Descriptive web and print CVs differ");
  assert.equal(routeText(conciseRoutes[0]), routeText(conciseRoutes[1]), "Concise web and print CVs differ");
});

test("descriptive CV includes visible entries and excludes archived entries", () => {
  for (const location of fullRoutes) {
    const content = routeText(location);
    for (const record of records) {
      const included = content.includes(record.text);
      assert.equal(included, record.visible, `${location.route}: ${record.kind} "${record.text}" has the wrong visibility`);
    }
  }
});

test("concise CV includes exactly the visible entries selected for it", () => {
  for (const location of conciseRoutes) {
    const content = routeText(location);
    for (const record of records) {
      const expected = record.visible && record.selected;
      const included = content.includes(record.text);
      assert.equal(included, expected, `${location.route}: ${record.kind} "${record.text}" has the wrong selection state`);
    }
  }
});

function routeText({ route, selector }) {
  const { $ } = loadRoute(route);
  return selectedText($, selector);
}

function flatRecords(kind, entries, getText) {
  return entries.map((entry) => ({
    kind,
    text: plainText(getText(entry)),
    visible: entry.visible !== false,
    selected: entry.selected === true,
  }));
}

function groupedRecords(kind, groups, getText) {
  return groups.flatMap((group) =>
    group.entries.map((entry) => ({
      kind,
      text: plainText(getText(entry, group)),
      visible: entry.visible !== false,
      selected: entry.selected === true,
    }))
  );
}
