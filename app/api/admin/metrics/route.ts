import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  const totalUsers = db.prepare("SELECT COUNT(*) as total FROM users").get() as {
    total: number;
  };

  const treasury = db
    .prepare("SELECT SUM(gold_balance) as gold FROM users")
    .get() as { gold: number | null };

  const transactions = db
    .prepare(
      "SELECT type, COUNT(*) as total, SUM(amount_gold) as gold, SUM(amount_usd) as usd FROM transactions GROUP BY type ORDER BY created_at DESC LIMIT 20"
    )
    .all() as { type: string; total: number; gold: number; usd: number }[];

  const adSummary = db
    .prepare(
      "SELECT COUNT(*) as total, SUM(amount_gold) as gold FROM ad_sessions WHERE completed = 1"
    )
    .get() as { total: number | null; gold: number | null };

  const latestBattles = db
    .prepare(
      `SELECT b.id, b.reward_gold, b.outcome, b.created_at,
        c.username as challenger, o.username as opponent
       FROM battles b
       JOIN users c ON c.id = b.challenger_id
       JOIN users o ON o.id = b.opponent_id
       ORDER BY b.created_at DESC LIMIT 5`
    )
    .all();

  return NextResponse.json({
    totalUsers: totalUsers.total ?? 0,
    treasuryGold: treasury.gold ?? 0,
    transactions,
    adSummary: {
      total: adSummary.total ?? 0,
      gold: adSummary.gold ?? 0,
    },
    latestBattles,
  });
}
