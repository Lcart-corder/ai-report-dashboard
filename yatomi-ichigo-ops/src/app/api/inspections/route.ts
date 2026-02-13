import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const shipmentId = url.searchParams.get("shipmentId");

  if (shipmentId) {
    const inspection = await prisma.storeInspection.findUnique({
      where: { shipmentId },
      include: { inspectedByUser: { select: { name: true } } },
    });
    return NextResponse.json(inspection);
  }

  // 店舗ユーザーは自分の店舗の納品のみ
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  const where = user?.storeId
    ? { shipment: { storeId: user.storeId } }
    : {};

  const inspections = await prisma.storeInspection.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      shipment: {
        include: { store: { select: { name: true } }, items: true },
      },
      inspectedByUser: { select: { name: true } },
    },
  });

  return NextResponse.json(inspections);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  const inspection = await prisma.storeInspection.create({
    data: {
      shipmentId: body.shipmentId,
      receivedA: body.receivedA,
      receivedB: body.receivedB,
      returnedA: body.returnedA ?? 0,
      returnedB: body.returnedB ?? 0,
      discountA: body.discountA ?? 0,
      discountB: body.discountB ?? 0,
      reason: body.reason ?? null,
      comment: body.comment ?? null,
      inspectedBy: session.user.id,
    },
  });

  // 納品ステータスを検収済みに
  await prisma.shipment.update({
    where: { id: body.shipmentId },
    data: { status: "INSPECTED" },
  });

  return NextResponse.json(inspection);
}
