"use client";

import { useCallback, useEffect, useState } from "react";
import { NFT } from "@/types";
import { formatGold, formatUsd } from "@/lib/format";

type Props = {
  userId: number;
  onUpdate?: () => void;
};

const rarityColors: Record<NFT["rarity"], string> = {
  common: "text-slate-200 border-slate-700",
  rare: "text-sky-200 border-sky-500/40",
  epic: "text-purple-200 border-purple-500/40",
  legendary: "text-amber-200 border-amber-500/60",
  mythic: "text-rose-200 border-rose-500/60",
};

export default function FarmPanel({ userId, onUpdate }: Props) {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(false);
  const [farming, setFarming] = useState(false);
  const [minting, setMinting] = useState(false);
  const [mintName, setMintName] = useState("");
  const [rarity, setRarity] = useState<NFT["rarity"]>("common");
  const [cost, setCost] = useState(50);

  const loadNfts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/users/${userId}/nfts`, { cache: "no-store" });
      const data = await res.json();
      setNfts(data.nfts ?? []);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  async function handleFarm() {
    setFarming(true);
    try {
      const res = await fetch(`/api/users/${userId}/farm`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error ?? "Falha ao farmar");
      } else {
        alert(`Farm concluído: ${formatGold(data.farm.total)} (${formatUsd(data.farm.usd)})`);
        await loadNfts();
        onUpdate?.();
      }
    } finally {
      setFarming(false);
    }
  }

  async function handleMint(e: React.FormEvent) {
    e.preventDefault();
    if (!mintName) return;
    setMinting(true);
    try {
      const res = await fetch(`/api/users/${userId}/nfts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: mintName, rarity, costGold: cost }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error ?? "Falha ao cunhar NFT");
      } else {
        setMintName("");
        await loadNfts();
        onUpdate?.();
      }
    } finally {
      setMinting(false);
    }
  }

  useEffect(() => {
    loadNfts();
  }, [loadNfts]);

  return (
    <section className="rounded-3xl border border-slate-800/60 bg-slate-950/60 p-6 space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white">Farm de NFTs</h3>
          <p className="text-xs text-slate-400">
            O rendimento diário depende da raridade total da coleção.
          </p>
        </div>
        <button
          onClick={handleFarm}
          disabled={farming}
          className="rounded-lg bg-emerald-400/90 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-300 transition disabled:opacity-60"
        >
          {farming ? "Calculando..." : "Coletar Farm"}
        </button>
      </header>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {nfts.map((nft) => (
          <article
            key={nft.id}
            className={`rounded-2xl border px-4 py-4 bg-slate-900/60 ${rarityColors[nft.rarity]}`}
          >
            <header className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest">{nft.rarity}</span>
              <span className="text-xs text-slate-400">
                {new Date(nft.created_at).toLocaleDateString("pt-BR")}
              </span>
            </header>
            <h4 className="mt-2 text-lg font-semibold text-white">{nft.name}</h4>
            <p className="text-xs text-slate-400 mt-2">
              Farm diário: {formatGold(nft.farm_rate)} • Power {nft.power}
            </p>
          </article>
        ))}
        {!nfts.length && !loading && (
          <p className="text-sm text-slate-500">
            Nenhum NFT ainda. Use o formulário para comprar o primeiro.
          </p>
        )}
      </div>
      {loading && <p className="text-xs text-slate-500">Carregando coleção...</p>}

      <form
        onSubmit={handleMint}
        className="grid md:grid-cols-4 gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4"
      >
        <div className="flex flex-col gap-2">
          <label className="text-xs uppercase text-slate-400">Nome</label>
          <input
            value={mintName}
            onChange={(e) => setMintName(e.target.value)}
            placeholder="Guardião Solar"
            className="rounded-lg border border-slate-800 bg-slate-950/70 px-3 py-2 text-sm focus:border-amber-300 focus:outline-none"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs uppercase text-slate-400">Raridade</label>
          <select
            value={rarity}
            onChange={(e) => setRarity(e.target.value as NFT["rarity"])}
            className="rounded-lg border border-slate-800 bg-slate-950/70 px-3 py-2 text-sm focus:border-amber-300 focus:outline-none"
          >
            <option value="common">Common</option>
            <option value="rare">Rare</option>
            <option value="epic">Epic</option>
            <option value="legendary">Legendary</option>
            <option value="mythic">Mythic</option>
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs uppercase text-slate-400">Custo (GOLD)</label>
          <input
            type="number"
            value={cost}
            min={10}
            onChange={(e) => setCost(Number(e.target.value))}
            className="rounded-lg border border-slate-800 bg-slate-950/70 px-3 py-2 text-sm focus:border-amber-300 focus:outline-none"
          />
        </div>
        <div className="flex flex-col justify-end">
          <button
            type="submit"
            disabled={minting}
            className="rounded-lg bg-amber-400/90 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-300 transition disabled:opacity-60"
          >
            {minting ? "Processando..." : "Comprar NFT"}
          </button>
        </div>
      </form>
    </section>
  );
}
