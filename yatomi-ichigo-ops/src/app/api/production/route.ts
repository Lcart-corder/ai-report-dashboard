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
    const record = await prisma.productionDay.findUnique({
      where: { date: new Date(date) },
      include: { lots: true, approvedByUser: { select: { name: true } } },
    });
    return NextResponse.json(record);
  }

  const records = await prisma.productionDay.findMany({
    orderBy: { date: "desc" },
    take: 30,
    include: { lots: true, approvedByUser: { select: { name: true } } },
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
  const dateObj = new Date(body.date);
  const lotPrefix = body.date.replace(/-/g, "");

  // outOfSpec バリデーション
  if (body.outOfSpecCount > 0 && !body.outOfSpecReason) {
    return NextResponse.json(
      { error: "規格外パックがある場合は理由を入力してください" },
      { status: 400 }
    );
  }

  const record = await prisma.productionDay.upsert({
    where: { date: dateObj },
    update: {
      harvestCount: body.harvestCount ?? null,
      gradeA: body.gradeA,
      gradeB: body.gradeB,
      waste: body.waste,
      packCountA: body.packCountA,
      packCountB: body.packCountB,
      outOfSpecCount: body.outOfSpecCount ?? 0,
      outOfSpecReason: body.outOfSpecReason ?? null,
      workMinutes: body.workMinutes,
      lotPrefix,
    },
    create: {
      date: dateObj,
      harvestCount: body.harvestCount ?? null,
      gradeA: body.gradeA,
      gradeB: body.gradeB,
      waste: body.waste,
      packCountA: body.packCountA,
      packCountB: body.packCountB,
      outOfSpecCount: body.outOfSpecCount ?? 0,
      outOfSpecReason: body.outOfSpecReason ?? null,
      workMinutes: body.workMinutes,
      lotPrefix,
    },
  });

  // ロット自動採番
  const existingLots = await prisma.lot.count({
    where: { date: dateObj },
  });
  if (existingLots === 0) {
    const seq = String(existingLots + 1).padStart(3, "0");
    await prisma.lot.create({
      data: {
        lotNumber: `${lotPrefix}-${seq}`,
        date: dateObj,
        productionDayId: record.id,
      },
    });
  }

  return NextResponse.json(record);
}
