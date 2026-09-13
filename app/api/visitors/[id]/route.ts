import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const visitor = await prisma.visitor.findUnique({
    where: { id },
    include: {
      visits: { orderBy: { visitDate: "desc" } },
      attendance: { include: { programme: true }, orderBy: { createdAt: "desc" } },
    },
  });

  if (!visitor) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(visitor);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const visitor = await prisma.visitor.update({
    where: { id },
    data: {
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email || null,
      phone: body.phone || null,
      address: body.address || null,
      gender: body.gender || null,
      invitedBy: body.invitedBy || null,
      purpose: body.purpose || null,
      notes: body.notes || null,
    },
  });

  return NextResponse.json(visitor);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.visitor.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
