import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = session.user.role;
  if (!["ADMIN", "WELFARE_MANAGER"].includes(role)) {
    return NextResponse.json({ error: "承認権限がありません" }, { status: 403 });
  }

  const { productionDayId } = await req.json();

  const updated = await prisma.productionDay.update({
    where: { id: productionDayId },
    data: { approvedBy: session.user.id },
  });

  return NextResponse.json(updated);
}
