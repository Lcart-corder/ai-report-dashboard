import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const production = await prisma.productionDay.findUnique({ where: { id: params.id } });
  if (!production) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const existingCount = await prisma.lot.count({
    where: { productionDayId: params.id },
  });
  const seq = String(existingCount + 1).padStart(3, "0");
  const lotNumber = `${production.lotPrefix}-${seq}`;

  const lot = await prisma.lot.create({
    data: {
      lotNumber,
      date: production.date,
      productionDayId: params.id,
    },
  });

  return NextResponse.json(lot);
}
