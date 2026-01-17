#!/bin/bash
#
# post-commit.sh - Claude Code post-commit hook
#
# This hook runs after a git commit is created.
# It checks the commit message for issue references (e.g., #123, fixes #456)
# and offers to update those issues.
#

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Get the last commit info
COMMIT_HASH=$(git rev-parse HEAD 2>/dev/null)
COMMIT_MSG=$(git log -1 --format=%s 2>/dev/null)
COMMIT_SHORT=$(git rev-parse --short HEAD 2>/dev/null)

if [[ -z "$COMMIT_HASH" ]]; then
    exit 0
fi

# Extract issue numbers from commit message
# Matches: #123, fixes #123, closes #123, resolves #123
ISSUES=$(echo "$COMMIT_MSG" | grep -oE '(#[0-9]+|fixes #[0-9]+|closes #[0-9]+|resolves #[0-9]+)' | grep -oE '[0-9]+' | sort -u)

if [[ -n "$ISSUES" ]]; then
    echo "Commit $COMMIT_SHORT references issues: $(echo $ISSUES | tr '\n' ' ')"
    echo "Consider linking this commit to the issues with:"
    for ISSUE in $ISSUES; do
        echo "  glab issue note $ISSUE -m \"Referenced in commit $COMMIT_SHORT: $COMMIT_MSG\""
    done
fi
