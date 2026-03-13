// Counter-Strike Cases Portfolio Tracker
// Monitors multiple CS2/CS:GO cases for price appreciation and predictions

const SCRIPT_DIR = import.meta.dir;
const HISTORY_FILE = `${SCRIPT_DIR}/cs_cases_price_history.json`;
const HTML_FILE = `${SCRIPT_DIR}/cs_cases_dashboard.html`;
const CSV_FILE = `${SCRIPT_DIR}/cs_cases_portfolio.csv`;

const DELAY_MS = 1500;
const CURRENCY_AUD = 21;

// Representative portfolio: 19 cases per tier (5 tiers = 95 cases total)
// This covers the age spectrum from newest to oldest
const casePortfolio = [
  // Tier 1: Vintage (2013-2014) - Best appreciation potential
  { name: "CS:GO Weapon Case", tier: 1, qty: 19, costPerUnit: 1.50, releaseDate: "2013-08-13", ageYears: 12 },
  { name: "eSports 2013 Case", tier: 1, qty: 19, costPerUnit: 2.00, releaseDate: "2013-11-20", ageYears: 12 },
  { name: "Operation Breakout Case", tier: 1, qty: 19, costPerUnit: 13.35, releaseDate: "2014-03-01", ageYears: 12 },

  // Tier 2: Old (2015-2016) - Strong appreciation
  { name: "Chroma Case", tier: 2, qty: 19, costPerUnit: 0.50, releaseDate: "2015-01-08", ageYears: 11 },
  { name: "Falchion Case", tier: 2, qty: 19, costPerUnit: 0.50, releaseDate: "2015-02-10", ageYears: 11 },
  { name: "Shadow Case", tier: 2, qty: 19, costPerUnit: 0.30, releaseDate: "2015-12-08", ageYears: 10 },

  // Tier 3: Mid-Era (2016-2018) - Moderate appreciation
  { name: "Gamma Case", tier: 3, qty: 19, costPerUnit: 0.30, releaseDate: "2016-06-21", ageYears: 9 },
  { name: "Glove Case", tier: 3, qty: 19, costPerUnit: 0.25, releaseDate: "2016-07-01", ageYears: 9 },
  { name: "Horizon Case", tier: 3, qty: 19, costPerUnit: 0.20, releaseDate: "2018-03-13", ageYears: 8 },

  // Tier 4: Major Cases (2019-2021) - Slower growth
  { name: "Prisma Case", tier: 4, qty: 19, costPerUnit: 0.20, releaseDate: "2019-03-19", ageYears: 7 },
  { name: "Shattered Web Case", tier: 4, qty: 19, costPerUnit: 0.15, releaseDate: "2019-11-26", ageYears: 6 },
  { name: "Broken Fang Case", tier: 4, qty: 19, costPerUnit: 0.12, releaseDate: "2020-12-01", ageYears: 5 },

  // Tier 5: Current CS2 Cases (2023+) - Future potential
  { name: "Dreams & Nightmares Case", tier: 5, qty: 19, costPerUnit: 0.08, releaseDate: "2023-06-15", ageYears: 2 },
  { name: "Fracture Case", tier: 5, qty: 19, costPerUnit: 0.08, releaseDate: "2023-08-08", ageYears: 2 },
  { name: "Ancient Case", tier: 5, qty: 19, costPerUnit: 0.08, releaseDate: "2023-09-21", ageYears: 2 },
];

interface CaseSnapshot {
  date: string;
  cases: Record<string, { price: number; volume: number; listings: number }>;
  portfolio: {
    totalCost: number;
    totalValue: number;
    totalProfitLoss: number;
    overallROI: string;
    byTier: Record<string, { cost: number; value: number; roi: string }>;
  };
}

interface CaseHistory {
  entries: CaseSnapshot[];
}

async function loadHistory(): Promise<CaseHistory> {
  try {
    const f = Bun.file(HISTORY_FILE);
    if (await f.exists()) return await f.json();
  } catch {}
  return { entries: [] };
}

function getMarketUrl(caseName: string): string {
  return `https://steamcommunity.com/market/listings/730/${encodeURIComponent(caseName)}`;
}

async function fetchPrice(caseName: string): Promise<{ price: number; volume: number; listings: number }> {
  for (let attempt = 0; attempt <= 2; attempt++) {
    try {
      const url = `https://steamcommunity.com/market/priceoverview/?appid=730&currency=${CURRENCY_AUD}&market_hash_name=${encodeURIComponent(caseName)}`;
      const res = await fetch(url);

      if (res.status === 429) {
        await new Promise(r => setTimeout(r, 15000));
        continue;
      }

      const data = await res.json() as any;
      if (data.lowest_price) {
        const priceStr = data.lowest_price.replace(/[^0-9.]/g, '');
        const price = parseFloat(priceStr) || 0;
        const volume = data.volume ? parseInt(data.volume.toString().replace(/,/g, ''), 10) : 0;

        let listings = 0;
        try {
          const searchUrl = `https://steamcommunity.com/market/search/render/?appid=730&norender=1&count=1&start=0&sort_column=price&sort_dir=asc&q=${encodeURIComponent(caseName)}`;
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

async function main() {
  try {
    console.log('=== CS2 Cases Portfolio Tracker ===');
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}-${String(now.getHours()).padStart(2,'0')}`;
    const todayFull = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')} UTC`;

    const history = await loadHistory();
    const existingToday = history.entries.find(e => e.date === today);

    if (!existingToday) {
      console.log(`\nFetching prices for ${casePortfolio.length} cases...`);
      console.log(`Estimated time: ~${Math.ceil(casePortfolio.length * DELAY_MS / 60000)} minutes\n`);

      const snapshot: CaseSnapshot = {
        date: today,
        cases: {},
        portfolio: { totalCost: 0, totalValue: 0, totalProfitLoss: 0, overallROI: "0", byTier: {} },
      };

      for (let i = 0; i < casePortfolio.length; i++) {
        const c = casePortfolio[i];
        process.stdout.write(`[${i+1}/${casePortfolio.length}] ${c.name}... `);

        const result = await fetchPrice(c.name);
        snapshot.cases[c.name] = result;

        if (result.price > 0) {
          console.log(`A$${result.price.toFixed(2)}`);
        } else {
          console.log(`FAILED (using cost as estimate)`);
        }

        if (i < casePortfolio.length - 1) await new Promise(r => setTimeout(r, DELAY_MS));
      }

      // Calculate portfolio totals
      let totalCost = 0, totalValue = 0, byTier: Record<string, { cost: number; value: number }> = {};

      for (const c of casePortfolio) {
        const tierKey = `Tier ${c.tier}`;
        if (!byTier[tierKey]) byTier[tierKey] = { cost: 0, value: 0 };

        const cost = c.qty * c.costPerUnit;
        const price = snapshot.cases[c.name]?.price || c.costPerUnit;
        const value = c.qty * price;

        byTier[tierKey].cost += cost;
        byTier[tierKey].value += value;
        totalCost += cost;
        totalValue += value;
      }

      snapshot.portfolio.totalCost = totalCost;
      snapshot.portfolio.totalValue = totalValue;
      snapshot.portfolio.totalProfitLoss = totalValue - totalCost;
      snapshot.portfolio.overallROI = totalCost > 0 ? ((snapshot.portfolio.totalProfitLoss / totalCost) * 100).toFixed(1) : "0";

      for (const [tier, data] of Object.entries(byTier)) {
        const roi = data.cost > 0 ? ((data.value - data.cost) / data.cost * 100).toFixed(1) : "0";
        snapshot.portfolio.byTier[tier] = { cost: data.cost, value: data.value, roi };
      }

      history.entries.push(snapshot);
      await Bun.write(HISTORY_FILE, JSON.stringify(history, null, 2));
    }

    // Use latest data
    const latestEntry = history.entries[history.entries.length - 1];

    // Generate CSV
    let csvOut = "Case Name,Tier,Qty,Cost/Unit (AUD),Total Cost (AUD),Current Price (AUD),Total Value (AUD),Profit/Loss (AUD),ROI %,Age (Years),Steam Market Link\n";
    for (const c of casePortfolio) {
      const price = latestEntry.cases[c.name]?.price || c.costPerUnit;
      const cost = c.qty * c.costPerUnit;
      const value = c.qty * price;
      const pl = value - cost;
      const roi = cost > 0 ? ((pl / cost) * 100).toFixed(1) : "0";
      csvOut += `"${c.name}",${c.tier},${c.qty},${c.costPerUnit.toFixed(2)},${cost.toFixed(2)},${price.toFixed(2)},${value.toFixed(2)},${pl.toFixed(2)},${roi}%,${c.ageYears},${getMarketUrl(c.name)}\n`;
    }
    csvOut += `\n"TOTAL PORTFOLIO",,${casePortfolio.reduce((a, c) => a + c.qty, 0)},,${latestEntry.portfolio.totalCost.toFixed(2)},,${latestEntry.portfolio.totalValue.toFixed(2)},${latestEntry.portfolio.totalProfitLoss.toFixed(2)},${latestEntry.portfolio.overallROI}%,\n`;
    await Bun.write(CSV_FILE, csvOut);

    // Generate HTML
    const tierBreakdown = Object.entries(latestEntry.portfolio.byTier)
      .map(([tier, data]) => `
        <div class="tier-card">
          <div class="tier-header">${tier}</div>
          <div class="tier-stats">
            <div><span>Invested:</span> <strong>A$${data.cost.toFixed(2)}</strong></div>
            <div><span>Value:</span> <strong class="${parseFloat(data.roi) >= 0 ? 'positive' : 'negative'}">A$${data.value.toFixed(2)}</strong></div>
            <div><span>ROI:</span> <strong class="${parseFloat(data.roi) >= 0 ? 'positive' : 'negative'}">${data.roi}%</strong></div>
          </div>
        </div>
      `).join('');

    const caseRows = casePortfolio.map(c => {
      const price = latestEntry.cases[c.name]?.price || c.costPerUnit;
      const volume = latestEntry.cases[c.name]?.volume || 0;
      const listings = latestEntry.cases[c.name]?.listings || 0;
      const cost = c.qty * c.costPerUnit;
      const value = c.qty * price;
      const pl = value - cost;
      const roi = cost > 0 ? ((pl / cost) * 100).toFixed(1) : "0";

      return `<tr>
        <td><a href="${getMarketUrl(c.name)}" target="_blank">${c.name}</a></td>
        <td>T${c.tier}</td>
        <td>${c.qty}</td>
        <td>A$${price.toFixed(2)}</td>
        <td>A$${cost.toFixed(2)}</td>
        <td class="${parseFloat(roi) >= 0 ? 'positive' : 'negative'}">A$${value.toFixed(2)}</td>
        <td class="${parseFloat(roi) >= 0 ? 'positive' : 'negative'}">${parseFloat(roi) >= 0 ? '+' : ''}${roi}%</td>
        <td>${volume}</td>
        <td>${listings}</td>
      </tr>`;
    }).join('');

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>CS2 Cases Portfolio Tracker</title>
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

  .tier-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 12px; margin-bottom: 24px; }
  .tier-card { background: rgba(0,0,0,0.2); border: 1px solid rgba(0,0,0,0.3); border-radius: 4px; padding: 16px; }
  .tier-header { font-size: 14px; font-weight: 700; color: #66c0f4; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid rgba(0,0,0,0.3); }
  .tier-stats { display: flex; flex-direction: column; gap: 8px; font-size: 13px; }
  .tier-stats div { display: flex; justify-content: space-between; }
  .tier-stats span { color: #8f98a0; }

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
  <h1>🎮 CS2 Cases Portfolio Tracker</h1>
  <p class="subtitle">Tracking 95 cases (19 per tier) across age spectrum | Updated ${todayFull}</p>

  <div class="summary">
    <div class="card">
      <div class="card-label">Total Invested</div>
      <div class="card-value">A$${latestEntry.portfolio.totalCost.toFixed(0)}</div>
      <div class="card-sub">95 cases total</div>
    </div>
    <div class="card">
      <div class="card-label">Portfolio Value</div>
      <div class="card-value ${parseFloat(latestEntry.portfolio.overallROI) >= 0 ? 'positive' : 'negative'}">A$${latestEntry.portfolio.totalValue.toFixed(0)}</div>
      <div class="card-sub">current market prices</div>
    </div>
    <div class="card">
      <div class="card-label">Profit/Loss</div>
      <div class="card-value ${latestEntry.portfolio.totalProfitLoss >= 0 ? 'positive' : 'negative'}">A$${latestEntry.portfolio.totalProfitLoss >= 0 ? '+' : ''}${latestEntry.portfolio.totalProfitLoss.toFixed(0)}</div>
      <div class="card-sub">${latestEntry.portfolio.overallROI}% ROI</div>
    </div>
    <div class="card">
      <div class="card-label">Portfolio Snapshot</div>
      <div class="card-value">#${history.entries.length}</div>
      <div class="card-sub">total updates</div>
    </div>
  </div>

  <h2>By Tier Performance</h2>
  <div class="tier-grid">
    ${tierBreakdown}
  </div>

  <h2>Full Case Inventory (${casePortfolio.length} cases)</h2>
  <table>
    <thead>
      <tr>
        <th>Case Name</th>
        <th>Tier</th>
        <th>Qty</th>
        <th>Price</th>
        <th>Cost</th>
        <th>Value</th>
        <th>ROI</th>
        <th>Vol</th>
        <th>Listings</th>
      </tr>
    </thead>
    <tbody>
      ${caseRows}
    </tbody>
  </table>

  <h2>Investment Thesis</h2>
  <div style="background: rgba(0,0,0,0.2); border-left: 3px solid #66c0f4; padding: 16px; margin-bottom: 24px; border-radius: 0 4px 4px 0;">
    <p style="margin-bottom: 12px;"><strong>Tier 1 (Vintage):</strong> 2013-2014 cases with 12+ year track record. Lowest supply, highest collector premium. Expected 10-25% annual appreciation.</p>
    <p style="margin-bottom: 12px;"><strong>Tier 2 (Old):</strong> 2015-2016 cases showing strong growth phase. Still building value. Expected 15-30% annual appreciation.</p>
    <p style="margin-bottom: 12px;"><strong>Tier 3 (Mid-Era):</strong> 2016-2018 cases in acceleration phase. Lower entry cost. Expected 20-50% annual appreciation.</p>
    <p style="margin-bottom: 12px;"><strong>Tier 4 (Major):</strong> 2019-2021 cases with slower growth. Patient hold needed. Expected 10-20% annual appreciation.</p>
    <p><strong>Tier 5 (CS2):</strong> 2023+ current cases. Newest releases showing decline then stabilization. Expected long-term appreciation 15-50% annually once stabilized.</p>
  </div>

  <div class="footer">
    <p>CS2 Cases Portfolio Tracker | Last updated ${todayFull}</p>
    <p><a href="https://oldm8clint.github.io/budapest2025/">← Back to Main Dashboard</a></p>
  </div>
</div>

<script>
  setTimeout(() => location.reload(), 30 * 60 * 1000);
</script>
</body>
</html>`;

    console.log(`\nWriting files...`);
    await Bun.write(HTML_FILE, html);
    await Bun.write(CSV_FILE, csvOut);

    console.log(`\n========================================`);
    console.log(`DONE - ${todayFull}`);
    console.log(`========================================`);
    console.log(`Portfolio: 95 cases | Invested: A$${latestEntry.portfolio.totalCost.toFixed(2)} | Value: A$${latestEntry.portfolio.totalValue.toFixed(2)} | ROI: ${latestEntry.portfolio.overallROI}%`);
    console.log(`Snapshots: ${history.entries.length}`);

  } catch (err) {
    console.error('ERROR:', err);
    console.error('Stack:', (err instanceof Error) ? err.stack : 'N/A');
    process.exit(1);
  }
}

main();
