import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const lots = await prisma.lot.findMany({
    orderBy: { date: "desc" },
    take: 100,
  });
  return NextResponse.json(lots);
}
