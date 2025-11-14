import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const dbFile = path.join(process.cwd(), "data", "game.sqlite");

if (!fs.existsSync(path.dirname(dbFile))) {
  fs.mkdirSync(path.dirname(dbFile), { recursive: true });
}

const db = new Database(dbFile);

db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    wallet_address TEXT UNIQUE,
    gold_balance REAL NOT NULL DEFAULT 0,
    energy INTEGER NOT NULL DEFAULT 100,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS nfts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    rarity TEXT NOT NULL,
    farm_rate REAL NOT NULL DEFAULT 0,
    power INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    amount_gold REAL NOT NULL,
    amount_usd REAL NOT NULL,
    metadata TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS configs (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS ad_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    provider TEXT NOT NULL,
    token TEXT NOT NULL,
    amount_gold REAL NOT NULL,
    amount_usd REAL NOT NULL,
    completed INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    completed_at TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS farm_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    total_gold REAL NOT NULL,
    total_usd REAL NOT NULL,
    multiplier REAL NOT NULL DEFAULT 1,
    nft_snapshot TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS boosts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    kind TEXT NOT NULL,
    amount_gold REAL NOT NULL,
    amount_usd REAL NOT NULL,
    expires_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS cosmetics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    item_name TEXT NOT NULL,
    amount_gold REAL NOT NULL,
    amount_usd REAL NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS battles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    challenger_id INTEGER NOT NULL,
    opponent_id INTEGER NOT NULL,
    entry_gold REAL NOT NULL,
    entry_usd REAL NOT NULL,
    reward_gold REAL NOT NULL,
    reward_usd REAL NOT NULL,
    outcome TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY(challenger_id) REFERENCES users(id),
    FOREIGN KEY(opponent_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS boxes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    box_type TEXT NOT NULL,
    amount_gold REAL NOT NULL,
    amount_usd REAL NOT NULL,
    reward TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
`);

const DEFAULT_CONFIGS: Record<string, string> = {
  gold_buy_rate: JSON.stringify({ goldPerUsd: 10, usdPerGold: 0.1 }),
  gold_sell_rate: JSON.stringify({ goldPerUsd: 20, usdPerGold: 0.05 }),
  daily_ad_limit: JSON.stringify({ limit: 5 }),
  ad_providers: JSON.stringify([
    { name: "Unity Ads", id: "unity" },
    { name: "AdMob", id: "admob" },
    { name: "AppLovin", id: "applovin" },
    { name: "IronSource", id: "ironsource" }
  ])
};

for (const [key, value] of Object.entries(DEFAULT_CONFIGS)) {
  const existing = db.prepare("SELECT key FROM configs WHERE key = ?").get(key);
  if (!existing) {
    db.prepare(
      "INSERT INTO configs (key, value, updated_at) VALUES (?, ?, datetime('now'))"
    ).run(key, value);
  }
}

export default db;
