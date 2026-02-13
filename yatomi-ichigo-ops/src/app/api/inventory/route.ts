import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const items = await prisma.inventoryItem.findMany({
    include: {
      transactions: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  // 在庫数を計算
  const result = items.map((item) => {
    const stock = item.transactions.reduce((sum, txn) => {
      return sum + (txn.type === "IN" ? txn.qty : -txn.qty);
    }, 0);
    return { ...item, stock };
  });

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!["ADMIN", "WELFARE_MANAGER", "STAFF"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();

  const item = await prisma.inventoryItem.create({
    data: {
      name: body.name,
      unit: body.unit,
    },
  });

  return NextResponse.json(item);
}
