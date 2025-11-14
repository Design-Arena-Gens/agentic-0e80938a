"use client";

import { useEffect, useState } from "react";
import { User } from "@/types";

type Props = {
  userId: number;
  onUpdate?: () => void;
};

export default function BattlePanel({ userId, onUpdate }: Props) {
  const [users, setUsers] = useState<User[]>([]);
  const [opponentId, setOpponentId] = useState<number | null>(null);
  const [entry, setEntry] = useState(20);
  const [status, setStatus] = useState("");

  useEffect(() => {
    fetch("/api/users")
      .then((res) => res.json())
      .then((data) => setUsers(data.users ?? []));
  }, []);

  async function handleBattle() {
    if (!opponentId) return;
    setStatus("Iniciando batalha...");
    const res = await fetch("/api/battles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        challengerId: userId,
        opponentId,
        entryGold: entry,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setStatus(data.error ?? "Erro na batalha.");
    } else {
      setStatus(
        data.result.outcome === "win"
          ? `Vitória! Recompensa: ${data.result.rewardGold} GOLD`
          : "Derrota. Tente novamente após reforçar sua coleção."
      );
      onUpdate?.();
    }
  }

  return (
    <section className="rounded-3xl border border-slate-800/60 bg-slate-950/60 p-6 space-y-5">
      <header>
        <h3 className="text-lg font-semibold text-white">Batalhas PvP</h3>
        <p className="text-xs text-slate-400">
          O vencedor leva o prize pool em GOLD. Entry fee debitado de ambos jogadores.
        </p>
      </header>
      <div className="grid md:grid-cols-3 gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-xs uppercase text-slate-400">Oponente</label>
          <select
            value={opponentId ?? ""}
            onChange={(e) => setOpponentId(Number(e.target.value))}
            className="rounded-lg border border-slate-800 bg-slate-950/70 px-3 py-2 text-sm focus:border-rose-300 focus:outline-none"
          >
            <option value="">Selecionar</option>
            {users
              .filter((user) => user.id !== userId)
              .map((user) => (
                <option value={user.id} key={user.id}>
                  {user.username} • {user.gold_balance.toFixed(1)} GOLD
                </option>
              ))}
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs uppercase text-slate-400">Entry (GOLD)</label>
          <input
            type="number"
            min={10}
            value={entry}
            onChange={(e) => setEntry(Number(e.target.value))}
            className="rounded-lg border border-slate-800 bg-slate-950/70 px-3 py-2 text-sm focus:border-rose-300 focus:outline-none"
          />
        </div>
        <div className="flex items-end">
          <button
            onClick={handleBattle}
            disabled={!opponentId}
            className="w-full rounded-lg bg-rose-400/90 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-rose-300 transition disabled:opacity-60"
          >
            Entrar na batalha
          </button>
        </div>
      </div>
      {status && (
        <p className="text-xs text-slate-300 border border-slate-700 rounded-lg px-3 py-2 bg-slate-900/70">
          {status}
        </p>
      )}
    </section>
  );
}
