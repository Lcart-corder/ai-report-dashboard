import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const date = url.searchParams.get("date");

  if (date) {
    const record = await prisma.dailyChecklist.findUnique({
      where: { date: new Date(date) },
      include: { createdByUser: { select: { name: true } } },
    });
    return NextResponse.json(record);
  }

  const records = await prisma.dailyChecklist.findMany({
    orderBy: { date: "desc" },
    take: 30,
    include: { createdByUser: { select: { name: true } } },
  });
  return NextResponse.json(records);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = session.user.role;
  if (!["ADMIN", "WELFARE_MANAGER", "STAFF"].includes(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();

  const warnings: string[] = [];
  if (body.humidity > 75) warnings.push("湿度が75%を超えています");
  if (body.condensation) warnings.push("結露が発生しています");
  if (body.fridgeTemp !== null && body.fridgeTemp !== undefined) {
    if (body.fridgeTemp < 5 || body.fridgeTemp > 8) warnings.push("冷蔵温度が5〜8℃の範囲外です");
  }

  const record = await prisma.dailyChecklist.upsert({
    where: { date: new Date(body.date) },
    update: {
      tempDay: body.tempDay,
      tempNight: body.tempNight,
      humidity: body.humidity,
      condensation: body.condensation,
      ventilation: body.ventilation,
      dehumidifier: body.dehumidifier,
      cleaning: body.cleaning,
      fridgeTemp: body.fridgeTemp ?? null,
      notes: body.notes ?? null,
      createdBy: session.user.id,
    },
    create: {
      date: new Date(body.date),
      tempDay: body.tempDay,
      tempNight: body.tempNight,
      humidity: body.humidity,
      condensation: body.condensation,
      ventilation: body.ventilation,
      dehumidifier: body.dehumidifier,
      cleaning: body.cleaning,
      fridgeTemp: body.fridgeTemp ?? null,
      notes: body.notes ?? null,
      createdBy: session.user.id,
    },
  });

  return NextResponse.json({ record, warnings });
}
