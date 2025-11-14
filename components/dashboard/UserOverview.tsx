 "use client";

import { User } from "@/types";
import { formatDate, formatGold } from "@/lib/format";
import { GoldRates } from "@/lib/gold";

type Props = {
  user: User;
  rates: GoldRates;
};

export default function UserOverview({ user, rates }: Props) {
  return (
    <section className="glass rounded-3xl p-8 border border-slate-800/60 bg-slate-900/40">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-white">{user.username}</h2>
          <p className="text-xs uppercase tracking-widest text-slate-400 mt-1">
            Desde {formatDate(user.created_at)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-amber-300">
            {user.gold_balance.toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
            })}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            ≈{" "}
            {(
              user.gold_balance * rates.sell.usdPerGold
            ).toLocaleString("pt-BR", {
              style: "currency",
              currency: "USD",
            })}
          </p>
        </div>
      </div>
      <dl className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-4">
          <dt className="text-xs text-slate-400 uppercase tracking-wide">
            Energia
          </dt>
          <dd className="text-lg font-semibold text-emerald-300">
            {user.energy} / 200
          </dd>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-4">
          <dt className="text-xs text-slate-400 uppercase tracking-wide">
            Cotação Compra
          </dt>
          <dd className="text-sm text-slate-200">
            {formatGold(rates.buy.goldPerUsd)} por 1 USD
          </dd>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-4">
          <dt className="text-xs text-slate-400 uppercase tracking-wide">
            Cotação Saque
          </dt>
          <dd className="text-sm text-slate-200">
            {formatGold(rates.sell.goldPerUsd)} por 1 USD
          </dd>
        </div>
        {user.wallet_address ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-4">
            <dt className="text-xs text-slate-400 uppercase tracking-wide">
              Carteira
            </dt>
            <dd className="text-sm text-slate-200 break-all">
              {user.wallet_address}
            </dd>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-4">
            <dt className="text-xs text-slate-400 uppercase tracking-wide">
              Carteira
            </dt>
            <dd className="text-sm text-slate-500">Não vinculada</dd>
          </div>
        )}
      </dl>
    </section>
  );
}
