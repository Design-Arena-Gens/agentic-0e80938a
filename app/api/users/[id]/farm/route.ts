import { NextResponse } from "next/server";
import { getUserById } from "@/lib/users";
import { calculatePassiveFarm } from "@/lib/nfts";

type Context = {
  params: Promise<{ id: string }>;
};

export async function POST(_: Request, context: Context) {
  const { id } = await context.params;
  const userId = Number(id);
  const user = getUserById(userId);
  if (!user) {
    return NextResponse.json({ error: "Jogador não encontrado" }, { status: 404 });
  }

  try {
    const farm = calculatePassiveFarm(userId);
    return NextResponse.json({ farm });
  } catch {
    return NextResponse.json({ error: "Não foi possível calcular o farm" }, { status: 400 });
  }
}
