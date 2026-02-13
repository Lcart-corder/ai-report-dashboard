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
  const ym = url.searchParams.get("yearMonth");
  if (!ym) return NextResponse.json({ error: "yearMonth is required" }, { status: 400 });

  const [year, month] = ym.split("-").map(Number);
  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = new Date(year, month, 0);

  const shipments = await prisma.shipment.findMany({
    where: { datePlanned: { gte: monthStart, lte: monthEnd } },
    include: {
      store: { select: { name: true } },
      items: { include: { lot: { select: { lotNumber: true } } } },
      inspection: true,
      deliveredByUser: { select: { name: true } },
    },
    orderBy: { datePlanned: "asc" },
  });

  const BOM = "\uFEFF";
  const header = [
    "納品予定日", "納品先", "ステータス", "ロット番号", "等級", "パック数",
    "納品日", "担当者", "検収受領A", "検収受領B", "返品A", "返品B", "値引A", "値引B", "返品理由",
  ];

  const rows: string[][] = [header];
  for (const s of shipments) {
    if (s.items.length === 0) {
      rows.push([
        s.datePlanned.toISOString().split("T")[0],
        s.store.name,
        s.status,
        "", "", "",
        s.dateDelivered?.toISOString().split("T")[0] ?? "",
        s.deliveredByUser?.name ?? "",
        "", "", "", "", "", "", "",
      ]);
    } else {
      for (const item of s.items) {
        rows.push([
          s.datePlanned.toISOString().split("T")[0],
          s.store.name,
          s.status,
          item.lot.lotNumber,
          item.grade,
          String(item.packCount),
          s.dateDelivered?.toISOString().split("T")[0] ?? "",
          s.deliveredByUser?.name ?? "",
          String(s.inspection?.receivedA ?? ""),
          String(s.inspection?.receivedB ?? ""),
          String(s.inspection?.returnedA ?? ""),
          String(s.inspection?.returnedB ?? ""),
          String(s.inspection?.discountA ?? ""),
          String(s.inspection?.discountB ?? ""),
          s.inspection?.reason ?? "",
        ]);
      }
    }
  }

  const csv = BOM + rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="shipments_${ym}.csv"`,
    },
  });
}
