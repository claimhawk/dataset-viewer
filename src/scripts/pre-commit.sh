#!/bin/bash
#
# Pre-commit quality checks for Dataset Viewer.
#
# Runs: ESLint, TypeScript check, copyright header check, complexity check
#
# Copyright (c) 2025 Tylt LLC. All Rights Reserved.

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "========================================"
echo "  Dataset Viewer Pre-commit Checks"
echo "========================================"
echo ""

# Get files to check
if [ "$1" = "--all" ]; then
    FILES=$(find src -type f \( -name "*.ts" -o -name "*.tsx" \) | grep -v node_modules)
else
    FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(ts|tsx)$' || true)
fi

if [ -z "$FILES" ]; then
    echo -e "${GREEN}✓ No TypeScript files to check${NC}"
    exit 0
fi

ERRORS=0

# 1. Copyright Header Check
echo "→ Checking copyright headers..."
MISSING_COPYRIGHT=""
for file in $FILES; do
    if [ -f "$file" ]; then
        if ! head -20 "$file" | grep -q "Copyright (c) 2025 Tylt LLC"; then
            MISSING_COPYRIGHT="$MISSING_COPYRIGHT\n  $file"
        fi
    fi
done

if [ -n "$MISSING_COPYRIGHT" ]; then
    echo -e "${RED}✗ Missing copyright header:${NC}$MISSING_COPYRIGHT"
    ERRORS=1
else
    echo -e "${GREEN}✓ Copyright headers OK${NC}"
fi

# 2. TypeScript Check
echo ""
echo "→ Running TypeScript check..."
if npm run typecheck 2>&1; then
    echo -e "${GREEN}✓ TypeScript OK${NC}"
else
    echo -e "${RED}✗ TypeScript errors found${NC}"
    ERRORS=1
fi

# 3. ESLint Check
echo ""
echo "→ Running ESLint..."
if npm run lint 2>&1; then
    echo -e "${GREEN}✓ ESLint OK${NC}"
else
    echo -e "${RED}✗ ESLint errors found${NC}"
    ERRORS=1
fi

# 4. Complexity Check (via ESLint rules)
echo ""
echo "→ Complexity check included in ESLint"
echo -e "${GREEN}✓ Complexity limits: max 10 cyclomatic, max 3 depth, max 50 lines${NC}"

echo ""
echo "========================================"
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}All checks passed!${NC}"
    exit 0
else
    echo -e "${RED}Some checks failed. Please fix before committing.${NC}"
    exit 1
fi
