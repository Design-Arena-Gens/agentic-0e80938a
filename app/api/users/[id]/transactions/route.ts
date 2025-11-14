import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getUserById } from "@/lib/users";

type Context = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, context: Context) {
  const { id } = await context.params;
  const userId = Number(id);
  if (!getUserById(userId)) {
    return NextResponse.json({ error: "Jogador não encontrado" }, { status: 404 });
  }

  const transactions = db
    .prepare(
      "SELECT id, type, amount_gold, amount_usd, metadata, created_at FROM transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT 20"
    )
    .all(userId);

  return NextResponse.json({ transactions });
}
