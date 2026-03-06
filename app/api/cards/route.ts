import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// 一覧取得
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json([], { status: 401 });
  }

  const cards = await prisma.businessCard.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(cards);
}

// 新規作成
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const card = await prisma.businessCard.create({
    data: {
      userId: session.user.id,
      name: "No Name",
      company: "No Company",
      email: "no@email.com",
      bgType: "color",
      data: body.texts,
    },
  });

  return NextResponse.json(card);
}