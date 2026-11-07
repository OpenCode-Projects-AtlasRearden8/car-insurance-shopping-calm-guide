"use strict";

// Quote comparison side of the calm guide. Local-only; pulls worksheet rows
// when asked to. No personal data involved — carrier names and costs only.

function readAnnual(id) {
  var input = document.getElementById(id);
  if (!input) return null;
  var v = parseFloat(input.value);
  return isFinite(v) && v > 0 ? v : null;
}

function readName(id) {
  var input = document.getElementById(id);
  return input && input.value.trim() ? input.value.trim() : null;
}

function sum(list) {
  return list.reduce(function (a, b) { return a + b; }, 0);
}

function compareQuotes(annuals, names) {
  var valid = [];
  for (var i = 0; i < annuals.length; i += 1) {
    if (annuals[i] !== null && isFinite(annuals[i]) && annuals[i] > 0) {
      valid.push({ i: i, name: names[i] || "Quote " + String.fromCharCode(65 + i), annual: annuals[i] });
    }
  }
  if (valid.length < 2) {
    return { error: "Need at least two positive annual costs to compare." };
  }
  valid.sort(function (a, b) { return a.annual - b.annual; });
  var best = valid[0];
  var worst = valid[valid.length - 1];
  var rows = valid.map(function (q) {
    var delta = q.annual - best.annual;
    return {
      name: q.name,
      annual: q.annual,
      perMonth: q.annual / 12,
      delta: delta,
      deltaPct: best.annual > 0 ? (delta / best.annual) * 100 : 0,
      isBest: delta === 0
    };
  });
  return {
    best: best,
    worst: worst,
    spread: worst.annual - best.annual,
    rows: rows
  };
}

function renderResult(out, result) {
  if (result.error) {
    out.innerHTML = "<div class=\"notice\"><strong>Check numbers:</strong> " +
      result.error + "</div>";
    return;
  }

  var html = "";
  html += "<h3 style=\"margin-top:1rem;\">Winner: " + escapeHtml(result.best.name) +
    " at $" + result.best.annual.toFixed(0) + " / year</h3>";
  html += "<div style=\"overflow-x:auto;\"><table>";
  html += "<thead><tr><th>Quote</th><th>Annual $</th><th>Per month $</th>" +
    "<th>Delta vs best $</th><th>Delta %</th></tr></thead><tbody>";

  result.rows.forEach(function (r) {
    html += "<tr" + (r.isBest ? " class=\"best\"" : "") + ">";
    html += "<td>" + escapeHtml(r.name) + (r.isBest ? " (best)" : "") + "</td>";
    html += "<td>" + r.annual.toFixed(0) + "</td>";
    html += "<td>" + r.perMonth.toFixed(0) + "</td>";
    html += "<td>" + (r.delta === 0 ? "—" : "<span class=\"delta-up\">+" + r.delta.toFixed(0) + "</span>") + "</td>";
    html += "<td>" + (r.delta === 0 ? "—" : "+" + r.deltaPct.toFixed(1) + "%") + "</td>";
    html += "</tr>";
  });

  html += "</tbody></table></div>";
  html += "<p class=\"total\">Spread (most expensive − best): $" +
    result.spread.toFixed(0) + " per year (" +
    (result.spread / result.best.annual * 100).toFixed(1) + "%).</p>";
  html += "<div class=\"notice\" style=\"margin-top:.75rem;\">" +
    "<strong>Before you pay the winner:</strong> confirm identical limits and " +
    "deductibles on the written quote, check rental/roadside inclusion, and " +
    "read the audit table below. Never cancel your current policy until the " +
    "new one binds.</div>";

  out.innerHTML = html;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function pullFromWorksheet() {
  try {
    var raw = localStorage.getItem("cis-calm-guide-worksheet-v1");
    if (!raw) {
      window.alert("No worksheet rows found yet. Log quotes there first.");
      return;
    }
    var data = JSON.parse(raw);
    var quotes = data.quotes || [];
    var filled = 0;
    quotes.slice(0, 3).forEach(function (q, i) {
      var ids = ["qa", "qb", "qc"][i];
      if (!q || q.annual === null || q.annual === undefined) return;
      var nameInput = document.getElementById(ids + "-name");
      var annualInput = document.getElementById(ids + "-annual");
      if (nameInput && q.carrier) nameInput.value = q.carrier;
      if (annualInput) annualInput.value = String(Math.round(q.annual));
      filled += 1;
    });
    if (filled < 2) {
      window.alert("Found fewer than two completed worksheet rows with annual costs.");
    }
  } catch (err) {
    window.alert("Could not read worksheet data — is it open in this same browser?");
  }
}

function init() {
  var btn = document.getElementById("compareBtn");
  if (!btn) return;
  var result = document.getElementById("result");

  btn.addEventListener("click", function () {
    var annuals = [readAnnual("qa-annual"), readAnnual("qb-annual"), readAnnual("qc-annual")];
    var names = [readName("qa-name"), readName("qb-name"), readName("qc-name")];
    renderResult(result, compareQuotes(annuals, names));
  });

  var pull = document.getElementById("pullFromWorksheet");
  if (pull) pull.addEventListener("click", pullFromWorksheet);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

window.CISCompare = { compareQuotes: compareQuotes };
