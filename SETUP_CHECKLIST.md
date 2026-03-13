# ✅ Setup & Access Checklist

Everything you need to run and access your investment trackers on Claude Code for PC.

## 📦 What's Installed & Ready

✅ **Budapest 2025 Sticker Tracker**
- Auto-updating 6x daily via GitHub Actions
- Live at: https://oldm8clint.github.io/budapest2025/
- Source: `tracker.ts`

✅ **Operation Breakout Cases Tracker**
- Tracks your 19 Breakout cases
- Cost basis: A$13.35 per case
- Current value: A$330.60

✅ **CS2 Cases Portfolio Tracker**
- Theoretical portfolio: 95 cases (5 tiers)
- Shows appreciation across different case ages

✅ **Personal Inventory Tracker** ⭐ START HERE
- Ready for YOUR items
- Just edit `my_inventory.csv` and run

## 🖥️ Access on Claude Code for PC

### Method 1: Clone Repository
```bash
git clone https://github.com/oldm8clint/budapest2025.git
cd budapest2025
```

### Method 2: Open Folder
```
File → Open Folder → Select budapest2025
```

### Method 3: Using Git Branch
```bash
# The development branch with all latest features
git checkout claude/continue-work-snCYs
```

---

## 🚀 Getting Started (5 Minutes)

### Step 1: View Available Trackers
```bash
ls -la *.ts
# Shows:
# - tracker.ts (Budapest)
# - breakout_tracker.ts (Breakout cases)
# - cs_cases_tracker.ts (All cases)
# - my_inventory_tracker.ts (YOUR ITEMS)
```

### Step 2: Edit Your Inventory
```bash
# Open and edit this file
nano my_inventory.csv

# Or in Claude Code: right-click → Edit
```

**Add your items like this:**
```csv
Item Name,Type,Qty,Purchase Price (AUD),Purchase Date,Current Price (AUD),Notes,Market Link
"Your Item",Case,quantity,price,YYYY-MM-DD,,notes,https://steam...
```

### Step 3: Run Tracker
```bash
bun my_inventory_tracker.ts
```

### Step 4: View Dashboard
```bash
# Open in browser (Claude Code can open it)
open my_inventory_dashboard.html

# Or just double-click the HTML file
```

---

## 📋 File Reference

### Must-Have Files (Already Set Up)
```
✓ my_inventory.csv                  - Your items (EDIT THIS)
✓ my_inventory_tracker.ts           - Your tracker script
✓ my_inventory_dashboard.html       - Your results dashboard
✓ README.md                         - Complete documentation
✓ QUICKSTART.md                     - Fast setup guide
✓ run_all_trackers.sh               - Run all trackers at once
```

### Optional Files (Reference/Analysis)
```
• breakout_research.md              - Breakout case analysis
• cs_cases_research.md              - CS2 cases analysis
• tracker.ts                        - Budapest tracker
• cs_cases_tracker.ts               - Cases tracker
```

### Generated Data Files (Auto-Created)
```
• my_inventory_history.json         - Your price history
• *_price_history.json              - Price records for each tracker
• *_dashboard.html                  - Generated dashboards
```

---

## 🎯 Quick Commands You'll Use Often

```bash
# Update your personal inventory
bun my_inventory_tracker.ts

# Run all trackers
./run_all_trackers.sh

# View your dashboard
open my_inventory_dashboard.html
```

---

## 📊 What You Can Track

### Items to Add to `my_inventory.csv`:

**Cases:**
```csv
"Operation Breakout Case",Case,19,13.35,2024-01-15,,Your Breakout cases,https://...
"CS:GO Weapon Case",Case,5,1.50,2023-06-01,,Vintage 2013,https://...
"Glove Case",Case,1,0.25,2023-05-15,,Strong appreciation,https://...
```

**Skins:**
```csv
"Dragon Lore Souvenir",Skin,1,5000,2023-11-01,,Ultra rare,https://...
"Karambit Fade",Skin,1,3000,2024-01-15,,Knife skin,https://...
```

**Stickers:**
```csv
"Katowice 2014 Holo",Sticker,1,200,2023-06-01,,Legendary,https://...
"Complexity Holo",Sticker,1,150,2023-06-01,,Major holo,https://...
```

---

## 🔧 Troubleshooting Checklist

### Tracker Won't Run
- [ ] Bun is installed: `bun --version`
- [ ] You're in the budapest2025 folder
- [ ] CSV file exists and is properly formatted
- [ ] Run again (might be Steam API rate limiting)

### Can't Find Tracker Output
- [ ] Check current folder: `pwd`
- [ ] List generated files: `ls -la *.html`
- [ ] Try refreshing browser (F5 or Ctrl+R)

### CSV Not Parsing
- [ ] Item names with commas must be in quotes
- [ ] No extra spaces in format
- [ ] Check for special characters
- [ ] Use provided template format

### Prices Show 0
- [ ] Item might not exist on Steam Market
- [ ] Check the Steam Market link manually
- [ ] Wait for price data to populate (runs with history)

---

## 📈 What to Expect from Dashboards

### Your Personal Inventory Dashboard Shows:

**Summary Cards:**
- Total Invested (sum of all purchases)
- Current Value (live Steam Market prices)
- Profit/Loss (dollars and percentage)
- Last Update (when you ran tracker)

**Detailed Table:**
- Item name and type
- Quantity owned
- Purchase price per unit
- Current price per unit
- Total portfolio value
- ROI percentage
- Price trend (📈 up, 📉 down, → stable)
- Price predictions (30-day, 90-day)

---

## 🔄 Weekly Routine

```bash
# Every week, spend 2 minutes updating:
bun my_inventory_tracker.ts

# Open dashboard to check:
# 1. New prices
# 2. Updated trends
# 3. Profit changes
# 4. Predicted prices
```

---

## 💾 Data Backup

Your important files:
```
my_inventory.csv                 - ALWAYS BACKUP THIS
my_inventory_history.json        - Price history (auto-generated)
*_price_history.json             - Price records for each tracker
```

**Backup strategy:**
```bash
# Copy to safe location
cp my_inventory.csv ~/backup/my_inventory_$(date +%Y%m%d).csv
```

---

## 🌐 Online Dashboards (Auto-Updating)

Budapest tracker updates automatically:
- **Live Dashboard:** https://oldm8clint.github.io/budapest2025/
- **Updates:** 6 times daily (10am, 2pm, 6pm, 10pm, 2am, 6am AEST)
- **Auto-commits:** Changes saved to GitHub automatically

---

## 📚 Documentation Files

### For Quick Reference
- **QUICKSTART.md** - 2-minute setup (this is your friend!)
- **README.md** - Complete reference guide
- **SETUP_CHECKLIST.md** - This file

### For Investment Research
- **breakout_research.md** - Breakout cases analysis
- **cs_cases_research.md** - CS2 cases analysis

---

## 🎮 Ready to Start?

### Option 1: Super Quick (2 minutes)
```bash
# Just track Budapest stickers
bun tracker.ts
open index.html
```

### Option 2: Personal Inventory Only (5 minutes)
```bash
# Edit your items
nano my_inventory.csv

# Run tracker
bun my_inventory_tracker.ts

# View results
open my_inventory_dashboard.html
```

### Option 3: Full Setup (10 minutes)
```bash
# Run everything
./run_all_trackers.sh

# Open all dashboards
open *.html
```

---

## ✨ Pro Tips

1. **Run weekly** for best trend analysis
2. **Add diverse items** to track multiple investments
3. **Check trends** before making sell decisions
4. **Export CSV** to Excel for custom analysis
5. **Set reminders** to run trackers on Sundays

---

## 🎯 Success Criteria

You'll know everything is set up when:
- ✅ `my_inventory.csv` contains your items
- ✅ `bun my_inventory_tracker.ts` runs without errors
- ✅ `my_inventory_dashboard.html` shows your portfolio
- ✅ You can see prices, trends, and predictions
- ✅ HTML updates when you run tracker again

---

## 📞 Next Steps

1. **Today:** Read QUICKSTART.md (2 minutes)
2. **Today:** Edit my_inventory.csv with your items
3. **Today:** Run first tracker
4. **Tomorrow:** Schedule weekly runs
5. **Weekly:** Run tracker, check dashboard

---

## 🚀 You're All Set!

Everything is installed, documented, and ready to use.

**To get started right now:**
```bash
bun my_inventory_tracker.ts && open my_inventory_dashboard.html
```

Happy investing! 🎮📈
