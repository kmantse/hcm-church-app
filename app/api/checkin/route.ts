import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { programmeId, attendeeId, attendeeType, notes } = body;

  const existing = await prisma.attendance.findFirst({
    where: {
      programmeId,
      ...(attendeeType === "MEMBER" ? { memberId: attendeeId } : { visitorId: attendeeId }),
    },
  });

  if (existing) {
    return NextResponse.json(
      { error: "Already checked in for this programme" },
      { status: 409 }
    );
  }

  const attendance = await prisma.attendance.create({
    data: {
      programmeId,
      memberId: attendeeType === "MEMBER" ? attendeeId : null,
      visitorId: attendeeType === "VISITOR" ? attendeeId : null,
      attendeeType,
      checkInTime: new Date(),
      notes: notes || null,
    },
    include: {
      programme: true,
      member: true,
      visitor: true,
    },
  });

  return NextResponse.json(attendance, { status: 201 });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const programmeId = searchParams.get("programmeId");

  if (!programmeId) {
    return NextResponse.json({ error: "programmeId required" }, { status: 400 });
  }

  const attendance = await prisma.attendance.findMany({
    where: { programmeId },
    include: { member: true, visitor: true },
    orderBy: { checkInTime: "desc" },
  });

  return NextResponse.json(attendance);
}
