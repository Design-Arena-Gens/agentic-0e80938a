import { NextResponse } from "next/server";
import { z } from "zod";
import { enterBattle } from "@/lib/gameplay";
import { getUserById } from "@/lib/users";

const schema = z.object({
  challengerId: z.number().int().positive(),
  opponentId: z.number().int().positive(),
  entryGold: z.number().positive(),
});

export async function POST(req: Request) {
  try {
    const payload = schema.parse(await req.json());
    if (!getUserById(payload.challengerId) || !getUserById(payload.opponentId)) {
      return NextResponse.json({ error: "Jogadores inválidos" }, { status: 400 });
    }
    const result = enterBattle(
      payload.challengerId,
      payload.opponentId,
      payload.entryGold
    );
    return NextResponse.json({ result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
