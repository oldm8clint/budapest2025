#!/usr/bin/env bun
// Steam Inventory Importer for CS2 Sticker Tracker
// Usage: bun import-inventory.ts <STEAM_URL_OR_ID> [--event "Budapest 2025"] [--cost 0.35]
//
// Accepts:
//   - Steam vanity name:   oldm8clint
//   - Full profile URL:    https://steamcommunity.com/id/oldm8clint/
//   - SteamID64:           76561198012345678

const SCRIPT_DIR = import.meta.dir;
const OUTPUT_FILE = `${SCRIPT_DIR}/stickers.json`;

interface StickerEntry {
  name: string;
  quality: string;
  qty: number;
}

interface ImportResult {
  stickers: StickerEntry[];
  importedFrom: string;
  importedAt: string;
  event: string;
  totalQty: number;
}

// ── Parse CLI args ──────────────────────────────────────────────────
function parseArgs(): { steamInput: string; event: string; cost: number } {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.log(`Usage: bun import-inventory.ts <STEAM_URL_OR_ID> [--event "Budapest 2025"] [--cost 0.35]

Examples:
  bun import-inventory.ts oldm8clint
  bun import-inventory.ts https://steamcommunity.com/id/oldm8clint/
  bun import-inventory.ts 76561198012345678
  bun import-inventory.ts oldm8clint --event "Shanghai 2024" --cost 0.39`);
    process.exit(1);
  }

  let steamInput = args[0];
  let event = "Budapest 2025";
  let cost = 0.35;

  for (let i = 1; i < args.length; i++) {
    if (args[i] === "--event" && args[i + 1]) { event = args[++i]; }
    else if (args[i] === "--cost" && args[i + 1]) { cost = parseFloat(args[++i]); }
  }

  return { steamInput, event, cost };
}

// ── Resolve Steam input to SteamID64 ───────────────────────────────
async function resolveSteamId(input: string): Promise<string> {
  // Strip URL parts if full URL provided
  let vanity = input;
  const idMatch = input.match(/steamcommunity\.com\/id\/([^/]+)/);
  const profileMatch = input.match(/steamcommunity\.com\/profiles\/(\d+)/);

  if (profileMatch) return profileMatch[1]; // Already a SteamID64 URL
  if (idMatch) vanity = idMatch[1];
  if (/^\d{17}$/.test(vanity)) return vanity; // Already a SteamID64

  // Resolve vanity name via XML profile
  console.log(`Resolving vanity name "${vanity}"...`);
  const res = await fetch(`https://steamcommunity.com/id/${vanity}/?xml=1`);
  if (!res.ok) throw new Error(`Failed to fetch profile for "${vanity}" (HTTP ${res.status})`);
  const xml = await res.text();

  const steamIdMatch = xml.match(/<steamID64>(\d+)<\/steamID64>/);
  if (!steamIdMatch) {
    if (xml.includes('<error>')) {
      const errorMatch = xml.match(/<error>(.+?)<\/error>/);
      throw new Error(`Steam error: ${errorMatch?.[1] || 'Unknown error'}`);
    }
    throw new Error(`Could not find SteamID64 for "${vanity}". Profile may not exist.`);
  }

  console.log(`Resolved: ${vanity} -> ${steamIdMatch[1]}`);
  return steamIdMatch[1];
}

// ── Fetch CS2 inventory ────────────────────────────────────────────
interface SteamInventoryAsset {
  classid: string;
  amount: string;
}

interface SteamInventoryDescription {
  classid: string;
  market_hash_name: string;
  type: string;
  tradable: number;
  marketable: number;
  tags?: { category: string; localized_tag_name: string }[];
}

interface SteamInventoryResponse {
  success: number;
  total_inventory_count: number;
  assets?: SteamInventoryAsset[];
  descriptions?: SteamInventoryDescription[];
  last_assetid?: string;
  more_items?: number;
}

async function fetchInventory(steamId64: string): Promise<SteamInventoryDescription[]> {
  const allDescriptions: Map<string, SteamInventoryDescription> = new Map();
  const assetCounts: Map<string, number> = new Map();
  let lastAssetId: string | undefined;
  let page = 0;

  console.log(`Fetching CS2 inventory for ${steamId64}...`);

  while (true) {
    page++;
    let url = `https://steamcommunity.com/inventory/${steamId64}/730/2?l=english&count=5000`;
    if (lastAssetId) url += `&start_assetid=${lastAssetId}`;

    let retries = 3;
    let data: SteamInventoryResponse | null = null;

    while (retries > 0) {
      try {
        const res = await fetch(url);

        if (res.status === 403) {
          throw new Error(
            "Inventory is private! The Steam profile's inventory must be set to public.\n" +
            "To fix: Steam → Profile → Edit Profile → Privacy Settings → Inventory → Public"
          );
        }

        if (res.status === 429) {
          const wait = Math.min(30, 5 * (4 - retries));
          console.log(`  Rate limited, waiting ${wait}s...`);
          await new Promise(r => setTimeout(r, wait * 1000));
          retries--;
          continue;
        }

        if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);

        data = await res.json() as SteamInventoryResponse;
        break;
      } catch (e: any) {
        if (e.message?.includes("private")) throw e;
        retries--;
        if (retries === 0) throw e;
        console.log(`  Retry (${3 - retries}/3): ${e.message}`);
        await new Promise(r => setTimeout(r, 3000));
      }
    }

    if (!data || !data.success) throw new Error("Steam API returned unsuccessful response");

    console.log(`  Page ${page}: ${data.assets?.length || 0} assets (${data.total_inventory_count} total in inventory)`);

    // Count assets by classid
    for (const asset of data.assets || []) {
      const count = assetCounts.get(asset.classid) || 0;
      assetCounts.set(asset.classid, count + parseInt(asset.amount, 10));
    }

    // Store descriptions
    for (const desc of data.descriptions || []) {
      allDescriptions.set(desc.classid, desc);
    }

    if (!data.more_items || !data.last_assetid) break;
    lastAssetId = data.last_assetid;

    // Brief pause between pages to avoid rate limiting
    await new Promise(r => setTimeout(r, 1500));
  }

  // Attach quantity info to descriptions
  const result: (SteamInventoryDescription & { _qty: number })[] = [];
  for (const [classid, desc] of allDescriptions) {
    const qty = assetCounts.get(classid) || 1;
    result.push({ ...desc, _qty: qty });
  }

  return result;
}

// ── Parse sticker names from market_hash_name ──────────────────────
// Format: "Sticker | PlayerName (Quality) | Event Name"
// Or:     "Sticker | PlayerName | Event Name"    (for Normal quality)
// Or:     "Event Name QualityType Sticker Capsule"
const STICKER_REGEX = /^Sticker \| (.+?)( \(([^)]+)\))? \| (.+)$/;
const CAPSULE_REGEX = /^(.+?) (Legends|Challengers|Contenders|Champions) Sticker Capsule$/;

interface ParsedSticker {
  name: string;
  quality: string;
  event: string;
}

function parseStickerName(marketHashName: string): ParsedSticker | null {
  // Try sticker format
  const m = marketHashName.match(STICKER_REGEX);
  if (m) {
    const rawQuality = m[3] || "Normal";
    // Normalize quality names: "Embroidered, Champion" -> "Embroidered (Champion)"
    let quality = rawQuality;
    if (rawQuality === "Champion") quality = "Normal (Champion)";
    else if (rawQuality.includes(", Champion")) quality = rawQuality.replace(", Champion", "") + " (Champion)";
    return { name: m[1], quality, event: m[4] };
  }

  // Try capsule format
  const cm = marketHashName.match(CAPSULE_REGEX);
  if (cm) {
    return { name: cm[2], quality: "Capsule", event: cm[1] };
  }

  return null;
}

// ── Main ───────────────────────────────────────────────────────────
async function main() {
  const { steamInput, event, cost } = parseArgs();

  const steamId64 = await resolveSteamId(steamInput);
  const inventory = await fetchInventory(steamId64);

  // Filter to stickers matching the target event
  const stickerMap = new Map<string, StickerEntry>();
  let matchCount = 0;

  for (const item of inventory) {
    const parsed = parseStickerName(item.market_hash_name);
    if (!parsed) continue;
    if (parsed.event !== event) continue;

    matchCount++;
    const key = `${parsed.name}|||${parsed.quality}`;
    const existing = stickerMap.get(key);
    const qty = (item as any)._qty || 1;

    if (existing) {
      existing.qty += qty;
    } else {
      stickerMap.set(key, { name: parsed.name, quality: parsed.quality, qty });
    }
  }

  if (stickerMap.size === 0) {
    console.log(`\nNo "${event}" stickers found in inventory.`);
    console.log(`Found ${inventory.length} total CS2 items.`);

    // Show what events ARE in the inventory
    const events = new Set<string>();
    for (const item of inventory) {
      const parsed = parseStickerName(item.market_hash_name);
      if (parsed) events.add(parsed.event);
    }
    if (events.size > 0) {
      console.log(`\nSticker events found in inventory:`);
      for (const e of [...events].sort()) console.log(`  - ${e}`);
      console.log(`\nTry: bun import-inventory.ts ${steamInput} --event "${[...events][0]}"`);
    }
    process.exit(1);
  }

  // Sort alphabetically
  const stickers = [...stickerMap.values()].sort((a, b) => {
    const nameCompare = a.name.localeCompare(b.name);
    if (nameCompare !== 0) return nameCompare;
    return a.quality.localeCompare(b.quality);
  });

  const totalQty = stickers.reduce((sum, s) => sum + s.qty, 0);

  // Write stickers.json
  const result: ImportResult = {
    stickers,
    importedFrom: steamId64,
    importedAt: new Date().toISOString(),
    event,
    totalQty,
  };

  await Bun.write(OUTPUT_FILE, JSON.stringify(result, null, 2));
  console.log(`\nImported ${stickers.length} unique sticker types (${totalQty} total) from "${event}"`);
  console.log(`Written to: ${OUTPUT_FILE}`);
  console.log(`Estimated cost: ${totalQty} x $${cost.toFixed(2)} = $${(totalQty * cost).toFixed(2)}\n`);

  // Also print TypeScript array for manual paste
  console.log("// ── TypeScript array (for manual paste into tracker.ts) ──");
  console.log("const stickers: StickerEntry[] = [");
  for (const s of stickers) {
    console.log(`  { name: ${JSON.stringify(s.name)}, quality: ${JSON.stringify(s.quality)}, qty: ${s.qty} },`);
  }
  console.log("];");
}

main().catch((e) => {
  console.error(`\nError: ${e.message}`);
  process.exit(1);
});
