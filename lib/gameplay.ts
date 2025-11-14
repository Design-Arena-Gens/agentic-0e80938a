import db from "@/lib/db";
import { adjustUserGold, getUserById } from "@/lib/users";
import { usdFromGold } from "@/lib/gold";
import { nftPowerScore } from "@/lib/nfts";

export type BattleResult = {
  winnerId: number;
  rewardGold: number;
  rewardUsd: number;
  outcome: "win" | "lose";
};

export function enterBattle(challengerId: number, opponentId: number, entryGold: number) {
  if (challengerId === opponentId) throw new Error("Cannot battle yourself");

  const challenger = getUserById(challengerId);
  const opponent = getUserById(opponentId);
  if (!challenger || !opponent) throw new Error("Invalid users");

  adjustUserGold(challengerId, -entryGold, "battle_entry", { opponentId });
  adjustUserGold(opponentId, -entryGold, "battle_entry", { challengerId });

  const challengerPower = nftPowerScore(challengerId) + challenger.energy;
  const opponentPower = nftPowerScore(opponentId) + opponent.energy;

  const total = challengerPower + opponentPower || 1;
  const challengerChance = challengerPower / total;

  const random = Math.random();
  const winnerId = random < challengerChance ? challengerId : opponentId;
  const loserId = winnerId === challengerId ? opponentId : challengerId;

  const rewardGold = entryGold * 2;
  const rewardUsd = usdFromGold(rewardGold, "sell").usd;

  adjustUserGold(winnerId, rewardGold, "battle_reward", { loserId });
  const outcomeForChallenger = winnerId === challengerId ? "win" : "lose";

  db.prepare(
    "INSERT INTO battles (challenger_id, opponent_id, entry_gold, entry_usd, reward_gold, reward_usd, outcome) VALUES (?, ?, ?, ?, ?, ?, ?)"
  ).run(
    challengerId,
    opponentId,
    entryGold,
    usdFromGold(entryGold, "buy").usd,
    rewardGold,
    rewardUsd,
    outcomeForChallenger
  );

  return { winnerId, rewardGold, rewardUsd, outcome: outcomeForChallenger as "win" | "lose" };
}

export function purchaseEnergy(userId: number, goldCost: number, energyAmount: number) {
  adjustUserGold(userId, -goldCost, "buy_energy", { energy: energyAmount });
  db.prepare("UPDATE users SET energy = energy + ? WHERE id = ?").run(energyAmount, userId);
  return {
    energy: energyAmount,
    cost: {
      gold: goldCost,
      usd: usdFromGold(goldCost, "buy").usd
    }
  };
}

export function purchaseBoost(userId: number, goldCost: number, kind: string, durationHours = 24) {
  adjustUserGold(userId, -goldCost, "buy_boost", { kind, durationHours });
  const expiresAt = new Date(Date.now() + durationHours * 3600 * 1000).toISOString();
  db.prepare(
    "INSERT INTO boosts (user_id, kind, amount_gold, amount_usd, expires_at) VALUES (?, ?, ?, ?, ?)"
  ).run(userId, kind, goldCost, usdFromGold(goldCost, "buy").usd, expiresAt);
  return { kind, expiresAt };
}

export function purchaseCosmetic(userId: number, goldCost: number, itemName: string) {
  adjustUserGold(userId, -goldCost, "buy_cosmetic", { itemName });
  db.prepare(
    "INSERT INTO cosmetics (user_id, item_name, amount_gold, amount_usd) VALUES (?, ?, ?, ?)"
  ).run(userId, itemName, goldCost, usdFromGold(goldCost, "buy").usd);
  return { itemName };
}

export function purchaseBox(userId: number, goldCost: number, boxType: string) {
  adjustUserGold(userId, -goldCost, "buy_box", { boxType });
  const rewardTypes = ["common", "rare", "epic", "legendary"];
  const reward =
    rewardTypes[Math.floor(Math.random() * rewardTypes.length)] ?? "common";

  db.prepare(
    "INSERT INTO boxes (user_id, box_type, amount_gold, amount_usd, reward) VALUES (?, ?, ?, ?, ?)"
  ).run(userId, boxType, goldCost, usdFromGold(goldCost, "buy").usd, reward);

  return { reward, boxType };
}
