"use client";

import { useEffect, useState } from "react";
import { formatGold } from "@/lib/format";

type Props = {
  userId: number;
  onUpdate?: () => void;
};

type TokenResponse = {
  token: string;
  goldReward: number;
  provider: string;
  expiresAt: number;
};

export default function AdsPanel({ userId, onUpdate }: Props) {
  const [providers, setProviders] = useState<{ id: string; name: string }[]>([]);
  const [selectedProvider, setSelectedProvider] = useState("unity");
  const [reward, setReward] = useState(10);
  const [token, setToken] = useState<TokenResponse | null>(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    fetch("/api/admin/config")
      .then((res) => res.json())
      .then((data) => {
        const list = data.configs?.ad_providers ?? [];
        setProviders(list);
        if (list.length) setSelectedProvider(list[0].id);
      });
  }, []);

  async function handleRequestToken() {
    setStatus("Gerando token...");
    const res = await fetch(`/api/users/${userId}/ads/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider: selectedProvider, goldReward: reward }),
    });
    const data = await res.json();
    if (!res.ok) {
      setStatus(data.error ?? "Falha ao solicitar token.");
      setToken(null);
    } else {
      setToken(data.token);
      setStatus("Token gerado. Assista ao anúncio até o fim!");
    }
  }

  async function handleRedeem() {
    if (!token) return;
    setStatus("Validando anúncio...");
    const res = await fetch(`/api/users/${userId}/ads/redeem`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: token.token }),
    });
    const data = await res.json();
    if (!res.ok) {
      setStatus(data.error ?? "Falha na validação.");
    } else {
      setStatus(
        `Recompensa creditada: ${formatGold(data.reward.gold)} (${data.reward.usd.toFixed(2)} USD)`
      );
      setToken(null);
      onUpdate?.();
    }
  }

  return (
    <section className="rounded-3xl border border-slate-800/60 bg-slate-950/60 p-6 space-y-6">
      <header>
        <h3 className="text-lg font-semibold text-white">Anúncios Recompensados</h3>
        <p className="text-xs text-slate-400">
          Gere um token único, assista o anúncio completo e valide para receber GOLD.
        </p>
      </header>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-xs uppercase text-slate-400">Ad Network</label>
          <select
            value={selectedProvider}
            onChange={(e) => setSelectedProvider(e.target.value)}
            className="rounded-lg border border-slate-800 bg-slate-950/70 px-3 py-2 text-sm focus:border-emerald-300 focus:outline-none"
          >
            {providers.map((provider) => (
              <option key={provider.id} value={provider.id}>
                {provider.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs uppercase text-slate-400">Recompensa (GOLD)</label>
          <input
            type="number"
            min={5}
            max={100}
            value={reward}
            onChange={(e) => setReward(Number(e.target.value))}
            className="rounded-lg border border-slate-800 bg-slate-950/70 px-3 py-2 text-sm focus:border-emerald-300 focus:outline-none"
          />
        </div>
        <div className="flex flex-col justify-end gap-2">
          <button
            onClick={handleRequestToken}
            className="rounded-lg bg-cyan-400/90 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-300 transition"
          >
            Gerar token
          </button>
          <button
            onClick={handleRedeem}
            disabled={!token}
            className="rounded-lg border border-emerald-400/40 px-4 py-2 text-sm font-semibold text-emerald-200 transition hover:border-emerald-300 disabled:opacity-50"
          >
            Validar e receber
          </button>
        </div>
      </div>
      {token && (
        <div className="rounded-xl border border-emerald-400/40 bg-emerald-400/10 px-4 py-3 text-xs text-emerald-200">
          <p className="font-semibold uppercase tracking-widest">Token ativo</p>
          <p className="mt-1 break-all font-mono text-sm">{token.token}</p>
          <p className="mt-1 text-emerald-100">
            Expira em {new Date(token.expiresAt).toLocaleTimeString("pt-BR")}
          </p>
        </div>
      )}
      {status && <p className="text-xs text-slate-400">{status}</p>}
    </section>
  );
}
