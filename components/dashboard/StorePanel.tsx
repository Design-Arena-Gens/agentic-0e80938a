"use client";

import { useState } from "react";

type Props = {
  userId: number;
  onUpdate?: () => void;
};

export default function StorePanel({ userId, onUpdate }: Props) {
  const [status, setStatus] = useState("");

  async function post(path: string, payload: unknown) {
    const res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Falha na compra");
    return data;
  }

  async function buyEnergy() {
    try {
      const data = await post("/api/store/energy", {
        userId,
        goldCost: 15,
        energyAmount: 35,
      });
      setStatus(
        `Energia comprada: +${data.purchase.energy} energia por ${data.purchase.cost.gold} GOLD`
      );
      onUpdate?.();
    } catch (error) {
      setStatus((error as Error).message);
    }
  }

  async function buyBoost(kind: string, cost: number) {
    try {
      const data = await post("/api/store/boost", {
        userId,
        goldCost: cost,
        kind,
        durationHours: 24,
      });
      setStatus(`Boost ${data.boost.kind} ativo até ${new Date(data.boost.expiresAt).toLocaleString("pt-BR")}`);
      onUpdate?.();
    } catch (error) {
      setStatus((error as Error).message);
    }
  }

  async function buyCosmetic(itemName: string, cost: number) {
    try {
      const data = await post("/api/store/cosmetic", {
        userId,
        goldCost: cost,
        itemName,
      });
      setStatus(`Item cosmético adquirido: ${data.cosmetic.itemName}`);
      onUpdate?.();
    } catch (error) {
      setStatus((error as Error).message);
    }
  }

  async function buyBox(boxType: string, cost: number) {
    try {
      const data = await post("/api/store/box", {
        userId,
        goldCost: cost,
        boxType,
      });
      setStatus(`Box ${data.box.boxType} aberta! Recompensa: ${data.box.reward}`);
      onUpdate?.();
    } catch (error) {
      setStatus((error as Error).message);
    }
  }

  return (
    <section className="rounded-3xl border border-slate-800/60 bg-slate-950/60 p-6 space-y-6">
      <header>
        <h3 className="text-lg font-semibold text-white">Loja Eldora</h3>
        <p className="text-xs text-slate-400">
          Energia, boosts, caixas e itens cosméticos comprados com GOLD.
        </p>
      </header>
      <div className="grid md:grid-cols-2 gap-4">
        <article className="rounded-2xl border border-emerald-400/40 bg-emerald-400/10 p-5">
          <h4 className="text-sm font-semibold text-emerald-100">Energia Recarregável</h4>
          <p className="text-xs text-emerald-50/80 mt-2">
            +35 energia instantânea para seguir farmando e batalhando.
          </p>
          <button
            onClick={buyEnergy}
            className="mt-4 rounded-lg bg-emerald-300 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-200 transition"
          >
            Comprar por 15 GOLD
          </button>
        </article>
        <article className="rounded-2xl border border-purple-400/40 bg-purple-500/10 p-5">
          <h4 className="text-sm font-semibold text-purple-100">Boost diário</h4>
          <p className="text-xs text-purple-50/80 mt-2">
            Multiplica o farm em 1.5x durante 24 horas.
          </p>
          <button
            onClick={() => buyBoost("farm_boost", 40)}
            className="mt-4 rounded-lg bg-purple-300 px-4 py-2 text-xs font-semibold text-slate-900 hover:bg-purple-200 transition"
          >
            Ativar por 40 GOLD
          </button>
        </article>
        <article className="rounded-2xl border border-cyan-400/40 bg-cyan-500/10 p-5">
          <h4 className="text-sm font-semibold text-cyan-100">Box mística</h4>
          <p className="text-xs text-cyan-50/80 mt-2">
            Receba um NFT de raridades entre comum e lendário.
          </p>
          <button
            onClick={() => buyBox("mystic", 60)}
            className="mt-4 rounded-lg bg-cyan-300 px-4 py-2 text-xs font-semibold text-slate-900 hover:bg-cyan-200 transition"
          >
            Abrir por 60 GOLD
          </button>
        </article>
        <article className="rounded-2xl border border-amber-400/40 bg-amber-500/10 p-5">
          <h4 className="text-sm font-semibold text-amber-100">Item cosmético</h4>
          <p className="text-xs text-amber-50/80 mt-2">
            Personalize o avatar com a capa Aurora Flame.
          </p>
          <button
            onClick={() => buyCosmetic("Aurora Flame", 25)}
            className="mt-4 rounded-lg bg-amber-300 px-4 py-2 text-xs font-semibold text-slate-900 hover:bg-amber-200 transition"
          >
            Comprar por 25 GOLD
          </button>
        </article>
      </div>
      {status && (
        <p className="text-xs text-slate-300 border border-slate-700 rounded-lg px-3 py-2 bg-slate-900/70">
          {status}
        </p>
      )}
    </section>
  );
}
