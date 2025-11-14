import db from "@/lib/db";

export type GoldUsd = {
  gold: number;
  usd: number;
};

export type GoldRates = {
  buy: {
    goldPerUsd: number;
    usdPerGold: number;
  };
  sell: {
    goldPerUsd: number;
    usdPerGold: number;
  };
};

export function getGoldRates(): GoldRates {
  const buyRaw = db
    .prepare("SELECT value FROM configs WHERE key = 'gold_buy_rate'")
    .get() as { value: string };
  const sellRaw = db
    .prepare("SELECT value FROM configs WHERE key = 'gold_sell_rate'")
    .get() as { value: string };

  const buy = buyRaw ? JSON.parse(buyRaw.value) : { goldPerUsd: 10, usdPerGold: 0.1 };
  const sell = sellRaw
    ? JSON.parse(sellRaw.value)
    : { goldPerUsd: 20, usdPerGold: 0.05 };

  return { buy, sell };
}

export function usdFromGold(
  gold: number,
  direction: "buy" | "sell",
  rates = getGoldRates()
): GoldUsd {
  const rate = direction === "buy" ? rates.buy : rates.sell;
  return {
    gold,
    usd: parseFloat((gold * rate.usdPerGold).toFixed(2))
  };
}

export function goldFromUsd(
  usd: number,
  direction: "buy" | "sell",
  rates = getGoldRates()
): GoldUsd {
  const rate = direction === "buy" ? rates.buy : rates.sell;
  return {
    gold: parseFloat((usd * rate.goldPerUsd).toFixed(2)),
    usd
  };
}
