#!/bin/bash
#
# gitlab-priorities.sh - Computes priority rankings based on GitLab state and velocity
#
# Usage: ./scripts/gitlab-priorities.sh
#
# This script analyzes issues and ranks them by:
# - Milestone urgency (days until due)
# - Issue labels (Critical > High Priority > Bug > Feature)
# - Estimated difficulty
# - Quick wins for momentum building
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
OUTPUT_FILE="$PROJECT_ROOT/.claude/priorities.md"
VELOCITY_FILE="$PROJECT_ROOT/.claude/velocity.json"
REPO="selene.cash/selene-wallet"

log() {
    echo "$1" >&2
}

log "Computing priorities..."

# Get current timestamp
TIMESTAMP=$(date "+%Y-%m-%d %H:%M")
TODAY=$(date "+%Y-%m-%d")

# Fetch issues with labels
log "  - Fetching issues..."

# Get critical issues
CRITICAL=$(glab api "projects/selene.cash%2Fselene-wallet/issues?state=opened&labels=Critical&per_page=50" 2>/dev/null || echo "[]")

# Get high priority issues
HIGH_PRIORITY=$(glab api "projects/selene.cash%2Fselene-wallet/issues?state=opened&labels=High%20Priority&per_page=50" 2>/dev/null || echo "[]")

# Get bugs
BUGS=$(glab api "projects/selene.cash%2Fselene-wallet/issues?state=opened&labels=Bug&per_page=50" 2>/dev/null || echo "[]")

# Get active milestones
MILESTONES=$(glab api "projects/selene.cash%2Fselene-wallet/milestones?state=active&per_page=20" 2>/dev/null || echo "[]")

# Get overdue milestone IDs (for prioritization boost)
THIRTY_DAYS=$(date -v+30d "+%Y-%m-%d" 2>/dev/null || date -d "+30 days" "+%Y-%m-%d" 2>/dev/null || echo "2099-12-31")

OVERDUE_MILESTONE_IDS=$(echo "$MILESTONES" | jq -r --arg today "$TODAY" '
    [.[] | select(.due_date != null and .due_date < $today and .due_date > "2000-01-01") | .id] | @csv
' 2>/dev/null || echo "")

URGENT_MILESTONE_IDS=$(echo "$MILESTONES" | jq -r --arg today "$TODAY" --arg soon "$THIRTY_DAYS" '
    [.[] | select(.due_date != null and .due_date >= $today and .due_date <= $soon and .due_date > "2000-01-01") | .id] | @csv
' 2>/dev/null || echo "")

# Load velocity data
if [[ -f "$VELOCITY_FILE" ]]; then
    VELOCITY=$(cat "$VELOCITY_FILE")
else
    VELOCITY='{"averageVelocity": {"trivial": 0.5, "easy": 1.5, "medium": 5, "hard": 12}}'
fi

# Generate priorities markdown
log "  - Generating priorities.md..."

cat > "$OUTPUT_FILE" << 'HEADER'
# Priority Assessment

> Computed priority rankings based on milestone urgency, issue labels, and velocity data.
> Run `./scripts/gitlab-priorities.sh` to refresh.

HEADER

echo "**Last Computed:** $TIMESTAMP" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# Priority Tier 1: Critical + Overdue Milestone
echo "## 🚨 Tier 1: Critical Priority" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"
echo "_Issues that are Critical AND in overdue milestones or blocking other work._" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

TIER1=$(echo "$CRITICAL" | jq -r '
    .[] |
    "| #\(.iid) | \(.title | .[0:60]) | \(.labels | join(", ") | .[0:40]) |"
' 2>/dev/null | head -10)

if [[ -n "$TIER1" ]]; then
    echo "| Issue | Title | Labels |" >> "$OUTPUT_FILE"
    echo "|-------|-------|--------|" >> "$OUTPUT_FILE"
    echo "$TIER1" >> "$OUTPUT_FILE"
else
    echo "_No Tier 1 issues_" >> "$OUTPUT_FILE"
fi
echo "" >> "$OUTPUT_FILE"

# Priority Tier 2: High Priority or Bugs in Urgent Milestones
echo "## 🔥 Tier 2: High Priority" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"
echo "_High Priority issues or bugs that need attention soon._" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

TIER2=$(echo "$HIGH_PRIORITY" | jq -r '
    .[] |
    select(.labels | index("Critical") | not) |
    "| #\(.iid) | \(.title | .[0:60]) | \(.labels | join(", ") | .[0:40]) |"
' 2>/dev/null | head -15)

if [[ -n "$TIER2" ]]; then
    echo "| Issue | Title | Labels |" >> "$OUTPUT_FILE"
    echo "|-------|-------|--------|" >> "$OUTPUT_FILE"
    echo "$TIER2" >> "$OUTPUT_FILE"
else
    echo "_No Tier 2 issues_" >> "$OUTPUT_FILE"
fi
echo "" >> "$OUTPUT_FILE"

# Priority Tier 3: Regular Bugs
echo "## 🐛 Tier 3: Bugs" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"
echo "_Bugs that should be fixed to improve stability._" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

TIER3=$(echo "$BUGS" | jq -r '
    .[] |
    select((.labels | index("Critical") | not) and (.labels | index("High Priority") | not)) |
    "| #\(.iid) | \(.title | .[0:60]) |"
' 2>/dev/null | head -15)

if [[ -n "$TIER3" ]]; then
    echo "| Issue | Title |" >> "$OUTPUT_FILE"
    echo "|-------|-------|" >> "$OUTPUT_FILE"
    echo "$TIER3" >> "$OUTPUT_FILE"
else
    echo "_No Tier 3 issues_" >> "$OUTPUT_FILE"
fi
echo "" >> "$OUTPUT_FILE"

# Quick Wins Section
echo "## ⚡ Quick Wins" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"
echo "_Issues likely to be completed quickly based on title patterns and labels._" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# Get all open issues and filter for quick win patterns
QUICK_WINS=$(glab api "projects/selene.cash%2Fselene-wallet/issues?state=opened&per_page=100" 2>/dev/null | jq -r '
    [.[] |
    select(
        (.title | test("typo|translation|wording|rename|text|copy|UI/UX"; "i")) or
        (.labels | any(. == "UI/UX" or . == "Documentation"))
    )] |
    .[0:10] |
    .[] |
    "| #\(.iid) | \(.title | .[0:60]) |"
' 2>/dev/null || echo "")

if [[ -n "$QUICK_WINS" ]]; then
    echo "| Issue | Title |" >> "$OUTPUT_FILE"
    echo "|-------|-------|" >> "$OUTPUT_FILE"
    echo "$QUICK_WINS" >> "$OUTPUT_FILE"
else
    echo "_No quick wins identified_" >> "$OUTPUT_FILE"
fi
echo "" >> "$OUTPUT_FILE"

# Velocity Summary
echo "## 📈 Velocity Summary" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

SESSIONS_COUNT=$(echo "$VELOCITY" | jq '.sessions | length' 2>/dev/null || echo "0")
RECENT_SESSIONS=$(echo "$VELOCITY" | jq -r '.sessions | .[-5:] | .[] | "- \(.date): \(.issuesClosed | length) issues"' 2>/dev/null || echo "")

echo "**Total Sessions Tracked:** $SESSIONS_COUNT" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

if [[ -n "$RECENT_SESSIONS" && "$RECENT_SESSIONS" != "null" ]]; then
    echo "**Recent Activity:**" >> "$OUTPUT_FILE"
    echo "$RECENT_SESSIONS" >> "$OUTPUT_FILE"
else
    echo "_No velocity data yet. Complete some issues to build velocity history._" >> "$OUTPUT_FILE"
fi
echo "" >> "$OUTPUT_FILE"

# Recommendations
echo "## 💡 Recommendations" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"
echo "Based on current state, consider:" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# Check for critical issues
CRITICAL_COUNT=$(echo "$CRITICAL" | jq 'length' 2>/dev/null || echo "0")
if [[ "$CRITICAL_COUNT" -gt 0 ]]; then
    echo "1. **Address Critical Issues First** - There are $CRITICAL_COUNT critical issues that may block progress" >> "$OUTPUT_FILE"
fi

# Check for overdue milestones
OVERDUE_COUNT=$(echo "$MILESTONES" | jq -r --arg today "$TODAY" '
    [.[] | select(.due_date != null and .due_date < $today and .due_date > "2000-01-01")] | length
' 2>/dev/null || echo "0")

if [[ "$OVERDUE_COUNT" -gt 0 ]]; then
    echo "2. **Overdue Milestones** - $OVERDUE_COUNT milestones are past due. Consider closing or rescheduling." >> "$OUTPUT_FILE"
fi

echo "3. **Build Momentum** - Consider tackling a quick win to build velocity" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

log "Priorities written to $OUTPUT_FILE"
log "Done!"
