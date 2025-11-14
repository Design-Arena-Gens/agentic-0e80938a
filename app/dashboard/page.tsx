import DashboardClient from "./DashboardClient";
import { listUsers } from "@/lib/users";
import { getGoldRates } from "@/lib/gold";

export default function DashboardPage() {
  const users = listUsers();
  const rates = getGoldRates();

  return <DashboardClient initialUsers={users} rates={rates} />;
}
