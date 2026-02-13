import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!["ADMIN", "WELFARE_MANAGER", "QUALITY_MANAGER"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const url = new URL(req.url);
  const ym = url.searchParams.get("yearMonth"); // "2025-01"
  if (!ym) return NextResponse.json({ error: "yearMonth is required" }, { status: 400 });

  const [year, month] = ym.split("-").map(Number);
  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = new Date(year, month, 0);

  const productions = await prisma.productionDay.findMany({
    where: { date: { gte: monthStart, lte: monthEnd } },
  });

  let totalA = 0, totalB = 0, totalWaste = 0, totalPacks = 0, totalMinutes = 0;
  for (const p of productions) {
    totalA += p.gradeA;
    totalB += p.gradeB;
    totalWaste += p.waste;
    totalPacks += p.packCountA + p.packCountB;
    totalMinutes += p.workMinutes;
  }
  const totalAll = totalA + totalB + totalWaste;
  const wasteRate = totalAll > 0 ? ((totalWaste / totalAll) * 100).toFixed(1) : "0.0";

  const complaintCount = await prisma.complaint.count({
    where: { date: { gte: monthStart, lte: monthEnd } },
  });

  const checklists = await prisma.dailyChecklist.findMany({
    where: { date: { gte: monthStart, lte: monthEnd } },
  });
  let deviationCount = 0;
  for (const c of checklists) {
    if (c.humidity > 75) deviationCount++;
    if (c.condensation) deviationCount++;
    if (c.fridgeTemp !== null && (c.fridgeTemp < 5 || c.fridgeTemp > 8)) deviationCount++;
  }

  const kpiSettings = await prisma.monthlyKpiSettings.findUnique({ where: { yearMonth: ym } });

  // BOM付きCSV
  const BOM = "\uFEFF";
  const rows = [
    ["項目", "値"],
    ["対象月", ym],
    ["等級A合計（個）", String(totalA)],
    ["等級B合計（個）", String(totalB)],
    ["廃棄合計（個）", String(totalWaste)],
    ["廃棄率（%）", wasteRate],
    ["出荷パック合計", String(totalPacks)],
    ["クレーム件数", String(complaintCount)],
    ["平均作業時間（分）", productions.length > 0 ? String(Math.round(totalMinutes / productions.length)) : "0"],
    ["温湿度逸脱回数", String(deviationCount)],
    ["追加電気代（円）", String(kpiSettings?.electricityCost ?? "未入力")],
  ];

  const csv = BOM + rows.map((r) => r.join(",")).join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="kpi_${ym}.csv"`,
    },
  });
}
