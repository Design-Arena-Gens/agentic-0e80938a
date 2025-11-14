import { NextResponse } from "next/server";
import { z } from "zod";
import { getUserById } from "@/lib/users";
import { createAdToken } from "@/lib/ads";

const schema = z.object({
  provider: z.enum(["unity", "admob", "applovin", "ironsource"]),
  goldReward: z.number().min(1).max(100),
});

type Context = {
  params: Promise<{ id: string }>;
};

export async function POST(req: Request, context: Context) {
  const { id } = await context.params;
  const userId = Number(id);
  const user = getUserById(userId);
  if (!user) {
    return NextResponse.json({ error: "Jogador não encontrado" }, { status: 404 });
  }

  try {
    const payload = schema.parse(await req.json());
    const token = createAdToken(userId, payload.provider, payload.goldReward);
    return NextResponse.json({ token });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
