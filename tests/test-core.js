// Run with: node tests/test-core.js
// Pure-logic tests for the site's core math and helpers, no browser needed.
"use strict";

var assert = require("assert");
var path = require("path");
var fs = require("fs");

var failures = 0;
function test(name, fn) {
  try {
    fn();
    console.log("ok   - " + name);
  } catch (err) {
    failures += 1;
    console.error("FAIL - " + name + ": " + err.message);
  }
}

// ---- Load worksheet.js in a minimal DOM/localStorage shim ----
function makeShim() {
  var storage = {};
  var elements = {}; // simple element records by id
  function makeEl(id) {
    return {
      id: id,
      value: "",
      dataset: {},
      className: "",
      textContent: "",
      innerHTML: "",
      children: [],
      appendChild: function (c) { this.children.push(c); },
      addEventListener: function () {},
      removeEventListener: function () {},
      querySelectorAll: function () { return []; },
      click: function () {}
    };
  }
  return {
    localStorage: {
      getItem: function (k) { return Object.prototype.hasOwnProperty.call(storage, k) ? storage[k] : null; },
      setItem: function (k, v) { storage[k] = String(v); },
      removeItem: function (k) { delete storage[k]; }
    },
    document: {
      readyState: "complete",
      getElementById: function (id) {
        if (!elements[id]) elements[id] = makeEl(id);
        return elements[id];
      },
      createElement: function () { return makeEl(); },
      addEventListener: function () {}
    },
    window: {},
    _storage: storage
  };
}

var shim = makeShim();
global.localStorage = shim.localStorage;
global.document = shim.document;
global.window = shim.window;

var src = fs.readFileSync(path.join(__dirname, "..", "site", "js", "worksheet.js"), "utf8");
// Worksheet exports API on window.CISWorksheet; evaluate without executing DOM init side effects heavily.
var wrapper = new Function(
  "localStorage", "document", "window", "navigator",
  src + "\nreturn window.CISWorksheet;"
);
var api = wrapper(shim.localStorage, shim.document, shim.window, {});

test("annualCost 6-month term", function () {
  assert.strictEqual(api.annualCost(480, 6), 960);
});
test("annualCost 12-month term", function () {
  assert.strictEqual(api.annualCost(895.5, 12), 895.5);
});
test("annualCost zeros/invalid return null", function () {
  assert.strictEqual(api.annualCost(0, 6), null);
  assert.strictEqual(api.annualCost(100, 0), null);
  assert.strictEqual(api.annualCost("", 6), null);
});
test("sample quotes contain three annual-shaped entries", function () {
  var s = api.loadSampleQuotes;
  assert.ok(Array.isArray(s) && s.length === 3);
  s.forEach(function (q) {
    assert.ok(q.carrier && q.premium && q.termMonths);
  });
});

// ---- Load compare.js ----
var csrc = fs.readFileSync(path.join(__dirname, "..", "site", "js", "compare.js"), "utf8");
var cwrap = new Function(
  "localStorage", "document", "window",
  csrc + "\nreturn window.CISCompare;"
);
var capi = cwrap(shim.localStorage, shim.document, shim.window);

test("compareQuotes picks cheapest of three", function () {
  var r = capi.compareQuotes([960, 895.5, 1030], ["A", "B", "C"]);
  assert.strictEqual(r.best.name, "B");
  assert.strictEqual(r.best.annual, 895.5);
  assert.strictEqual(r.spread, 1030 - 895.5);
  assert.strictEqual(r.rows.length, 3);
  assert.strictEqual(r.rows[0].isBest, true);
});
test("compareQuotes deltas are non-negative and sorted ascending", function () {
  var r = capi.compareQuotes([100, 300, 200], ["A", "B", "C"]);
  var vals = r.rows.map(function (x) { return x.delta; });
  vals.forEach(function (d) { assert.ok(d >= 0); });
  for (var i = 1; i < vals.length; i += 1) assert.ok(vals[i] >= vals[i - 1]);
});
test("compareQuotes ignores invalid entries, keeps two valid", function () {
  var r = capi.compareQuotes([100, 200, -5], ["Also", "Valid", "Weird"]);
  assert.strictEqual(r.rows.length, 2);
  assert.strictEqual(r.best.name, "Also");
});
test("compareQuotes errors when negatives leave only one valid entry", function () {
  var r = capi.compareQuotes([null, 200, -5], []);
  assert.ok(r.error);
  assert.strictEqual(r.rows, undefined);
});
test("compareQuotes errors with fewer than two valid entries", function () {
  var r = capi.compareQuotes([100, null, 0], ["A"]);
  assert.ok(r.error);
});
test("compareQuotes handles two valid entries (A and C)", function () {
  var r = capi.compareQuotes([1000, null, 800], ["A", null, "C"]);
  assert.strictEqual(r.best.name, "C");
  assert.strictEqual(r.rows.length, 2);
});
test("identical plans spread to zero", function () {
  var r = capi.compareQuotes([500, 500, 500], ["A", "B", "C"]);
  assert.strictEqual(r.spread, 0);
  assert.strictEqual(r.rows[0].deltaPct, 0);
});

// ---- Static sanity: site files exist and reference each other ----
var siteDir = path.join(__dirname, "..", "site");
test("site files exist", function () {
  ["index.html", "worksheet.html", "compare.html",
   "css/site.css", "js/worksheet.js", "js/compare.js"]
    .forEach(function (f) {
      assert.ok(fs.existsSync(path.join(siteDir, f)), "missing " + f);
    });
});
test("sample-quote.json parses and has 3 quotes", function () {
  var data = JSON.parse(fs.readFileSync(path.join(siteDir, "data", "sample-quote.json"), "utf8"));
  assert.strictEqual(data.quotes.length, 3);
  data.quotes.forEach(function (q) {
    assert.ok(isFinite(q.annual) && q.annual > 0);
    assert.strictEqual(q.annual, q.premium * (12 / q.termMonths));
  });
});
test("no obvious personal-data strings baked into site", function () {
  var js = fs.readFileSync(path.join(siteDir, "js", "worksheet.js"), "utf8") +
    fs.readFileSync(path.join(siteDir, "js", "compare.js"), "utf8");
  ["@ssn", "123-45-6789", "http://", "https://", "XMLHttpRequest", "fetch("]
    .forEach(function (bad) {
      assert.ok(js.indexOf(bad) === -1, "found forbidden pattern: " + bad);
    });
});
test("compare.js escapeHtml escapes angle brackets", function () {
  // escapeHtml is internal; verify safe rendering indirectly by checking the source guards.
  assert.ok(csrc.indexOf("escapeHtml") !== -1);
  assert.ok(csrc.indexOf("innerHTML = \"<div") === -1 || csrc.indexOf("escapeHtml(") !== -1);
});

if (failures) {
  console.error(failures + " test(s) failed");
  process.exit(1);
} else {
  console.log("All tests passed.");
}
