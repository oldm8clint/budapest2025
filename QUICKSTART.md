# Quick Start Guide

Get your investment trackers running in 2 minutes!

## 🎯 TL;DR - Fastest Way

### Option 1: Run Everything at Once
```bash
./run_all_trackers.sh
```
Then open the generated HTML files in your browser.

### Option 2: Run Individual Tracker
```bash
# Your personal inventory
bun my_inventory_tracker.ts

# Then open: my_inventory_dashboard.html
```

---

## 📋 Setup (One-Time)

### 1. Add Your Items to Personal Inventory
Edit file: `my_inventory.csv`

**Template:**
```csv
Item Name,Type,Qty,Purchase Price (AUD),Purchase Date,Current Price (AUD),Notes,Market Link
"Operation Breakout Case",Case,19,13.35,2024-01-15,,Your cases,https://steamcommunity.com/market/listings/730/Operation%20Breakout%20Weapon%20Case
"CS:GO Weapon Case",Case,1,1.50,2023-06-01,,Legendary case,https://steamcommunity.com/market/listings/730/CS%3AGO%20Weapon%20Case
```

Just copy these lines and customize with YOUR items!

### 2. Find Steam Market Links
1. Go to https://steamcommunity.com/market/
2. Search for your item
3. Copy the URL from the browser

---

## ⚡ Quick Commands

```bash
# Update your personal inventory with current prices
bun my_inventory_tracker.ts

# Update Budapest stickers
bun tracker.ts

# Update Breakout cases
bun breakout_tracker.ts

# Update all cases portfolio
bun cs_cases_tracker.ts

# Run all trackers at once
./run_all_trackers.sh
```

---

## 🌐 View Your Dashboards

After running a tracker, open these files in your browser:

| Tracker | File |
|---------|------|
| **Your Items** | `my_inventory_dashboard.html` |
| **Budapest Stickers** | `index.html` |
| **Breakout Cases** | `breakout.html` |
| **All Cases** | `cs_cases_dashboard.html` |

**Quick way in Claude Code:**
```bash
# In terminal, run:
open my_inventory_dashboard.html

# Or use File → Open in browser
```

---

## 📊 What You'll See

### Your Personal Inventory Dashboard Shows:
- ✅ Total invested amount
- ✅ Current portfolio value
- ✅ Profit/Loss and ROI%
- ✅ Price trends (📈 up, 📉 down, → stable)
- ✅ 30-day and 90-day price predictions
- ✅ Volume and market listings

### Example Results:
```
Personal Inventory
✓ Total Invested: A$255
✓ Current Value: A$602
✓ Profit: +A$346 (135.6% ROI)

Trends:
- Operation Breakout Case: → Stable
- CS:GO Weapon Case: ↗ Uptrend
- Glove Case: ↗ Uptrend

Predictions (30 days):
- Operation Breakout: A$17.89
- CS:GO Weapon: A$320+
```

---

## 🔄 Regular Usage (Weekly)

```bash
# Every week, run this:
bun my_inventory_tracker.ts

# Open the dashboard to see:
# - Latest prices
# - Updated trends
# - New predictions
# - All-time gains/losses
```

---

## 🎯 Next Steps

1. **Today:** Edit `my_inventory.csv` with your items
2. **Today:** Run `bun my_inventory_tracker.ts`
3. **Today:** Open `my_inventory_dashboard.html`
4. **Weekly:** Run tracker again to update prices
5. **Monthly:** Review trends and make selling decisions

---

## 💡 Pro Tips

### Monitor Trends
- 📈 **Uptrend** = Good time to HOLD or buy more
- 📉 **Downtrend** = Consider selling at good prices
- → **Stable** = Wait for better opportunities

### Use Predictions
- **30-day forecast** = Short-term outlook
- **90-day forecast** = Longer trend
- More data = More accurate predictions

### Best Selling Windows
- **November-December** = Holiday season boost
- **After major updates** = New interest from players
- **When uptrend peaks** = Max price before drop

---

## ❓ Troubleshooting

### "Command not found: bun"
→ Install Bun from https://bun.sh

### "CSV parsing error"
→ Make sure item names with commas are in quotes:
```csv
"Item, With, Commas",Case,1,10,2024-01-01,,notes,link
```

### "No prices found"
→ Item might not be on Steam Market. Check the link manually.

### Dashboard is blank
→ Check browser console (F12) for errors, or try refreshing.

---

## 📞 Support

- **Check:** `README.md` for detailed documentation
- **Research:** `*_research.md` files for investment analysis
- **Data:** `*.csv` files for all your portfolio data
- **History:** `*_price_history.json` for price trends

---

## 🚀 You're Ready!

```bash
# Edit your inventory
nano my_inventory.csv

# Run tracker
bun my_inventory_tracker.ts

# View results
open my_inventory_dashboard.html
```

**That's it! Happy investing! 🎮📈**
