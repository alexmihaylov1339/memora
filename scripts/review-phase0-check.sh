#!/usr/bin/env bash
# Phase 0 pre-rollout local gate for the review system.
# Run this before every staging deploy attempt as documented in:
#   docs/operations/review-rollout-playbook.md (Phase 0)
#
# Exits 0 (GO) only when every step passes.
# Exits 1 (NO-GO) on first failure; prints which step failed.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PASS="PASS"
FAIL="FAIL"

step() {
  echo ""
  echo "==> $1"
}

fail() {
  echo ""
  echo "NO-GO: $1 failed."
  echo "Fix the failure above and re-run: npm run check:review-phase0"
  exit 1
}

echo "=============================="
echo " Review Phase 0 pre-rollout gate"
echo "=============================="

step "1/5  API — TypeScript"
(cd "$REPO_ROOT/api" && npx tsc --noEmit --pretty false) || fail "API TypeScript"
echo "$PASS"

step "2/5  API — Review contract tests"
(cd "$REPO_ROOT/api" && npm run test:review-contract -- --passWithNoTests) || fail "API review contract tests"
echo "$PASS"

step "3/5  API — Build"
(cd "$REPO_ROOT/api" && npm run build) || fail "API build"
echo "$PASS"

step "4/5  Web — TypeScript"
(cd "$REPO_ROOT/web" && npx tsc --noEmit --pretty false) || fail "Web TypeScript"
echo "$PASS"

step "5/5  Web — Review contract tests"
(cd "$REPO_ROOT/web" && npm run test:review-contract -- --passWithNoTests) || fail "Web review contract tests"
echo "$PASS"

echo ""
echo "=============================="
echo " GO — all Phase 0 checks passed"
echo "=============================="
