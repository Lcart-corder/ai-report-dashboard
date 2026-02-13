import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!["ADMIN", "WELFARE_MANAGER", "STAFF"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();

  const txn = await prisma.inventoryTxn.create({
    data: {
      itemId: body.itemId,
      date: new Date(body.date),
      type: body.type,
      qty: body.qty,
      note: body.note ?? null,
    },
  });

  return NextResponse.json(txn);
}
