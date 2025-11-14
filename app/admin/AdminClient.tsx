"use client";

import { useEffect, useState } from "react";
import { formatUsd } from "@/lib/format";
import type { ConfigValue } from "@/lib/config";

type Configs = ConfigValue;

type Metrics = {
  totalUsers: number;
  treasuryGold: number;
  transactions: { type: string; total: number; gold: number; usd: number }[];
  adSummary: { total: number; gold: number };
  latestBattles: {
    id: number;
    challenger: string;
    opponent: string;
    outcome: string;
    reward_gold: number;
    created_at: string;
  }[];
};

export default function AdminClient({ initialConfig, initialMetrics }: { initialConfig: Configs; initialMetrics: Metrics }) {
  const [configs, setConfigs] = useState<Configs>(initialConfig);
  const [metrics, setMetrics] = useState<Metrics>(initialMetrics);
  const [status, setStatus] = useState("");

  async function refreshMetrics() {
    const res = await fetch("/api/admin/metrics", { cache: "no-store" });
    const data = await res.json();
    setMetrics(data);
  }

  async function updateConfig(key: keyof Configs, value: unknown) {
    const res = await fetch("/api/admin/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error ?? "Falha ao atualizar configuração");
    }
    setConfigs((prev) => ({ ...prev, [key]: value } as Configs));
    setStatus("Configurações atualizadas.");
  }

  useEffect(() => {
    const interval = setInterval(() => {
      refreshMetrics();
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-12">
      <section className="glass rounded-3xl border border-slate-800/60 p-8">
        <header className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-semibold text-white">Painel Administrativo</h1>
            <p className="text-sm text-slate-400">
              Ajuste taxas de câmbio, limites de anúncios e monitore a economia GOLD.
            </p>
          </div>
          <button
            onClick={refreshMetrics}
            className="rounded-lg border border-emerald-300 px-4 py-2 text-xs font-semibold text-emerald-200 hover:bg-emerald-300/10 transition"
          >
            Atualizar métricas
          </button>
        </header>
        <dl className="grid md:grid-cols-4 gap-5 text-sm text-slate-300">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-4">
            <dt className="text-xs uppercase text-slate-400">Jogadores</dt>
            <dd className="text-2xl font-semibold text-white">{metrics.totalUsers}</dd>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-4">
            <dt className="text-xs uppercase text-slate-400">Tesouraria GOLD</dt>
            <dd className="text-2xl font-semibold text-amber-300">
              {metrics.treasuryGold.toFixed(2)}
            </dd>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-4">
            <dt className="text-xs uppercase text-slate-400">Ads validados</dt>
            <dd className="text-2xl font-semibold text-emerald-300">
              {metrics.adSummary.total}
            </dd>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-4">
            <dt className="text-xs uppercase text-slate-400">GOLD via Ads</dt>
            <dd className="text-2xl font-semibold text-emerald-200">
              {metrics.adSummary.gold.toFixed(2)}
            </dd>
          </div>
        </dl>
      </section>

      <section className="rounded-3xl border border-slate-800/60 bg-slate-950/60 p-8 space-y-8">
        <h2 className="text-xl font-semibold text-white">Economia GOLD</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              updateConfig("gold_buy_rate", configs.gold_buy_rate);
            }}
            className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4"
          >
            <h3 className="text-sm font-semibold text-amber-200">Compra de GOLD</h3>
            <label className="block text-xs uppercase text-slate-400">
              GOLD por USD
              <input
                type="number"
                min={1}
                step={0.1}
                value={configs.gold_buy_rate.goldPerUsd}
                onChange={(e) =>
                  setConfigs((prev) => ({
                    ...prev,
                    gold_buy_rate: {
                      goldPerUsd: Number(e.target.value),
                      usdPerGold: 1 / Number(e.target.value),
                    },
                  }))
                }
                className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-950/70 px-3 py-2 text-sm focus:border-amber-300 focus:outline-none"
              />
            </label>
            <label className="block text-xs uppercase text-slate-400">
              USD por GOLD
              <input
                type="number"
                min={0.01}
                step={0.01}
                value={configs.gold_buy_rate.usdPerGold}
                onChange={(e) =>
                  setConfigs((prev) => ({
                    ...prev,
                    gold_buy_rate: {
                      usdPerGold: Number(e.target.value),
                      goldPerUsd: Number((1 / Number(e.target.value)).toFixed(2)),
                    },
                  }))
                }
                className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-950/70 px-3 py-2 text-sm focus:border-amber-300 focus:outline-none"
              />
            </label>
            <button
              type="submit"
              className="rounded-lg bg-amber-300 px-4 py-2 text-xs font-semibold text-slate-900 hover:bg-amber-200 transition"
            >
              Salvar cotação
            </button>
          </form>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              updateConfig("gold_sell_rate", configs.gold_sell_rate);
            }}
            className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4"
          >
            <h3 className="text-sm font-semibold text-emerald-200">Saque de GOLD</h3>
            <label className="block text-xs uppercase text-slate-400">
              GOLD por USD
              <input
                type="number"
                min={1}
                step={0.1}
                value={configs.gold_sell_rate.goldPerUsd}
                onChange={(e) =>
                  setConfigs((prev) => ({
                    ...prev,
                    gold_sell_rate: {
                      goldPerUsd: Number(e.target.value),
                      usdPerGold: 1 / Number(e.target.value),
                    },
                  }))
                }
                className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-950/70 px-3 py-2 text-sm focus:border-emerald-300 focus:outline-none"
              />
            </label>
            <label className="block text-xs uppercase text-slate-400">
              USD por GOLD
              <input
                type="number"
                min={0.01}
                step={0.01}
                value={configs.gold_sell_rate.usdPerGold}
                onChange={(e) =>
                  setConfigs((prev) => ({
                    ...prev,
                    gold_sell_rate: {
                      usdPerGold: Number(e.target.value),
                      goldPerUsd: Number((1 / Number(e.target.value)).toFixed(2)),
                    },
                  }))
                }
                className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-950/70 px-3 py-2 text-sm focus:border-emerald-300 focus:outline-none"
              />
            </label>
            <button
              type="submit"
              className="rounded-lg bg-emerald-300 px-4 py-2 text-xs font-semibold text-slate-900 hover:bg-emerald-200 transition"
            >
              Salvar cotação
            </button>
          </form>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            updateConfig("daily_ad_limit", configs.daily_ad_limit);
          }}
          className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4"
        >
          <h3 className="text-sm font-semibold text-cyan-200">
            Limite diário de anúncios recompensados
          </h3>
          <label className="block text-xs uppercase text-slate-400">
            Visualizações por jogador
            <input
              type="number"
              min={1}
              value={configs.daily_ad_limit.limit}
              onChange={(e) =>
                setConfigs((prev) => ({
                  ...prev,
                  daily_ad_limit: { limit: Number(e.target.value) },
                }))
              }
              className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-950/70 px-3 py-2 text-sm focus:border-cyan-300 focus:outline-none"
            />
          </label>
          <button
            type="submit"
            className="rounded-lg bg-cyan-300 px-4 py-2 text-xs font-semibold text-slate-900 hover:bg-cyan-200 transition"
          >
            Atualizar limite
          </button>
        </form>
      </section>

      <section className="rounded-3xl border border-slate-800/60 bg-slate-950/60 p-8 space-y-6">
        <h2 className="text-xl font-semibold text-white">Últimas transações</h2>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-slate-200">
          {metrics.transactions.map((item) => (
            <article
              key={item.type}
              className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4"
            >
              <header className="flex items-center justify-between text-xs uppercase text-slate-400">
                <span>{item.type}</span>
                <span>{item.total} eventos</span>
              </header>
              <p className="mt-2 text-lg font-semibold text-amber-200">
                {item.gold.toFixed(2)} GOLD
              </p>
              <p className="text-xs text-slate-500">
                {formatUsd(item.usd ?? 0)}
              </p>
            </article>
          ))}
        </div>

        <div>
          <h3 className="text-sm font-semibold text-white mb-3">
            Batalhas recentes
          </h3>
          <div className="grid gap-3">
            {metrics.latestBattles.map((battle) => (
              <article
                key={battle.id}
                className="rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-xs text-slate-300"
              >
                <p>
                  <span className="text-emerald-200">{battle.challenger}</span> vs{" "}
                  <span className="text-rose-200">{battle.opponent}</span> —{" "}
                  <span className="text-amber-200">{battle.reward_gold} GOLD</span>
                </p>
                <p className="text-slate-500">
                  {new Date(battle.created_at).toLocaleString("pt-BR")} • Resultado:{" "}
                  {battle.outcome}
                </p>
              </article>
            ))}
            {!metrics.latestBattles.length && (
              <p className="text-xs text-slate-500">
                Nenhuma batalha registrada nas últimas 24h.
              </p>
            )}
          </div>
        </div>
      </section>
      {status && (
        <p className="text-xs text-slate-300 border border-slate-700 rounded-lg px-3 py-2 bg-slate-900/70">
          {status}
        </p>
      )}
    </div>
  );
}
