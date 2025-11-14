import { NextResponse } from "next/server";
import { z } from "zod";
import { listConfigs, setConfig } from "@/lib/config";

const schema = z.object({
  key: z.enum(["gold_buy_rate", "gold_sell_rate", "daily_ad_limit", "ad_providers"]),
  value: z.any(),
});

export async function GET() {
  const configs = listConfigs();
  return NextResponse.json({ configs });
}

export async function POST(req: Request) {
  try {
    const payload = schema.parse(await req.json());
    setConfig(payload.key, payload.value);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Não foi possível atualizar a configuração" }, { status: 400 });
  }
}
