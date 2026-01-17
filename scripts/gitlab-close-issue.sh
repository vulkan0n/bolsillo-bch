#!/bin/bash
#
# gitlab-close-issue.sh - Close a GitLab issue with commit reference
#
# Usage: ./scripts/gitlab-close-issue.sh <issue_number> [--no-comment]
#
# This script:
# 1. Adds a comment to the issue with the current commit info
# 2. Closes the issue
#

set -e

ISSUE=$1
NO_COMMENT=${2:-""}

if [[ -z "$ISSUE" ]]; then
    echo "Usage: $0 <issue_number> [--no-comment]"
    echo ""
    echo "Examples:"
    echo "  $0 123           # Close issue #123 with commit comment"
    echo "  $0 123 --no-comment  # Close issue #123 without comment"
    exit 1
fi

# Remove # prefix if present
ISSUE=$(echo "$ISSUE" | sed 's/^#//')

# Validate issue number
if ! [[ "$ISSUE" =~ ^[0-9]+$ ]]; then
    echo "Error: Invalid issue number: $ISSUE"
    exit 1
fi

# Get current commit info
COMMIT=$(git rev-parse HEAD 2>/dev/null || echo "")
COMMIT_SHORT=$(git rev-parse --short HEAD 2>/dev/null || echo "")
COMMIT_MSG=$(git log -1 --format=%s 2>/dev/null || echo "")

echo "Closing issue #$ISSUE..."

# Add comment with commit info (unless --no-comment)
if [[ "$NO_COMMENT" != "--no-comment" ]] && [[ -n "$COMMIT" ]]; then
    echo "  Adding commit reference comment..."
    glab issue note "$ISSUE" -m "Resolved in commit $COMMIT_SHORT: $COMMIT_MSG

Commit: $COMMIT" --repo selene.cash/selene-wallet
fi

# Close the issue
echo "  Closing issue..."
glab issue close "$ISSUE" --repo selene.cash/selene-wallet

echo "Done! Issue #$ISSUE has been closed."
echo "View at: https://git.xulu.tech/selene.cash/selene-wallet/-/issues/$ISSUE"
