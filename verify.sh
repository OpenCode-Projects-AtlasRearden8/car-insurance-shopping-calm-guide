#!/usr/bin/env bash
# Verify the Car Insurance Shopping Calm Guide.
# No dependencies beyond node (standard library only).
set -euo pipefail

echo "== 1/4 JavaScript syntax check =="
node --check site/js/worksheet.js
node --check site/js/compare.js
node --check tests/test-core.js
node --check tests/smoke-http.js
echo "syntax ok"

echo "== 2/4 JSON validity check =="
python3 - <<'EOF'
import json, sys
for f in ["site/data/sample-quote.json"]:
    json.load(open(f))
print("json ok")
EOF

echo "== 3/4 Core logic tests =="
node tests/test-core.js

echo "== 4/4 HTTP smoke tests =="
node tests/smoke-http.js

echo "ALL CHECKS PASSED"
