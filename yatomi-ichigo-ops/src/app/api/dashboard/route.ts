import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  // 今日のチェックリスト有無
  const todayChecklist = await prisma.dailyChecklist.findUnique({ where: { date: today } });

  // 今日の生産記録有無
  const todayProduction = await prisma.productionDay.findUnique({ where: { date: today } });

  // 今日が納品日か（月水金 = 1,3,5）
  const dayOfWeek = today.getDay();
  const isDeliveryDay = [1, 3, 5].includes(dayOfWeek);

  // 今月の生産データ集計
  const monthlyProduction = await prisma.productionDay.findMany({
    where: { date: { gte: monthStart, lte: monthEnd } },
  });

  let totalA = 0,
    totalB = 0,
    totalWaste = 0,
    totalPackA = 0,
    totalPackB = 0,
    totalMinutes = 0;
  for (const p of monthlyProduction) {
    totalA += p.gradeA;
    totalB += p.gradeB;
    totalWaste += p.waste;
    totalPackA += p.packCountA;
    totalPackB += p.packCountB;
    totalMinutes += p.workMinutes;
  }
  const totalAll = totalA + totalB + totalWaste;
  const wasteRate = totalAll > 0 ? ((totalWaste / totalAll) * 100).toFixed(1) : "0.0";

  // 今月のクレーム数
  const complaintCount = await prisma.complaint.count({
    where: { date: { gte: monthStart, lte: monthEnd } },
  });

  // 今月の出荷パック数
  const shipmentItems = await prisma.shipmentItem.findMany({
    where: {
      shipment: {
        datePlanned: { gte: monthStart, lte: monthEnd },
        status: { in: ["DELIVERED", "INSPECTED"] },
      },
    },
  });
  const shippedPacks = shipmentItems.reduce((s, i) => s + i.packCount, 0);

  // 今月の追加電気代
  const ym = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  const kpiSettings = await prisma.monthlyKpiSettings.findUnique({ where: { yearMonth: ym } });

  // 温湿度逸脱回数
  const checklists = await prisma.dailyChecklist.findMany({
    where: { date: { gte: monthStart, lte: monthEnd } },
  });
  let deviationCount = 0;
  for (const c of checklists) {
    if (c.humidity > 75) deviationCount++;
    if (c.condensation) deviationCount++;
    if (c.fridgeTemp !== null && (c.fridgeTemp < 5 || c.fridgeTemp > 8)) deviationCount++;
  }

  // 未処理タスク
  const pendingTasks: string[] = [];
  if (!todayChecklist) pendingTasks.push("日次チェックリスト未入力");
  if (!todayProduction) pendingTasks.push("生産記録未入力");
  if (isDeliveryDay) {
    const todayShipment = await prisma.shipment.findFirst({
      where: { datePlanned: today, status: { not: "DELIVERED" } },
    });
    if (todayShipment) pendingTasks.push("本日の納品が未完了");
  }

  return NextResponse.json({
    isDeliveryDay,
    pendingTasks,
    kpi: {
      wasteRate: `${wasteRate}%`,
      wasteWarning: parseFloat(wasteRate) > 5,
      shippedPacks,
      totalPackA,
      totalPackB,
      complaintCount,
      electricityCost: kpiSettings?.electricityCost ?? null,
      electricityWarning: (kpiSettings?.electricityCost ?? 0) > 50000,
      avgWorkMinutes:
        monthlyProduction.length > 0
          ? Math.round(totalMinutes / monthlyProduction.length)
          : 0,
      deviationCount,
    },
  });
}
