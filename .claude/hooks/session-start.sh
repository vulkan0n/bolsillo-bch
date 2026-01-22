#!/bin/bash
#
# session-start.sh - Claude Code session start hook
#
# This hook runs when a Claude Code session begins.
# It refreshes the GitLab state to provide current context.
#

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Run the GitLab sync script quietly
if [[ -f "$PROJECT_ROOT/scripts/gitlab-sync.sh" ]]; then
    bash "$PROJECT_ROOT/scripts/gitlab-sync.sh" --quiet 2>/dev/null
fi

# Output a brief summary for Claude's context
STATE_FILE="$PROJECT_ROOT/.claude/gitlab-state.md"
if [[ -f "$STATE_FILE" ]]; then
    echo "GitLab state refreshed. See .claude/gitlab-state.md for current issue status."
fi
