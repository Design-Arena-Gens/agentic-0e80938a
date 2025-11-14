import { NextResponse } from "next/server";
import { z } from "zod";
import { createUser, listUsers } from "@/lib/users";

const createUserSchema = z.object({
  username: z.string().min(3).max(32),
  wallet: z.string().min(10).max(128).optional().or(z.literal("")),
});

export async function GET() {
  const users = listUsers();
  return NextResponse.json({ users });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { username, wallet } = createUserSchema.parse(body);
    const user = createUser(username, wallet || undefined);
    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Não foi possível criar o usuário" }, { status: 500 });
  }
}
