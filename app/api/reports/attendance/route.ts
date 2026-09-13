import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const programmeId = searchParams.get("programmeId");

  const attendance = await prisma.attendance.findMany({
    where: {
      ...(programmeId ? { programmeId } : {}),
      ...(from || to
        ? {
            programme: {
              date: {
                ...(from ? { gte: new Date(from) } : {}),
                ...(to ? { lte: new Date(to + "T23:59:59") } : {}),
              },
            },
          }
        : {}),
    },
    include: {
      member: { select: { firstName: true, lastName: true, phone: true, email: true } },
      visitor: { select: { firstName: true, lastName: true, phone: true, email: true } },
      programme: { select: { title: true, type: true, date: true, venue: true } },
    },
    orderBy: [{ programme: { date: "desc" } }, { checkInTime: "asc" }],
  });

  return NextResponse.json(attendance);
}
