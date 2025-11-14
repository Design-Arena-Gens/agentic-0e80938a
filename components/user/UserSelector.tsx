/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useState } from "react";
import { User } from "@/types";
import { cn } from "@/lib/utils";

type Props = {
  onSelect: (user: User) => void;
  selectedId?: number;
};

export default function UserSelector({ onSelect, selectedId }: Props) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [username, setUsername] = useState("");
  const [wallet, setWallet] = useState("");

  async function loadUsers() {
    try {
      setLoading(true);
      const res = await fetch("/api/users", { cache: "no-store" });
      const data = await res.json();
      setUsers(data.users ?? []);
      if (data.users?.length && !selectedId) {
        onSelect(data.users[0]);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!username) return;
    setCreating(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, wallet }),
      });
      const data = await res.json();
      if (res.ok) {
        setUsername("");
        setWallet("");
        await loadUsers();
        onSelect(data.user);
      } else {
        alert(data.error ?? "Falha ao criar jogador");
      }
    } finally {
      setCreating(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-white mb-3">Jogadores</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {users.map((user) => (
            <button
              key={user.id}
              onClick={() => onSelect(user)}
              className={cn(
                "rounded-xl border border-slate-800 px-4 py-3 text-left transition hover:border-amber-300 hover:bg-slate-900/50",
                selectedId === user.id && "border-amber-300 bg-slate-900/70"
              )}
            >
              <p className="text-sm font-semibold text-amber-200">{user.username}</p>
              <p className="text-xs text-slate-400 mt-1">
                {user.gold_balance.toFixed(2)} GOLD • {user.energy} energia
              </p>
            </button>
          ))}
        </div>
        {loading && <p className="text-xs text-slate-500 mt-2">Carregando jogadores...</p>}
      </div>
      <form
        onSubmit={handleCreate}
        className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-3"
      >
        <div>
          <label className="text-xs uppercase text-slate-400 tracking-widest">
            Criar novo jogador
          </label>
          <input
            className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-950/60 px-4 py-2 text-sm focus:border-amber-400 focus:outline-none"
            placeholder="Nome do jogador"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div>
          <label className="text-xs uppercase text-slate-400 tracking-widest">
            Carteira (opcional)
          </label>
          <input
            className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-950/60 px-4 py-2 text-sm focus:border-amber-400 focus:outline-none"
            placeholder="0x..."
            value={wallet}
            onChange={(e) => setWallet(e.target.value)}
          />
        </div>
        <button
          type="submit"
          disabled={creating}
          className="rounded-lg bg-emerald-400/90 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-400/30 hover:bg-emerald-300 transition disabled:opacity-60"
        >
          {creating ? "Criando..." : "Adicionar jogador"}
        </button>
      </form>
    </div>
  );
}
