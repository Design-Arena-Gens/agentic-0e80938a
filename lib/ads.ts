import crypto from "crypto";
import db from "@/lib/db";
import { adjustUserGold } from "@/lib/users";
import { usdFromGold } from "@/lib/gold";

export type AdToken = {
  token: string;
  expiresAt: number;
  goldReward: number;
  provider: string;
};

export function getDailyAdLimit(): number {
  const raw = db
    .prepare("SELECT value FROM configs WHERE key = 'daily_ad_limit'")
    .get() as { value: string } | undefined;
  if (!raw) return 5;
  return JSON.parse(raw.value).limit ?? 5;
}

export function getWatchedAdsToday(userId: number): number {
  const result = db
    .prepare(
      "SELECT COUNT(*) as total FROM ad_sessions WHERE user_id = ? AND completed = 1 AND date(completed_at) = date('now')"
    )
    .get(userId) as { total: number };
  return result?.total ?? 0;
}

export function createAdToken(userId: number, provider: string, goldReward = 10): AdToken {
  const limit = getDailyAdLimit();
  const watched = getWatchedAdsToday(userId);
  if (watched >= limit) {
    throw new Error("Daily ad limit reached");
  }

  const token = crypto.randomBytes(16).toString("hex");
  const expiresAt = Date.now() + 1000 * 60 * 5;
  const usdReward = usdFromGold(goldReward, "buy").usd;

  db.prepare(
    "INSERT INTO ad_sessions (user_id, provider, token, amount_gold, amount_usd) VALUES (?, ?, ?, ?, ?)"
  ).run(userId, provider, token, goldReward, usdReward);

  return { token, expiresAt, goldReward, provider };
}

export function redeemAdToken(userId: number, token: string) {
  const session = db
    .prepare(
      "SELECT * FROM ad_sessions WHERE token = ? AND user_id = ? AND completed = 0"
    )
    .get(token, userId) as
    | {
        id: number;
        user_id: number;
        amount_gold: number;
        amount_usd: number;
        provider: string;
      }
    | undefined;

  if (!session) {
    throw new Error("Invalid token");
  }

  db.prepare(
    "UPDATE ad_sessions SET completed = 1, completed_at = datetime('now') WHERE id = ?"
  ).run(session.id);

  adjustUserGold(userId, session.amount_gold, "ad_reward", {
    provider: session.provider,
    token
  });

  return {
    gold: session.amount_gold,
    usd: session.amount_usd
  };
}
