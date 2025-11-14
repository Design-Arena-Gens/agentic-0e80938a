"use client";

import { useEffect, useState } from "react";
import { User } from "@/types";
import UserSelector from "@/components/user/UserSelector";
import UserOverview from "@/components/dashboard/UserOverview";
import FarmPanel from "@/components/dashboard/FarmPanel";
import AdsPanel from "@/components/dashboard/AdsPanel";
import StorePanel from "@/components/dashboard/StorePanel";
import BattlePanel from "@/components/dashboard/BattlePanel";
import TransactionsPanel from "@/components/dashboard/TransactionsPanel";
import { GoldRates } from "@/lib/gold";

type Props = {
  initialUsers: User[];
  rates: GoldRates;
};

export default function DashboardClient({ initialUsers, rates }: Props) {
  const [selectedUser, setSelectedUser] = useState<User | null>(
    initialUsers[0] ?? null
  );
  const [ratesState, setRatesState] = useState(rates);
  const [refreshKey, setRefreshKey] = useState(0);

  async function refreshUserData(userId: number) {
    const res = await fetch(`/api/users/${userId}`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      setSelectedUser(data.user);
      setRefreshKey((prev) => prev + 1);
    }
  }

  useEffect(() => {
    fetch("/api/admin/config")
      .then((res) => res.json())
      .then((data) => {
        if (data.configs?.gold_buy_rate && data.configs?.gold_sell_rate) {
          setRatesState({
            buy: data.configs.gold_buy_rate,
            sell: data.configs.gold_sell_rate,
          });
        }
      });
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-10">
      <div className="grid lg:grid-cols-[280px,1fr] gap-10">
        <div>
          <UserSelector
            onSelect={(user) => setSelectedUser(user)}
            selectedId={selectedUser?.id}
          />
        </div>
        <div className="space-y-6">
          {selectedUser ? (
            <>
              <UserOverview user={selectedUser} rates={ratesState} />
              <div className="grid xl:grid-cols-2 gap-6">
                <FarmPanel
                  userId={selectedUser.id}
                  onUpdate={() => refreshUserData(selectedUser.id)}
                />
                <AdsPanel
                  userId={selectedUser.id}
                  onUpdate={() => refreshUserData(selectedUser.id)}
                />
              </div>
              <StorePanel
                userId={selectedUser.id}
                onUpdate={() => refreshUserData(selectedUser.id)}
              />
              <BattlePanel
                userId={selectedUser.id}
                onUpdate={() => refreshUserData(selectedUser.id)}
              />
              <TransactionsPanel
                userId={selectedUser.id}
                refreshKey={refreshKey}
              />
            </>
          ) : (
            <div className="rounded-3xl border border-slate-800/60 bg-slate-950/60 p-10 text-center text-slate-400">
              Crie ou selecione um jogador para visualizar o hub.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
