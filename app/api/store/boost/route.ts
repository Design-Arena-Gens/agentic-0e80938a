import { NextResponse } from "next/server";
import { z } from "zod";
import { getUserById } from "@/lib/users";
import { purchaseBoost } from "@/lib/gameplay";

const schema = z.object({
  userId: z.number().int().positive(),
  goldCost: z.number().positive(),
  kind: z.string().min(3).max(32),
  durationHours: z.number().int().min(1).max(168).optional(),
});

export async function POST(req: Request) {
  try {
    const payload = schema.parse(await req.json());
    if (!getUserById(payload.userId)) {
      return NextResponse.json({ error: "Jogador não encontrado" }, { status: 404 });
    }
    const response = purchaseBoost(
      payload.userId,
      payload.goldCost,
      payload.kind,
      payload.durationHours ?? 24
    );
    return NextResponse.json({ boost: response });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
