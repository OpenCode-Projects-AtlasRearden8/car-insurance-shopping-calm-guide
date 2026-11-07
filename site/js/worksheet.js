"use strict";

// Quote-tracking worksheet. All data stays in localStorage on this device.
// No fetching, no posting, no personal data asked for anywhere.

var STORAGE_KEY = "cis-calm-guide-worksheet-v1";
var FIXED_KEY = "cis-calm-guide-fixed-version-v1";

function loadStore() {
  try {
    var raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { quotes: [] };
    var data = JSON.parse(raw);
    if (!data || !Array.isArray(data.quotes)) return { quotes: [] };
    return data;
  } catch (err) {
    return { quotes: [] };
  }
}

function saveStore(store) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

function annualCost(premium, termMonths) {
  var p = parseFloat(premium);
  var t = parseFloat(termMonths);
  if (!isFinite(p) || p <= 0 || !isFinite(t) || t <= 0) return null;
  return p * (12 / t);
}

function money(n) {
  if (n === null || !isFinite(n)) return "";
  return n.toFixed(0);
}

function el(tag, cls, text) {
  var node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text !== undefined) node.textContent = text;
  return node;
}

// ---- Fixed version (coverage version you freeze) ----

function saveFixed() {
  var ids = ["fv-liab", "fv-um", "fv-colded", "fv-compded", "fv-add", "fv-car"];
  var obj = {};
  ids.forEach(function (id) {
    var input = document.getElementById(id);
    if (input) obj[id] = input.value;
  });
  localStorage.setItem(FIXED_KEY, JSON.stringify(obj));
}

function loadFixed() {
  try {
    var raw = localStorage.getItem(FIXED_KEY);
    if (!raw) return;
    var obj = JSON.parse(raw);
    Object.keys(obj).forEach(function (id) {
      var input = document.getElementById(id);
      if (input) input.value = obj[id];
    });
  } catch (err) { /* ignore */ }
}

// ---- Quote rows ----

var quoteRowFields = [
  { key: "carrier", label: "Carrier", type: "text", placeholder: "Carrier A" },
  {
    key: "channel", label: "Channel", type: "select",
    options: ["Direct site", "Captive agent", "Independent agent", "Phone", "Comparison site"]
  },
  { key: "limits", label: "Limits", type: "text", placeholder: "100/300/100" },
  { key: "deductibles", label: "Deductibles", type: "text", placeholder: "$500 / $500" },
  { key: "termMonths", label: "Term (mo)", type: "number", placeholder: "6" },
  { key: "premium", label: "Premium $", type: "number", placeholder: "480" },
  { key: "riders", label: "Notes / riders", type: "text", placeholder: "rental+roadside incl." }
];

var quoteIndex = 0;

function addQuoteRow(data) {
  data = data || {};
  var tbody = document.getElementById("quoteRows");
  if (!tbody) return;
  var tr = document.createElement("tr");
  tr.dataset.index = String(quoteIndex);
  quoteIndex += 1;

  quoteRowFields.forEach(function (f) {
    var td = el("td");
    if (f.type === "select") {
      var sel = document.createElement("select");
      sel.dataset.key = f.key;
      var empty = document.createElement("option");
      empty.value = "";
      empty.textContent = "";
      sel.appendChild(empty);
      (f.options || []).forEach(function (opt) {
        var o = document.createElement("option");
        o.value = opt;
        o.textContent = opt;
        sel.appendChild(o);
      });
      sel.value = data[f.key] || "";
      td.appendChild(sel);
    } else {
      var inp = document.createElement("input");
      inp.type = f.type;
      inp.dataset.key = f.key;
      if (f.placeholder) inp.placeholder = f.placeholder;
      inp.value = data[f.key] !== undefined && data[f.key] !== null ? data[f.key] : "";
      td.appendChild(inp);
    }
    tr.appendChild(td);
  });

  var annualTd = el("td", "annual");
  annualTd.dataset.annual = "1";
  tr.appendChild(annualTd);

  var removeTd = el("td");
  var rm = document.createElement("button");
  rm.type = "button";
  rm.className = "secondary";
  rm.textContent = "Remove";
  rm.addEventListener("click", function () {
    tr.parentNode.removeChild(tr);
    persistRows();
    render();
  });
  removeTd.appendChild(rm);
  tr.appendChild(removeTd);

  tbody.appendChild(tr);
}

function collectRows() {
  var store = loadStore();
  var rows = [];
  Array.prototype.forEach.call(document.querySelectorAll("#quoteRows tr"), function (tr) {
    var row = {};
    tr.querySelectorAll("[data-key]").forEach(function (input) {
      row[input.dataset.key] = input.value;
    });
    row.annual = annualCost(row.premium, row.termMonths);
    rows.push(row);
  });
  store.quotes = rows;
  return store;
}

function persistRows() {
  saveStore(collectRows());
}

function render() {
  var tbody = document.getElementById("quoteRows");
  if (!tbody) return;
  var cheapest = null;
  Array.prototype.forEach.call(tbody.querySelectorAll("tr"), function (tr) {
    var premium = null, term = null;
    tr.querySelectorAll("[data-key]").forEach(function (input) {
      if (input.dataset.key === "premium") premium = input.value;
      if (input.dataset.key === "termMonths") term = input.value;
    });
    var annual = annualCost(premium, term);
    var cell = tr.querySelector("td[data-annual]");
    cell.textContent = annual !== null ? "$" + money(annual) : "";
    tr.classList.remove("best");
    tr.dataset.annual = annual !== null ? String(annual) : "";
  });

  var candidates = [];
  Array.prototype.forEach.call(tbody.querySelectorAll("tr"), function (tr) {
    if (tr.dataset.annual !== "") candidates.push({ tr: tr, v: parseFloat(tr.dataset.annual) });
  });
  if (candidates.length) {
    candidates.sort(function (a, b) { return a.v - b.v; });
    cheapest = candidates[0].tr;
    if (cheapest) cheapest.classList.add("best");
  }
}

function clearAll() {
  if (!window.confirm("Clear all quote rows? This can't be undone.")) return;
  var tbody = document.getElementById("quoteRows");
  tbody.innerHTML = "";
  saveStore({ quotes: [] });
  addQuoteRow();
  render();
}

function exportJson() {
  var store = collectRows();
  var out = {
    project: "car-insurance-shopping-calm-guide",
    exportedAt: new Date().toISOString(),
    fixedVersion: JSON.parse(localStorage.getItem(FIXED_KEY) || "{}"),
    quotes: store.quotes.map(function (r) {
      return {
        carrier: r.carrier || "",
        channel: r.channel || "",
        limits: r.limits || "",
        deductibles: r.deductibles || "",
        termMonths: r.termMonths || "",
        premium: r.premium || "",
        annual: r.annual,
        notes: r.riders || ""
      };
    })
  };
  var blob = new Blob([JSON.stringify(out, null, 2)], { type: "application/json" });
  var url = URL.createObjectURL(blob);
  var a = document.createElement("a");
  a.href = url;
  a.download = "insurance-quotes.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

var SAMPLE_QUOTES = [
  { carrier: "Carrier A", channel: "Direct site", limits: "100/300/100", deductibles: "$500 / $500", termMonths: "6", premium: "480", riders: "rental+roadside incl." },
  { carrier: "Carrier B", channel: "Independent agent", limits: "100/300/100", deductibles: "$500 / $500", termMonths: "12", premium: "895", riders: "rental incl." },
  { carrier: "Carrier C", channel: "Captive agent", limits: "100/300/100", deductibles: "$500 / $500", termMonths: "6", premium: "515", riders: "no rental" }
];

function loadSample() {
  if (!window.confirm("Replace current rows with the three example rows?")) return;
  document.getElementById("quoteRows").innerHTML = "";
  SAMPLE_QUOTES.forEach(addQuoteRow);
  persistRows();
  render();
}

function init() {
  if (!document.getElementById("quoteRows")) return;

  loadFixed();
  ["fv-liab", "fv-um", "fv-colded", "fv-compded", "fv-add", "fv-car"].forEach(function (id) {
    var input = document.getElementById(id);
    if (input) input.addEventListener("change", saveFixed);
  });

  var store = loadStore();
  if (store.quotes.length === 0) {
    addQuoteRow();
  } else {
    store.quotes.forEach(addQuoteRow);
  }
  render();

  document.getElementById("addQuote").addEventListener("click", function () {
    addQuoteRow();
    persistRows();
  });
  document.getElementById("loadSample").addEventListener("click", loadSample);
  document.getElementById("exportJson").addEventListener("click", exportJson);
  document.getElementById("clearAll").addEventListener("click", clearAll);

  document.getElementById("quoteRows").addEventListener("input", function () {
    persistRows();
    render();
  });
  document.getElementById("quoteRows").addEventListener("change", function () {
    persistRows();
    render();
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

// Exposed for tests and the compare page.
window.CISWorksheet = {
  annualCost: annualCost,
  loadSampleQuotes: SAMPLE_QUOTES,
  _internal: { addQuoteRow: addQuoteRow, render: render }
};
