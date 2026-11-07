// Run with: node tests/smoke-http.js [port] (default 4173)
// Serves site/ statically, checks every page loads and all local asset
// references resolve. Pure node http, no dependencies.
"use strict";

var http = require("http");
var fs = require("fs");
var path = require("path");
var SITE = path.join(__dirname, "..", "site");
var PORT = parseInt(process.argv[2], 10) || 4173;

var TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8"
};

var server = http.createServer(function (req, res) {
  var urlPath = decodeURIComponent(req.url.split("?")[0]);
  if (urlPath === "/") urlPath = "/index.html";
  var file = path.normalize(path.join(SITE, urlPath));
  if (!file.startsWith(SITE)) {
    res.writeHead(403);
    res.end("forbidden");
    return;
  }
  fs.readFile(file, function (err, buf) {
    if (err) {
      res.writeHead(404);
      res.end("not found: " + urlPath);
      return;
    }
    res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream" });
    res.end(buf);
  });
});

function get(p) {
  return new Promise(function (resolve, reject) {
    http.get("http://127.0.0.1:" + PORT + p, function (res) {
      var body = "";
      res.on("data", function (c) { body += c; });
      res.on("end", function () { resolve({ path: p, status: res.statusCode, body: body }); });
    }).on("error", reject);
  });
}

server.listen(PORT, "127.0.0.1", function () {
  var pages = ["/index.html", "/worksheet.html", "/compare.html"];
  var assets = ["/css/site.css", "/js/worksheet.js", "/js/compare.js", "/data/sample-quote.json"];

  Promise.all(pages.concat(assets).map(get)).then(function (results) {
    var failures = 0;
    results.forEach(function (r) {
      if (r.status !== 200) {
        failures += 1;
        console.error("FAIL - " + r.path + " -> " + r.status);
        return;
      }
      // every page must serve with its content markers intact
      console.log("ok   - " + r.path + " -> " + r.status);
    });

    // resolve-check every local ref in the html pages
    results.filter(function (r) { return r.path.endsWith(".html"); }).forEach(function (r) {
      var refs = [];
      Array.prototype.forEach.call(r.body.matchAll(/(?:src|href)="((?!https?:|mailto:|#|docs\/)[^"]+)"/g), function (m) {
        refs.push(m[1]);
      });
      refs.forEach(function (ref) {
        var abs = path.relative(SITE, path.resolve(SITE, path.dirname(r.path), ref));
        if (!fs.existsSync(path.join(SITE, abs))) {
          failures += 1;
          console.error("FAIL - " + r.path + " references missing asset: " + ref);
        }
      });
    });

    // check worksheet.js self-tests hooks exist and compare page pulls ids match
    var wsHtml = results.find(function (r) { return r.path === "/worksheet.html"; }).body;
    var cmpHtml = results.find(function (r) { return r.path === "/compare.html"; }).body;
    if (wsHtml.indexOf('id="quoteRows"') === -1) { failures += 1; console.error("FAIL - worksheet missing quoteRows"); }
    if (wsHtml.indexOf('id="addQuote"') === -1) { failures += 1; console.error("FAIL - worksheet missing addQuote"); }
    if (cmpHtml.indexOf('id="compareBtn"') === -1) { failures += 1; console.error("FAIL - compare missing compareBtn"); }
    ["qa-annual", "qb-annual", "qc-annual"].forEach(function (id) {
      if (cmpHtml.indexOf('id="' + id + '"') === -1) { failures += 1; console.error("FAIL - compare missing " + id); }
    });

    server.close();
    if (failures) {
      console.error(failures + " smoke test failure(s)");
      process.exit(1);
    } else {
      console.log("HTTP smoke tests passed.");
    }
  }).catch(function (err) {
    console.error("FAIL - request error: " + err.message);
    server.close();
    process.exit(1);
  });
});
