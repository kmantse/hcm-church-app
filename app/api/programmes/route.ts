import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const type = searchParams.get("type") || "";

  const programmes = await prisma.programme.findMany({
    where: {
      AND: [
        search ? { title: { contains: search } } : {},
        type ? { type } : {},
      ],
    },
    include: { _count: { select: { attendance: true } } },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(programmes);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const programme = await prisma.programme.create({
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

  return NextResponse.json(programme, { status: 201 });
}
