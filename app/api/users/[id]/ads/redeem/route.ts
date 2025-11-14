import { NextResponse } from "next/server";
import { z } from "zod";
import { getUserById } from "@/lib/users";
import { redeemAdToken } from "@/lib/ads";

const schema = z.object({
  token: z.string().length(32),
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
    const { token } = schema.parse(await req.json());
    const reward = redeemAdToken(userId, token);
    return NextResponse.json({ reward });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
