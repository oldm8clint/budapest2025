# CS:GO Investment Tracking Suite

Complete investment tracking system for Counter-Strike 2 items with price predictions and ROI analysis.

## 🚀 Quick Start

### Prerequisites
- [Bun Runtime](https://bun.sh) (required to run trackers)
- Claude Code (for editing and running)

### Installation
```bash
# Clone/open repository
cd budapest2025

# All tracker files are ready to use
# No npm dependencies needed!
```

## 📊 Available Trackers

### 1. Budapest 2025 Stickers (Main Dashboard)
**Status:** ✅ Auto-updating daily on GitHub Pages
**URL:** https://oldm8clint.github.io/budapest2025/

**Files:**
- `tracker.ts` - Main tracking script
- `index.html` - Live dashboard (auto-generated)
- `sticker_price_history.json` - Price history data

**Run locally:**
```bash
bun tracker.ts
```

**What it tracks:**
- 1000+ Budapest 2025 stickers
- Real-time Steam Market prices
- Price predictions (2-week to 12-year forecasts)
- Investment signal (BUY/HOLD/WAIT)
- Discord notifications for price spikes
- All-time high/low tracking

---

### 2. Operation Breakout Cases
**Status:** ✅ Tested and working
**Your inventory:** 19 cases @ A$13.35 each = A$253.65

**Files:**
- `breakout_tracker.ts` - Price tracker
- `breakout.html` - Dashboard (auto-generated)
- `breakout_cases_inventory.csv` - Portfolio spreadsheet
- `breakout_price_history.json` - Price history
- `breakout_research.md` - Investment analysis

**Run tracker:**
```bash
bun breakout_tracker.ts
```

**Current Portfolio:**
- Invested: A$253.65
- Current Value: A$330.60
- ROI: +30.3%

---

### 3. CS2 Cases Multi-Portfolio (All Cases)
**Status:** ✅ Theoretical portfolio (95 cases across 5 tiers)
**Portfolio value:** A$10,021.74 (2589.8% ROI)

**Files:**
- `cs_cases_tracker.ts` - Multi-case tracker
- `cs_cases_dashboard.html` - Portfolio dashboard
- `cs_cases_portfolio.csv` - Full inventory spreadsheet
- `cs_cases_price_history.json` - Price data
- `cs_cases_research.md` - Research and analysis

**Run tracker:**
```bash
bun cs_cases_tracker.ts
```

**What it analyzes:**
- Tier 1 (2013-2014): Vintage cases
- Tier 2 (2015-2016): Old cases
- Tier 3 (2016-2018): Mid-era cases
- Tier 4 (2019-2021): Major cases
- Tier 5 (2023+): Current CS2 cases

---

### 4. Personal Inventory Tracker ⭐ START HERE
**Status:** ✅ Ready for your items
**Features:** Real-time prices, trend analysis, predictions

**Files:**
- `my_inventory_tracker.ts` - Main tracker
- `my_inventory.csv` - **EDIT THIS** with your items
- `my_inventory_dashboard.html` - Dashboard
- `my_inventory_history.json` - Price history

**Setup & Run:**

**Step 1: Edit your inventory**
```bash
# Open my_inventory.csv and add your items
# Format: Item Name,Type,Qty,Purchase Price (AUD),Purchase Date,notes,market link

# Example:
"Dragon Lore Souvenir",Skin,1,5000,2023-01-15,"Rare drop","https://..."
"Operation Breakout Case",Case,19,13.35,2024-01-15,"Your cases","https://..."
```

**Step 2: Run tracker**
```bash
bun my_inventory_tracker.ts
```

**Step 3: View dashboard**
```bash
# Open my_inventory_dashboard.html in your browser
```

---

## 🛠️ How to Run Each Tracker

### Using Claude Code (CLI)
```bash
# Open the project folder in Claude Code
cd /path/to/budapest2025

# Run any tracker
bun tracker.ts              # Budapest stickers
bun breakout_tracker.ts     # Breakout cases
bun cs_cases_tracker.ts     # All cases
bun my_inventory_tracker.ts # Your items
```

### View Results
```bash
# Generated files will be updated automatically
- index.html                      # Budapest dashboard
- breakout.html                   # Breakout dashboard
- cs_cases_dashboard.html         # Cases dashboard
- my_inventory_dashboard.html     # Your inventory dashboard
```

---

## 📈 Features by Tracker

### All Trackers Include:
- ✅ Real-time Steam Market price fetching
- ✅ Automatic price history tracking
- ✅ Portfolio value calculations
- ✅ ROI and profit/loss tracking
- ✅ HTML dashboard generation
- ✅ CSV export for spreadsheets
- ✅ Error handling & retries

### Budapest Tracker Extras:
- 🎯 Price predictions (2-week to 12-year)
- 🤖 AI investment signals (BUY/HOLD/WAIT)
- 🔔 Discord notifications
- 📊 Advanced analytics
- 🎨 Steam Market themed UI

### Personal Inventory Tracker Extras:
- 📈 Trend analysis (uptrend/downtrend/stable)
- 🔮 30-day and 90-day price predictions
- 📊 Volume and listings tracking
- 🎯 Automatic trend detection

---

## 📝 CSV Format for Personal Inventory

**File:** `my_inventory.csv`

```csv
Item Name,Type,Qty,Purchase Price (AUD),Purchase Date,Current Price (AUD),Notes,Market Link
"Item Name Here",Case,qty,price,YYYY-MM-DD,,Your notes here,https://steamcommunity.com/market/listings/730/...
```

**Example:**
```csv
Item Name,Type,Qty,Purchase Price (AUD),Purchase Date,Current Price (AUD),Notes,Market Link
"Operation Breakout Case",Case,19,13.35,2024-01-15,,Vintage 2014 case,https://steamcommunity.com/market/listings/730/Operation%20Breakout%20Weapon%20Case
"CS:GO Weapon Case",Case,1,1.50,2023-06-01,,Legendary 2013,https://steamcommunity.com/market/listings/730/CS%3AGO%20Weapon%20Case
"Dragon Lore Souvenir",Skin,1,5000,2023-11-01,,Ultra rare drop,https://steamcommunity.com/market/listings/730/...
```

---

## 🔄 Automation Setup (GitHub Actions)

The Budapest tracker auto-updates daily. To set up auto-updates for other trackers:

**File:** `.github/workflows/update-prices.yml`

Current schedule:
- 10:00 AM AEST
- 2:00 PM AEST
- 6:00 PM AEST
- 10:00 PM AEST
- 2:00 AM AEST
- 6:00 AM AEST

To add more trackers to auto-updates:
```yaml
- name: Update all trackers
  run: |
    bun tracker.ts
    bun breakout_tracker.ts
    bun cs_cases_tracker.ts
    bun my_inventory_tracker.ts
```

---

## 📊 Data Files Reference

### Price History Format
All `*_price_history.json` files track snapshots:

```json
{
  "entries": [
    {
      "date": "2026-03-13-12",
      "price": 17.40,
      "volume": 3209,
      "listings": 115,
      "totalValue": 330.60,
      "totalCost": 253.65,
      "roi": "30.3",
      "profitLoss": 76.95
    }
  ]
}
```

### Portfolio CSV Format
All `*_portfolio.csv` files include:
- Item name, type, quantity
- Cost per unit, total invested
- Current price, total value
- Profit/loss, ROI percentage
- Steam Market links

---

## 🎯 Common Tasks

### Update Breakout Cases Portfolio
```bash
# Edit breakout_cases_inventory.csv with your cases
# Then run tracker
bun breakout_tracker.ts
# Check breakout.html for results
```

### Add New Item to Personal Inventory
```bash
# 1. Edit my_inventory.csv
# 2. Add new row with item details
# 3. Run tracker
bun my_inventory_tracker.ts
# 4. Open my_inventory_dashboard.html
```

### Check Budapest Predictions
```bash
# Open index.html and scroll to:
# - "Timeline Projections" section for price forecasts
# - "Sell Timing Recommendation" for best sell windows
# - "Investment Signal" for current recommendation
```

### Export Portfolio to Excel
```bash
# All trackers generate CSV files that Excel can open:
- breakout_cases_inventory.csv
- cs_cases_portfolio.csv
- my_inventory.csv (after running tracker)
# Open in Excel/Google Sheets for analysis
```

---

## 🐛 Troubleshooting

### Tracker fails to fetch prices
- Check internet connection
- Steam Market might be rate limiting (tracker retries automatically)
- Try running again after 1 minute

### HTML dashboard is blank
- Make sure tracker completed successfully
- Check browser console for errors
- Clear browser cache and reload

### CSV parsing errors
- Ensure CSV format is correct (see format above)
- Item names with commas must be in quotes: `"Item, Name"`
- Check for extra spaces or special characters

### Price shows 0
- Item might not be on Steam Market
- Check Steam Market link is correct
- Tracker uses last known price if fetch fails

---

## 📱 Access on Claude Code for PC

### Method 1: Open Folder
```
1. Open Claude Code
2. File → Open Folder
3. Navigate to: /home/user/budapest2025
4. All files will be visible
```

### Method 2: Command Line
```bash
# In Claude Code terminal
cd /home/user/budapest2025
bun my_inventory_tracker.ts  # or other tracker
```

### Method 3: View Dashboards
```bash
# Open in browser
- file:///home/user/budapest2025/index.html
- file:///home/user/budapest2025/breakout.html
- file:///home/user/budapest2025/cs_cases_dashboard.html
- file:///home/user/budapest2025/my_inventory_dashboard.html
```

---

## 📚 File Structure

```
budapest2025/
├── README.md                          # This file
├── tracker.ts                         # Budapest stickers tracker
├── index.html                         # Budapest dashboard
├── sticker_price_history.json         # Budapest price data
├── breakout_tracker.ts                # Breakout cases tracker
├── breakout.html                      # Breakout dashboard
├── breakout_cases_inventory.csv       # Your Breakout cases
├── breakout_research.md               # Breakout analysis
├── cs_cases_tracker.ts                # Multi-case tracker
├── cs_cases_dashboard.html            # Cases dashboard
├── cs_cases_research.md               # Cases analysis
├── my_inventory_tracker.ts            # ⭐ Personal tracker
├── my_inventory.csv                   # ⭐ Your items (EDIT THIS)
├── my_inventory_dashboard.html        # ⭐ Your dashboard
└── .github/workflows/
    └── update-prices.yml              # Auto-update schedule
```

---

## 🔐 Privacy & Security

- All scripts run locally
- No personal data sent anywhere
- Steam Market API access is read-only
- History files stored locally
- CSV files are plain text (easy to backup)

---

## 💡 Tips & Best Practices

1. **Run trackers weekly** to build good price history
2. **Check trends** before making sell decisions
3. **Use 30/90-day predictions** to plan timing
4. **Monitor volume** - higher volume = more reliable prices
5. **Backup CSV files** regularly
6. **Check Discord alerts** for major price movements

---

## 🚀 Next Steps

1. **Setup Personal Inventory**
   - Edit `my_inventory.csv` with your items
   - Run `bun my_inventory_tracker.ts`
   - View dashboard in browser

2. **Schedule Auto-Updates**
   - GitHub Actions already runs Budapest tracker
   - Can add other trackers to auto-update

3. **Improve Predictions**
   - More data = better predictions
   - Run weekly for best trend analysis
   - Track for 30+ days before relying on forecasts

4. **Export & Analyze**
   - Export CSV files to Excel
   - Create pivot tables for analysis
   - Track ROI over time

---

## 📖 Version Info
- **Created:** March 2026
- **Last Updated:** March 13, 2026
- **Runtime:** Bun 1.3.9+
- **Status:** Fully tested and working

---

## 🎮 Happy Investing!

Questions? Check the relevant `*_research.md` files for detailed investment analysis.

For help:
- Run trackers with `bun tracker.ts`
- Check HTML dashboards for visual analysis
- Review CSV files for detailed data
- Edit `my_inventory.csv` to customize tracking
