import db from "@/lib/db";

export type ConfigValue = {
  gold_buy_rate: { goldPerUsd: number; usdPerGold: number };
  gold_sell_rate: { goldPerUsd: number; usdPerGold: number };
  daily_ad_limit: { limit: number };
  ad_providers: { name: string; id: string }[];
};

export function getConfig<T = unknown>(key: keyof ConfigValue): T {
  const row = db.prepare("SELECT value FROM configs WHERE key = ?").get(key) as
    | { value: string }
    | undefined;
  if (!row) throw new Error(`Missing config ${key}`);
  return JSON.parse(row.value) as T;
}

export function setConfig(key: keyof ConfigValue, value: unknown) {
  db.prepare(
    "INSERT INTO configs (key, value, updated_at) VALUES (?, ?, datetime('now')) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at"
  ).run(key, JSON.stringify(value));
}

export function listConfigs(): Record<string, unknown> {
  const rows = db.prepare("SELECT key, value FROM configs").all() as {
    key: string;
    value: string;
  }[];
  return rows.reduce<Record<string, unknown>>((acc, row) => {
    acc[row.key] = JSON.parse(row.value);
    return acc;
  }, {});
}
