import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const followUp = await prisma.followUp.findUnique({
    where: { id },
    include: {
      member: true,
      visitor: true,
    },
  });
  if (!followUp) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(followUp);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const followUp = await prisma.followUp.update({
    where: { id },
    data: {
      type: body.type,
      subject: body.subject,
      notes: body.notes || null,
      feedback: body.feedback || null,
      outcome: body.outcome || null,
      status: body.status,
      scheduledDate: body.scheduledDate ? new Date(body.scheduledDate) : null,
      completedDate: body.completedDate ? new Date(body.completedDate) : null,
      assignedTo: body.assignedTo || null,
    },
    include: {
      member: { select: { id: true, firstName: true, lastName: true } },
      visitor: { select: { id: true, firstName: true, lastName: true } },
    },
  });

  return NextResponse.json(followUp);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.followUp.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
