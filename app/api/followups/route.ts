import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || "";
  const type = searchParams.get("type") || "";
  const personType = searchParams.get("personType") || "";
  const memberId = searchParams.get("memberId") || "";
  const visitorId = searchParams.get("visitorId") || "";
  const search = searchParams.get("search") || "";

  const followUps = await prisma.followUp.findMany({
    where: {
      AND: [
        status ? { status } : {},
        type ? { type } : {},
        personType ? { personType } : {},
        memberId ? { memberId } : {},
        visitorId ? { visitorId } : {},
        search
          ? {
              OR: [
                { subject: { contains: search } },
                { assignedTo: { contains: search } },
                { member: { OR: [{ firstName: { contains: search } }, { lastName: { contains: search } }] } },
                { visitor: { OR: [{ firstName: { contains: search } }, { lastName: { contains: search } }] } },
              ],
            }
          : {},
      ],
    },
    include: {
      member: { select: { id: true, firstName: true, lastName: true, phone: true, email: true } },
      visitor: { select: { id: true, firstName: true, lastName: true, phone: true, email: true } },
    },
    orderBy: [{ status: "asc" }, { scheduledDate: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json(followUps);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const followUp = await prisma.followUp.create({
    data: {
      memberId: body.personType === "MEMBER" ? body.personId : null,
      visitorId: body.personType === "VISITOR" ? body.personId : null,
      personType: body.personType,
      type: body.type || "CALL",
      subject: body.subject,
      notes: body.notes || null,
      status: body.status || "SCHEDULED",
      scheduledDate: body.scheduledDate ? new Date(body.scheduledDate) : null,
      assignedTo: body.assignedTo || null,
    },
    include: {
      member: { select: { id: true, firstName: true, lastName: true } },
      visitor: { select: { id: true, firstName: true, lastName: true } },
    },
  });

  return NextResponse.json(followUp, { status: 201 });
}
