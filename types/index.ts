export type User = {
  id: number;
  username: string;
  wallet_address: string | null;
  gold_balance: number;
  energy: number;
  created_at: string;
};

export type NFT = {
  id: number;
  user_id: number;
  name: string;
  rarity: "common" | "rare" | "epic" | "legendary" | "mythic";
  farm_rate: number;
  power: number;
  created_at: string;
};

export type Transaction = {
  id: number;
  type: string;
  amount_gold: number;
  amount_usd: number;
  metadata: string | null;
  created_at: string;
};
