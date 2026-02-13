import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const complaints = await prisma.complaint.findMany({
    orderBy: { date: "desc" },
    take: 50,
    include: { lot: { select: { lotNumber: true } } },
  });

  return NextResponse.json(complaints);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!["ADMIN", "WELFARE_MANAGER", "STAFF"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();

  const complaint = await prisma.complaint.create({
    data: {
      date: new Date(body.date),
      lotId: body.lotId || null,
      type: body.type,
      detail: body.detail,
      action: body.action,
      prevention: body.prevention,
    },
  });

  return NextResponse.json(complaint);
}
