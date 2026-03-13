// Personal Inventory Tracker with Price Predictions
// Reads from my_inventory.csv and tracks market prices with trend analysis

import { parse } from "csv";

const SCRIPT_DIR = import.meta.dir;
const INVENTORY_FILE = `${SCRIPT_DIR}/my_inventory.csv`;
const HISTORY_FILE = `${SCRIPT_DIR}/my_inventory_history.json`;
const HTML_FILE = `${SCRIPT_DIR}/my_inventory_dashboard.html`;
const CURRENCY_AUD = 21;

interface InventoryItem {
  name: string;
  type: string;
  qty: number;
  purchasePrice: number;
  purchaseDate: string;
  notes: string;
  marketLink: string;
}

interface PriceRecord {
  date: string;
  itemName: string;
  price: number;
  volume: number;
  listings: number;
}

interface InventoryHistory {
  lastUpdated: string;
  items: Record<string, PriceRecord[]>;
}

async function loadInventory(): Promise<InventoryItem[]> {
  try {
    const content = await Bun.file(INVENTORY_FILE).text();
    const lines = content.trim().split('\n');
    const items: InventoryItem[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;

      // Better CSV parsing - handle quoted fields
      const parts: string[] = [];
      let current = '';
      let inQuotes = false;

      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        const nextChar = line[j + 1];

        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          parts.push(current.replace(/^"|"$/g, '').trim());
          current = '';
        } else {
          current += char;
        }
      }
      parts.push(current.replace(/^"|"$/g, '').trim());

      if (parts.length < 7) continue;

      const [name, type, qty, purchasePrice, purchaseDate, _, notes] = parts;
      const marketLink = parts[7] || '';

      if (!name || name === 'Item Name') continue;

      items.push({
        name,
        type,
        qty: parseInt(qty) || 0,
        purchasePrice: parseFloat(purchasePrice) || 0,
        purchaseDate,
        notes,
        marketLink,
      });
    }

    return items;
  } catch (e) {
    console.log(`Warning: Could not load inventory: ${e}`);
    return [];
  }
}

async function loadHistory(): Promise<InventoryHistory> {
  try {
    const f = Bun.file(HISTORY_FILE);
    if (await f.exists()) return await f.json();
  } catch {}
  return { lastUpdated: new Date().toISOString(), items: {} };
}

async function fetchPrice(itemName: string): Promise<{ price: number; volume: number; listings: number }> {
  for (let attempt = 0; attempt <= 2; attempt++) {
    try {
      const url = `https://steamcommunity.com/market/priceoverview/?appid=730&currency=${CURRENCY_AUD}&market_hash_name=${encodeURIComponent(itemName)}`;
      const res = await fetch(url);

      if (res.status === 429) {
        await new Promise(r => setTimeout(r, 15000));
        continue;
      }

      const data = await res.json() as any;
      if (data.lowest_price) {
        const price = parseFloat(data.lowest_price.replace(/[^0-9.]/g, '')) || 0;
        const volume = data.volume ? parseInt(data.volume.toString().replace(/,/g, ''), 10) : 0;

        let listings = 0;
        try {
          const searchUrl = `https://steamcommunity.com/market/search/render/?appid=730&norender=1&count=1&start=0&sort_column=price&sort_dir=asc&q=${encodeURIComponent(itemName)}`;
          const searchRes = await fetch(searchUrl);
          if (searchRes.ok) {
            const searchData = await searchRes.json() as any;
            if (searchData.results?.[0]) listings = searchData.results[0].sell_listings || 0;
          }
        } catch {}

        return { price, volume, listings };
      }

      if (attempt < 2) await new Promise(r => setTimeout(r, 3000));
    } catch (e) {
      if (attempt < 2) await new Promise(r => setTimeout(r, 3000));
    }
  }
  return { price: 0, volume: 0, listings: 0 };
}

function calculateTrend(history: PriceRecord[]): { trend: string; change: number; direction: string } {
  if (history.length < 2) return { trend: "Insufficient data", change: 0, direction: "→" };

  const recent = history.slice(-5); // Last 5 records
  const avgRecent = recent.reduce((a, r) => a + r.price, 0) / recent.length;
  const prevAvg = history.length > 5 ? history.slice(-10, -5).reduce((a, r) => a + r.price, 0) / 5 : recent[0].price;

  const change = ((avgRecent - prevAvg) / prevAvg) * 100;
  let trend = "Stable";
  let direction = "→";

  if (change > 10) { trend = "Strong Uptrend"; direction = "📈"; }
  else if (change > 3) { trend = "Uptrend"; direction = "↗"; }
  else if (change < -10) { trend = "Strong Downtrend"; direction = "📉"; }
  else if (change < -3) { trend = "Downtrend"; direction = "↘"; }

  return { trend, change, direction };
}

function predictPrice(history: PriceRecord[], days: number): number {
  if (history.length < 2) return history[0]?.price || 0;

  const recent = history.slice(-7); // Last 7 records
  const avgChange = recent.length > 1
    ? (recent[recent.length - 1].price - recent[0].price) / (recent.length - 1)
    : 0;

  const dailyGrowth = avgChange / 7; // Convert to daily
  const currentPrice = recent[recent.length - 1].price;

  return Math.max(0, currentPrice + (dailyGrowth * days));
}

async function main() {
  try {
    console.log('=== Personal Inventory Tracker ===\n');

    const items = await loadInventory();
    if (items.length === 0) {
      console.log('No items found in my_inventory.csv');
      console.log('Create a CSV file with your items to track them.');
      return;
    }

    const history = await loadHistory();
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const todayFull = now.toISOString().split('.')[0] + ' UTC';

    console.log(`Found ${items.length} items to track...\n`);

    let totalCost = 0, totalValue = 0;
    const itemStats: any[] = [];

    for (const item of items) {
      process.stdout.write(`[${items.indexOf(item) + 1}/${items.length}] ${item.name}... `);

      const result = await fetchPrice(item.name);

      if (!history.items[item.name]) history.items[item.name] = [];

      const record: PriceRecord = {
        date: today,
        itemName: item.name,
        price: result.price || item.purchasePrice,
        volume: result.volume,
        listings: result.listings,
      };

      // Avoid duplicates on same day
      const existingToday = history.items[item.name].find(r => r.date === today);
      if (!existingToday) {
        history.items[item.name].push(record);
      }

      const currentPrice = result.price || item.purchasePrice;
      const totalCostItem = item.qty * item.purchasePrice;
      const totalValueItem = item.qty * currentPrice;
      const pl = totalValueItem - totalCostItem;
      const roi = totalCostItem > 0 ? ((pl / totalCostItem) * 100).toFixed(1) : "0";

      const trend = calculateTrend(history.items[item.name]);
      const pred30days = predictPrice(history.items[item.name], 30);
      const pred90days = predictPrice(history.items[item.name], 90);

      itemStats.push({
        name: item.name,
        type: item.type,
        qty: item.qty,
        purchasePrice: item.purchasePrice,
        currentPrice,
        totalCost: totalCostItem,
        totalValue: totalValueItem,
        pl,
        roi,
        trend: trend.trend,
        direction: trend.direction,
        change: trend.change.toFixed(1),
        pred30: pred30days.toFixed(2),
        pred90: pred90days.toFixed(2),
        volume: result.volume,
        listings: result.listings,
      });

      totalCost += totalCostItem;
      totalValue += totalValueItem;

      if (result.price > 0) {
        console.log(`A$${currentPrice.toFixed(2)} (${trend.direction} ${trend.trend})`);
      } else {
        console.log(`No price found`);
      }

      if (items.indexOf(item) < items.length - 1) await new Promise(r => setTimeout(r, 1500));
    }

    // Save history
    history.lastUpdated = now.toISOString();
    await Bun.write(HISTORY_FILE, JSON.stringify(history, null, 2));

    const pl = totalValue - totalCost;
    const roi = totalCost > 0 ? ((pl / totalCost) * 100).toFixed(1) : "0";

    // Generate HTML
    const itemRows = itemStats.map(s => `<tr>
      <td><a href="${items.find(i => i.name === s.name)?.marketLink}" target="_blank">${s.name}</a></td>
      <td>${s.type}</td>
      <td>${s.qty}</td>
      <td>A$${s.purchasePrice.toFixed(2)}</td>
      <td>A$${s.currentPrice.toFixed(2)}</td>
      <td class="${parseFloat(s.roi) >= 0 ? 'positive' : 'negative'}">A$${s.totalValue.toFixed(2)}</td>
      <td class="${parseFloat(s.roi) >= 0 ? 'positive' : 'negative'}">+${s.roi}%</td>
      <td>${s.direction} ${s.trend}</td>
      <td>30d: A$${s.pred30}<br>90d: A$${s.pred90}</td>
    </tr>`).join('');

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>My Inventory Tracker</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Inter', Arial, sans-serif; background: #1b2838; color: #c6d4df; padding: 20px; }
  .container { max-width: 1400px; margin: 0 auto; }

  h1 { color: #fff; font-size: 32px; margin-bottom: 8px; }
  .subtitle { color: #8f98a0; margin-bottom: 24px; }

  .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 24px; }
  .card { background: rgba(0,0,0,0.2); border: 1px solid rgba(0,0,0,0.3); border-radius: 4px; padding: 16px; }
  .card-label { color: #8f98a0; font-size: 11px; text-transform: uppercase; margin-bottom: 8px; }
  .card-value { font-size: 28px; font-weight: 700; margin-bottom: 4px; }
  .card-sub { color: #8f98a0; font-size: 12px; }

  .positive { color: #5ba32b; }
  .negative { color: #c33c3c; }

  h2 { color: #fff; font-size: 20px; margin: 32px 0 16px; }

  table { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 12px; }
  th { background: #1a3a52; color: #8f98a0; padding: 10px 8px; text-align: left; font-size: 10px; text-transform: uppercase; border-bottom: 1px solid #0e1a26; }
  td { padding: 8px; border-bottom: 1px solid rgba(0,0,0,0.2); }
  tr:hover { background: rgba(103,193,245,0.03); }
  a { color: #67c1f5; text-decoration: none; }
  a:hover { text-decoration: underline; }

  .footer { text-align: center; color: #8f98a0; font-size: 12px; margin-top: 40px; padding-top: 20px; border-top: 1px solid rgba(0,0,0,0.3); }
</style>
</head>
<body>
<div class="container">
  <h1>📦 My Inventory Tracker</h1>
  <p class="subtitle">Tracking ${items.length} items with price predictions | Updated ${todayFull}</p>

  <div class="summary">
    <div class="card">
      <div class="card-label">Total Invested</div>
      <div class="card-value">A$${totalCost.toFixed(0)}</div>
      <div class="card-sub">${items.reduce((a, i) => a + i.qty, 0)} items</div>
    </div>
    <div class="card">
      <div class="card-label">Current Value</div>
      <div class="card-value ${pl >= 0 ? 'positive' : 'negative'}">A$${totalValue.toFixed(0)}</div>
      <div class="card-sub">market prices</div>
    </div>
    <div class="card">
      <div class="card-label">Profit/Loss</div>
      <div class="card-value ${pl >= 0 ? 'positive' : 'negative'}">A$${pl >= 0 ? '+' : ''}${pl.toFixed(0)}</div>
      <div class="card-sub">${roi}% ROI</div>
    </div>
    <div class="card">
      <div class="card-label">Last Updated</div>
      <div class="card-value">Today</div>
      <div class="card-sub">${todayFull}</div>
    </div>
  </div>

  <h2>Portfolio Details</h2>
  <table>
    <thead>
      <tr>
        <th>Item</th>
        <th>Type</th>
        <th>Qty</th>
        <th>Buy Price</th>
        <th>Current</th>
        <th>Value</th>
        <th>ROI</th>
        <th>Trend</th>
        <th>Predictions</th>
      </tr>
    </thead>
    <tbody>
      ${itemRows}
    </tbody>
  </table>

  <h2>How to Use</h2>
  <div style="background: rgba(0,0,0,0.2); border-left: 3px solid #66c0f4; padding: 16px; margin-bottom: 24px; border-radius: 0 4px 4px 0;">
    <p><strong>1. Create/Edit my_inventory.csv</strong> with your items (name, type, qty, purchase price, date)</p>
    <p><strong>2. Run this tracker</strong> to fetch current prices and generate predictions</p>
    <p><strong>3. Check trends</strong> to see if items are going up or down</p>
    <p><strong>4. Use predictions</strong> to decide when to sell (30-day and 90-day forecasts)</p>
  </div>

  <div class="footer">
    <p>Personal Inventory Tracker | Last updated ${todayFull}</p>
  </div>
</div>
</body>
</html>`;

    await Bun.write(HTML_FILE, html);

    console.log(`\n========================================`);
    console.log(`DONE - ${todayFull}`);
    console.log(`========================================`);
    console.log(`Portfolio: ${items.length} items | Invested: A$${totalCost.toFixed(2)} | Value: A$${totalValue.toFixed(2)} | P/L: A$${pl.toFixed(2)} (${roi}%)`);

  } catch (err) {
    console.error('ERROR:', err);
    console.error('Stack:', (err instanceof Error) ? err.stack : 'N/A');
    process.exit(1);
  }
}

main();
