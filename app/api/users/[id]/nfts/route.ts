import { NextResponse } from "next/server";
import { z } from "zod";
import { getUserById } from "@/lib/users";
import { mintNFT, listNFTsByUser } from "@/lib/nfts";

const mintSchema = z.object({
  name: z.string().min(3).max(50),
  rarity: z.enum(["common", "rare", "epic", "legendary", "mythic"]),
  costGold: z.number().positive(),
});

type Context = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, context: Context) {
  const { id } = await context.params;
  const user = getUserById(Number(id));
  if (!user) {
    return NextResponse.json({ error: "Jogador não encontrado" }, { status: 404 });
  }
  const nfts = listNFTsByUser(user.id);
  return NextResponse.json({ nfts });
}

export async function POST(req: Request, context: Context) {
  const { id } = await context.params;
  const userId = Number(id);
  const user = getUserById(userId);
  if (!user) {
    return NextResponse.json({ error: "Jogador não encontrado" }, { status: 404 });
  }

  try {
    const body = await req.json();
    const payload = mintSchema.parse(body);
    const nft = mintNFT(userId, payload.name, payload.rarity, payload.costGold);
    return NextResponse.json({ nft }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Não foi possível cunhar o NFT" }, { status: 400 });
  }
}
