# STATUS — Car Insurance Shopping Calm Guide

Date: 2026-11-07
Owner: Asdale Dynamics, LLC (Dylan Asdale)

## What was built

A complete beginner manual (markdown) plus a dependency-free static site for
shopping car insurance calmly, beginner-friendly, privacy-first:

- **docs/ — full manual (9 files)**
  - `00-start-here.md` — calm path, 20-minute version, low-energy (ADHD-friendly) mode
  - `01-coverage-words-mean.md` — the seven core coverage terms + supporting cast, dec-page walkthrough
  - `02-state-minimums-vs-sensible-limits.md` — the math of low limits, upgrade ladder, state wrinkles
  - `03-discounts-nobody-mentions.md` — 15 quiet discounts, rideshare gap notes, agent questions
  - `04-compare-three-quotes-fairly.md` — 7 comparison rules, apples-to-apples workflow, callback move, 1-week timeline
  - `05-dropping-full-coverage.md` — the 10% rule, comp-only middle option, when NOT to drop
  - `06-ai-as-homework-helper-privacy.md` — safe/unsafe AI-chat uses, placeholder playbook, privacy habits
  - `07-checklists.md` — pre-call checklist, call scripts, validation checklist
  - `glossary.md` — alphabetized terms

- **site/ — static site (no build step, no dependencies, no network calls)**
  - `index.html` — overview and quick loop
  - `worksheet.html` — quote-tracking worksheet: frozen coverage version, quote rows,
    term-to-annual normalization, cheapest-row highlight, JSON export, sample loader;
    all data in browser `localStorage` only
  - `compare.html` — A/B/C side-by-side comparison with deltas, percent, spread, and an "before you trust the winner" audit table; can pull rows from the worksheet
  - `css/site.css`, `js/worksheet.js`, `js/compare.js`, `data/sample-quote.json` (example data shape)

- **Project files**
  - `README.md` — run instructions, privacy stance, credits to Asdale Dynamics, LLC
  - `LICENSE` — MIT, Copyright (c) 2026 Asdale Dynamics, LLC
  - `verify.sh` — one-command verification
  - `tests/test-core.js` (15 logic tests) and `tests/smoke-http.js` (HTTP smoke test) — Node standard library only

## How to run it

```bash
# static site
python3 -m http.server 8000 --directory site
# visit http://localhost:8000

# or simply open site/index.html in a browser

# run verification
bash verify.sh
```

## Verification results (as of this commit)

`bash verify.sh` — **ALL CHECKS PASSED**:

1. JavaScript syntax check (`node --check` on both site scripts and both test files) — ok
2. JSON validity (`sample-quote.json` parses) — ok
3. Core logic tests (`node tests/test-core.js`) — **15/15 pass**
   (annual-cost math for 6/12-month terms, cheapest-quote selection, delta
   ordering, invalid-entry handling, spread math, site file integrity,
   sample-quote consistency, personal-data / network-API audit of JS)
4. HTTP smoke tests (`node tests/smoke-http.js`) — **all 7 assets serve 200**,
   all local HTML references resolve, required DOM ids present

One bug was found and fixed during verification: `compareQuotes` accepted
negative annual costs as valid entries; corrected to require positive values
(`site/js/compare.js`), with test coverage added.

## Known gaps / limitations

- **Browser-budget testing depth:** core logic is tested in Node; interactive
  behavior (clicks, localStorage round-trips in a real browser) was exercised
  only through code review, not a headless browser. A future pass could add
  Playwright/WebDriver for full UI tests.
- **The worksheet "compare" action does not yet auto-launch the comparison
  page** — you copy three annual numbers (or use the Pull from worksheet
  button, which works in same-origin browsers).
- **Docs are US-centric.** State minimum specifics link out to official state
  insurance departments rather than duplicating rapidly-changing state tables.
- **No sitemap/SEO polish, no favicon, no print stylesheet.** Cosmetic.
- **Glossary is alphabetized but entry heights vary** — some entries are
  deliberately short, by design, not an error.

## Privacy stance

- Site makes zero network calls; worksheet data lives in `localStorage` only.
- No personal data is requested anywhere in the project; docs actively teach
  placeholder habits for AI-chat use.
- `tests` include a guard against network APIs (`fetch`, `XMLHttpRequest`,
  `http(s)://`) and hardcoded PII patterns in the shipped JS.

## Legal framing

Educational only — not legal, financial, or insurance advice.
