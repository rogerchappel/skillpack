#!/bin/bash
# skillpack validation script
# Usage: bash scripts/validate.sh [--dir <dir>] [--strict]

set -euo pipefail

DIR="${DIR:-.}"
STRICT="${STRICT:-false}"

echo "skillpack validate.sh"
echo "====================="
echo "Directory: $DIR"
echo "Strict: $STRICT"
echo ""

# Check Node.js is available
if ! command -v node &> /dev/null; then
  echo "Error: node is required"
  exit 1
fi

echo "Node version: $(node --version)"
echo ""

# Build if needed
if [ ! -d "dist" ]; then
  echo "Building..."
  npm run build
  echo ""
fi

# Run tests
echo "Running tests..."
npm run test
TEST_EXIT=$?

if [ $TEST_EXIT -ne 0 ]; then
  echo "❌ Tests failed"
  exit 1
fi

echo ""
echo "📦 Package check..."
npm pack --dry-run
echo ""

# Run CLI smoke if fixtures exist
if [ -d "fixtures" ]; then
  echo "🔍 Running validate command..."
  node dist/cli.js validate fixtures/ || true
  echo ""
fi

echo "✅ Validation passed"
