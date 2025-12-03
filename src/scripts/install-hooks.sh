#!/bin/bash
#
# Install git hooks for Dataset Viewer.
#
# Copyright (c) 2025 Tylt LLC. All Rights Reserved.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
HOOKS_DIR="$PROJECT_DIR/.git-hooks"
GIT_HOOKS_DIR="$PROJECT_DIR/.git/hooks"

echo "Installing git hooks..."

# Create git hooks directory if it doesn't exist
mkdir -p "$GIT_HOOKS_DIR"

# Install hooks
for hook in "$HOOKS_DIR"/*; do
    if [ -f "$hook" ]; then
        hook_name=$(basename "$hook")
        cp "$hook" "$GIT_HOOKS_DIR/$hook_name"
        chmod +x "$GIT_HOOKS_DIR/$hook_name"
        echo "  Installed: $hook_name"
    fi
done

echo ""
echo "Git hooks installed successfully!"
