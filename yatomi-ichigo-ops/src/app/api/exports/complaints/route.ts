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

  const complaints = await prisma.complaint.findMany({
    where: { date: { gte: monthStart, lte: monthEnd } },
    include: { lot: { select: { lotNumber: true } } },
    orderBy: { date: "asc" },
  });

  const BOM = "\uFEFF";
  const header = ["発生日", "種別", "ロット番号", "内容", "対応", "再発防止"];
  const rows: string[][] = [header];

  for (const c of complaints) {
    rows.push([
      c.date.toISOString().split("T")[0],
      c.type,
      c.lot?.lotNumber ?? "",
      c.detail,
      c.action,
      c.prevention,
    ]);
  }

  const csv = BOM + rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="complaints_${ym}.csv"`,
    },
  });
}
