#!/usr/bin/env bash
# DB migration pre-deploy guard.
# Fails loudly if any Prisma migration is pending or the schema is invalid.
# Run before every staging or production deploy as documented in:
#   docs/operations/review-rollout-playbook.md (Release prerequisites)
#
# Exits 0 only when schema is valid and all migrations are applied.
# Exits 1 with a clear error message when any check fails.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "=============================="
echo " DB migration pre-deploy check"
echo "=============================="

echo ""
echo "==> 1/2  Prisma schema validation"
(cd "$REPO_ROOT/api" && npx prisma validate) || {
  echo ""
  echo "NO-GO: Prisma schema is invalid."
  echo "Fix schema.prisma errors and re-run: npm run check:db-migration"
  exit 1
}
echo "PASS"

echo ""
echo "==> 2/2  Pending migration check"
# 'prisma migrate status' exits 1 when any migration is unapplied.
(cd "$REPO_ROOT/api" && npx prisma migrate status) || {
  echo ""
  echo "NO-GO: One or more migrations have not been applied."
  echo "Apply migrations first:"
  echo "  Development:  cd api && npx prisma migrate dev"
  echo "  Production:   cd api && npx prisma migrate deploy"
  echo "Then re-run: npm run check:db-migration"
  exit 1
}
echo "PASS"

echo ""
echo "=============================="
echo " GO — schema valid, all migrations applied"
echo "=============================="
