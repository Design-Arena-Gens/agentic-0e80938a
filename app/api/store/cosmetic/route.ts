import { NextResponse } from "next/server";
import { z } from "zod";
import { getUserById } from "@/lib/users";
import { purchaseCosmetic } from "@/lib/gameplay";

const schema = z.object({
  userId: z.number().int().positive(),
  goldCost: z.number().positive(),
  itemName: z.string().min(3).max(64),
});

export async function POST(req: Request) {
  try {
    const payload = schema.parse(await req.json());
    if (!getUserById(payload.userId)) {
      return NextResponse.json({ error: "Jogador não encontrado" }, { status: 404 });
    }
    const response = purchaseCosmetic(
      payload.userId,
      payload.goldCost,
      payload.itemName
    );
    return NextResponse.json({ cosmetic: response });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
