import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const programme = await prisma.programme.findUnique({
    where: { id },
    include: {
      attendance: {
        include: { member: true, visitor: true },
        orderBy: { checkInTime: "asc" },
      },
      _count: { select: { attendance: true } },
    },
  });

  if (!programme) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(programme);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const programme = await prisma.programme.update({
    where: { id },
    data: {
      title: body.title,
      description: body.description || null,
      type: body.type || "SERVICE",
      date: new Date(body.date),
      startTime: body.startTime || null,
      endTime: body.endTime || null,
      venue: body.venue || null,
      notes: body.notes || null,
    },
  });

  return NextResponse.json(programme);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.programme.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
