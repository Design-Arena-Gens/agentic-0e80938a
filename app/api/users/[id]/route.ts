import { NextResponse } from "next/server";
import { getUserById } from "@/lib/users";

type Context = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, context: Context) {
  const { id } = await context.params;
  const user = getUserById(Number(id));
  if (!user) {
    return NextResponse.json({ error: "Jogador não encontrado" }, { status: 404 });
  }
  return NextResponse.json({ user });
}
