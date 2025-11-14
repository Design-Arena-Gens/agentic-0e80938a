import db from "@/lib/db";
import { adjustUserGold } from "@/lib/users";
import { usdFromGold } from "@/lib/gold";

export type Rarity = "common" | "rare" | "epic" | "legendary" | "mythic";

export type NFT = {
  id: number;
  user_id: number;
  name: string;
  rarity: Rarity;
  farm_rate: number;
  power: number;
  created_at: string;
};

const RARITY_CONFIG: Record<Rarity, { farmMultiplier: number; power: number }> = {
  common: { farmMultiplier: 1, power: 10 },
  rare: { farmMultiplier: 1.5, power: 25 },
  epic: { farmMultiplier: 2.5, power: 60 },
  legendary: { farmMultiplier: 4, power: 120 },
  mythic: { farmMultiplier: 6, power: 220 }
};

export function listNFTsByUser(userId: number): NFT[] {
  return db
    .prepare("SELECT * FROM nfts WHERE user_id = ? ORDER BY created_at DESC")
    .all(userId) as NFT[];
}

export function mintNFT(userId: number, name: string, rarity: Rarity, costGold: number) {
  adjustUserGold(userId, -costGold, "buy_nft", { rarity, name });
  const baseRate = 5;
  const multiplier = RARITY_CONFIG[rarity].farmMultiplier;
  const farmRate = parseFloat((baseRate * multiplier).toFixed(2));

  const result = db
    .prepare(
      "INSERT INTO nfts (user_id, name, rarity, farm_rate, power) VALUES (?, ?, ?, ?, ?)"
    )
    .run(userId, name, rarity, farmRate, RARITY_CONFIG[rarity].power);

  return db
    .prepare("SELECT * FROM nfts WHERE id = ?")
    .get(result.lastInsertRowid) as NFT;
}

export function calculatePassiveFarm(userId: number) {
  const nfts = listNFTsByUser(userId);
  let total = 0;
  const breakdown = nfts.map((nft) => {
    const earned = nft.farm_rate;
    total += earned;
    return {
      id: nft.id,
      name: nft.name,
      rarity: nft.rarity,
      earned
    };
  });

  const rewardUsd = usdFromGold(total, "sell");

  db.prepare(
    "INSERT INTO farm_events (user_id, total_gold, total_usd, multiplier, nft_snapshot) VALUES (?, ?, ?, ?, ?)"
  ).run(
    userId,
    total,
    rewardUsd.usd,
    1,
    JSON.stringify(
      breakdown.map((item) => ({
        nftId: item.id,
        earned: item.earned
      }))
    )
  );

  adjustUserGold(userId, total, "farm_reward", { breakdown });

  return { total, usd: rewardUsd.usd, breakdown };
}

export function nftPowerScore(userId: number) {
  const nfts = listNFTsByUser(userId);
  return nfts.reduce((acc, nft) => acc + nft.power, 0);
}
