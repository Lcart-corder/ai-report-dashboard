import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const storeId = url.searchParams.get("storeId");

  const where = storeId ? { storeId } : {};

  const shipments = await prisma.shipment.findMany({
    where,
    orderBy: { datePlanned: "desc" },
    take: 50,
    include: {
      store: { select: { name: true } },
      items: { include: { lot: { select: { lotNumber: true } } } },
      inspection: true,
      deliveredByUser: { select: { name: true } },
    },
  });

  return NextResponse.json(shipments);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!["ADMIN", "WELFARE_MANAGER", "STAFF"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();

  // 納品作成
  if (body.action === "create") {
    const shipment = await prisma.shipment.create({
      data: {
        datePlanned: new Date(body.datePlanned),
        storeId: body.storeId,
      },
    });
    return NextResponse.json(shipment);
  }

  // 出荷アイテム追加
  if (body.action === "addItem") {
    const item = await prisma.shipmentItem.create({
      data: {
        shipmentId: body.shipmentId,
        lotId: body.lotId,
        grade: body.grade,
        packCount: body.packCount,
      },
    });
    return NextResponse.json(item);
  }

  // 納品完了
  if (body.action === "deliver") {
    const shipment = await prisma.shipment.update({
      where: { id: body.shipmentId },
      data: {
        status: "DELIVERED",
        dateDelivered: new Date(body.dateDelivered),
        deliveredAt: new Date(),
        deliveredBy: session.user.id,
      },
    });
    return NextResponse.json(shipment);
  }

  return NextResponse.json({ error: "不正なアクション" }, { status: 400 });
}
