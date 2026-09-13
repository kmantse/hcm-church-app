import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";

  const visitors = await prisma.visitor.findMany({
    where: search
      ? {
          OR: [
            { firstName: { contains: search } },
            { lastName: { contains: search } },
            { email: { contains: search } },
            { phone: { contains: search } },
          ],
        }
      : {},
    include: { visits: { orderBy: { visitDate: "desc" }, take: 1 } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(visitors);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const visitor = await prisma.visitor.create({
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
      visits: {
        create: { visitDate: body.visitDate ? new Date(body.visitDate) : new Date() },
      },
    },
  });

  return NextResponse.json(visitor, { status: 201 });
}
