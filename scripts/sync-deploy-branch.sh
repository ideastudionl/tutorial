#!/usr/bin/env bash
# Sync theme/ from the development branch onto the shopify-theme deploy branch.
#
# Shopify's GitHub integration reads theme files from the root of the connected
# branch, so the deploy branch holds the contents of theme/ moved up one level
# and nothing else. Run this after every theme change.
#
# Usage: scripts/sync-deploy-branch.sh [commit message]

set -euo pipefail

DEV_BRANCH="$(git rev-parse --abbrev-ref HEAD)"
DEPLOY_BRANCH="shopify-theme"
MSG="${1:-Sync theme from ${DEV_BRANCH}}"

if [ ! -d theme ]; then
  echo "error: run this from the repository root (no theme/ directory here)" >&2
  exit 1
fi

if [ -n "$(git status --porcelain)" ]; then
  echo "error: working tree is dirty — commit or stash first" >&2
  exit 1
fi

STAGE="$(mktemp -d)"
trap 'rm -rf "$STAGE"' EXIT
cp -r theme/. "$STAGE"/
# The deploy branch keeps its own README explaining what it is.
git show "${DEPLOY_BRANCH}:README.md" > "$STAGE/README.md" 2>/dev/null || true

git checkout -q "$DEPLOY_BRANCH"
git rm -rqf .
cp -r "$STAGE"/. .
git add -A

if git diff --cached --quiet; then
  echo "deploy branch already up to date"
else
  git commit -q -m "$MSG"
  echo "committed to $DEPLOY_BRANCH"
fi

git checkout -q "$DEV_BRANCH"
echo "back on $DEV_BRANCH — push with: git push origin $DEPLOY_BRANCH"
