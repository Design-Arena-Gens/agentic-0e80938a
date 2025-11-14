import AdminClient from "./AdminClient";
import { listConfigs, type ConfigValue } from "@/lib/config";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

import db from "@/lib/db";

function getMetrics() {
  const totalUsers = db.prepare("SELECT COUNT(*) as total FROM users").get() as {
    total: number;
  };
  const treasury = db.prepare("SELECT SUM(gold_balance) as gold FROM users").get() as {
    gold: number | null;
  };
  const transactions = db
    .prepare(
      "SELECT type, COUNT(*) as total, SUM(amount_gold) as gold, SUM(amount_usd) as usd FROM transactions GROUP BY type ORDER BY type"
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
    .all() as {
      id: number;
      reward_gold: number;
      outcome: string;
      created_at: string;
      challenger: string;
      opponent: string;
    }[];

  return {
    totalUsers: totalUsers.total ?? 0,
    treasuryGold: treasury.gold ?? 0,
    transactions,
    adSummary: {
      total: adSummary.total ?? 0,
      gold: adSummary.gold ?? 0,
    },
    latestBattles,
  };
}

const getCachedMetrics = cache(getMetrics);

const ADMIN_TOKEN = process.env.ADMIN_TOKEN ?? "admin123";

export default async function AdminPage() {
  const headersList = await headers();
  const token = headersList.get("x-admin-token");

  if (token && token !== ADMIN_TOKEN) {
    redirect("/");
  }

  const configs = listConfigs() as ConfigValue;

  return <AdminClient initialConfig={configs} initialMetrics={getCachedMetrics()} />;
}
