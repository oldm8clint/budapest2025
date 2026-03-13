#!/bin/bash
# Run all CS:GO investment trackers

echo "=========================================="
echo "CS:GO Investment Tracker Suite"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Run trackers
echo -e "${BLUE}[1/4]${NC} Running Budapest 2025 Stickers Tracker..."
bun tracker.ts
echo ""

echo -e "${BLUE}[2/4]${NC} Running Operation Breakout Cases Tracker..."
bun breakout_tracker.ts
echo ""

echo -e "${BLUE}[3/4]${NC} Running CS2 Cases Portfolio Tracker..."
bun cs_cases_tracker.ts
echo ""

echo -e "${BLUE}[4/4]${NC} Running Personal Inventory Tracker..."
bun my_inventory_tracker.ts
echo ""

echo "=========================================="
echo -e "${GREEN}✓ All trackers completed!${NC}"
echo "=========================================="
echo ""
echo "Generated dashboards:"
echo "  • index.html (Budapest 2025)"
echo "  • breakout.html (Breakout Cases)"
echo "  • cs_cases_dashboard.html (All Cases)"
echo "  • my_inventory_dashboard.html (Your Items)"
echo ""
echo "Open any HTML file in your browser to view results."
