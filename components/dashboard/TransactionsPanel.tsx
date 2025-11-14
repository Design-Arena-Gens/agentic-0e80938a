/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useState } from "react";
import { Transaction } from "@/types";
import { formatGold, formatUsd, formatDate } from "@/lib/format";

type Props = {
  userId: number;
  refreshKey?: number;
};

export default function TransactionsPanel({ userId, refreshKey = 0 }: Props) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  async function load() {
    const res = await fetch(`/api/users/${userId}/transactions`, { cache: "no-store" });
    const data = await res.json();
    setTransactions(data.transactions ?? []);
  }

  useEffect(() => {
    load();
  }, [userId, refreshKey]);

  return (
    <section className="rounded-3xl border border-slate-800/60 bg-slate-950/60 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Histórico</h3>
        <button
          onClick={load}
          className="text-xs text-slate-400 border border-slate-700 rounded px-3 py-1 hover:text-amber-200 hover:border-amber-200 transition"
        >
          Atualizar
        </button>
      </div>
      <div className="space-y-3">
        {transactions.map((tx) => (
          <article
            key={tx.id}
            className="rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-3"
          >
            <header className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest text-amber-200">
                {tx.type}
              </span>
              <span className="text-xs text-slate-500">{formatDate(tx.created_at)}</span>
            </header>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span>{formatGold(tx.amount_gold)}</span>
              <span>{formatUsd(tx.amount_usd)}</span>
            </div>
          </article>
        ))}
        {!transactions.length && (
          <p className="text-xs text-slate-500">Nenhuma transação registrada.</p>
        )}
      </div>
    </section>
  );
}
