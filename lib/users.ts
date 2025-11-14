import db from "@/lib/db";
import { usdFromGold } from "@/lib/gold";

export type User = {
  id: number;
  username: string;
  wallet_address: string | null;
  gold_balance: number;
  energy: number;
  created_at: string;
};

export function listUsers(): User[] {
  return db.prepare("SELECT * FROM users ORDER BY created_at DESC").all() as User[];
}

export function getUserById(id: number): User | undefined {
  return db.prepare("SELECT * FROM users WHERE id = ?").get(id) as User | undefined;
}

export function createUser(username: string, wallet?: string): User {
  const result = db
    .prepare(
      "INSERT INTO users (username, wallet_address, gold_balance, energy) VALUES (?, ?, 100, 100)"
    )
    .run(username, wallet ?? null);

  const tx = db
    .prepare(
      "INSERT INTO transactions (user_id, type, amount_gold, amount_usd, metadata) VALUES (?, 'signup_bonus', ?, ?, ?)"
    )
    .run(
      result.lastInsertRowid,
      100,
      usdFromGold(100, "buy").usd,
      JSON.stringify({ reason: "Signup bonus" })
    );

  if (!tx) {
    throw new Error("Failed to create initial transaction");
  }

  return getUserById(Number(result.lastInsertRowid)) as User;
}

export function adjustUserGold(
  userId: number,
  goldDelta: number,
  type: string,
  metadata: Record<string, unknown>
): User {
  const user = getUserById(userId);
  if (!user) throw new Error("User not found");

  const newBalance = user.gold_balance + goldDelta;
  if (newBalance < 0) throw new Error("Insufficient GOLD");

  const usdInfo = usdFromGold(Math.abs(goldDelta), goldDelta >= 0 ? "buy" : "sell");

  db.prepare("UPDATE users SET gold_balance = ? WHERE id = ?").run(newBalance, userId);

  db.prepare(
    "INSERT INTO transactions (user_id, type, amount_gold, amount_usd, metadata) VALUES (?, ?, ?, ?, ?)"
  ).run(
    userId,
    type,
    goldDelta,
    goldDelta >= 0 ? usdInfo.usd : -usdInfo.usd,
    JSON.stringify(metadata)
  );

  return getUserById(userId) as User;
}

export function updateUserEnergy(userId: number, delta: number): User {
  const user = getUserById(userId);
  if (!user) throw new Error("User not found");

  const newEnergy = Math.max(0, user.energy + delta);
  db.prepare("UPDATE users SET energy = ? WHERE id = ?").run(newEnergy, userId);

  return getUserById(userId) as User;
}
