# Car Insurance Shopping Calm Guide

A beginner-friendly manual (and a small static site) for shopping car insurance without dread.
Written the way Dylan Asdale explains AI — like a friend would: plain English, step by step,
never condescending.

Part of the Asdale Dynamics calm-guide series:

- **car-insurance-shopping-calm-guide** (this project) — shopping *insurance* for a car you
  already own or are buying.
- **insurance-appeals-calm-guide** — appealing denials and disputed claims.
- **car-buying-calm-guide** — buying the *vehicle* itself.

## What's inside

```
docs/               The full markdown manual
  00-start-here.md
  01-coverage-words-mean.md
  02-state-minimums-vs-sensible-limits.md
  03-discounts-nobody-mentions.md
  04-compare-three-quotes-fairly.md
  05-dropping-full-coverage.md
  06-ai-as-homework-helper-privacy.md
  07-checklists.md
  glossary.md

site/               Static site (no build step, no dependencies)
  index.html        Overview + links
  compare.html      Side-by-side three-quote comparison
  worksheet.html    Quote-tracking worksheet (saves in your browser only)
  css/site.css
  js/worksheet.js   localStorage-based worksheet logic
  js/compare.js     Comparison helpers
  data/sample-quote.json   Example data shape only
```

## How to run it

The site is static — no install, no build, no network calls.

```bash
# Option 1: just open it
open site/index.html          # macOS
xdg-open site/index.html      # Linux

# Option 2: serve it (recommended so localStorage works cleanly everywhere)
python3 -m http.server 8000 --directory site
# then visit http://localhost:8000
```

## Privacy stance

The worksheet and comparison pages use **localStorage in your own browser** only.
Nothing is transmitted anywhere. Never type your real personal data (full name, home
address, SSN, or real policy numbers) into AI chatbots or into these pages — the docs
show how to use placeholders instead. See `docs/06-ai-as-homework-helper-privacy.md`.

## Verification

Run `bash verify.sh` — it checks the docs, validates the JavaScript syntax, and runs
a headless smoke test of the site if a runner is available. See `STATUS.md` for the
latest results.

## Disclaimer

This project is educational only. It is not legal, financial, or insurance advice.
Coverage terms and minimums vary by state and by policy; always confirm with your
state insurance department and your licensed agent or carrier.

## Credits

Car Insurance Shopping Calm Guide is published by **Asdale Dynamics, LLC** —
beginner-friendly AI education, books, guides, and practical tools from Dylan Asdale,
author of *The Massive AI Manual*. Hub: https://dylanasdale.github.io

## License

MIT — see [LICENSE](LICENSE). Copyright (c) 2026 Asdale Dynamics, LLC.
