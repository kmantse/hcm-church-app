import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "";

  const members = await prisma.member.findMany({
    where: {
      AND: [
        search
          ? {
              OR: [
                { firstName: { contains: search } },
                { lastName: { contains: search } },
                { email: { contains: search } },
                { phone: { contains: search } },
              ],
            }
          : {},
        status ? { membershipStatus: status } : {},
      ],
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(members);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const member = await prisma.member.create({
    data: {
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email || null,
      phone: body.phone || null,
      gender: body.gender || null,
      dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : null,
      address: body.address || null,
      city: body.city || null,
      occupation: body.occupation || null,
      maritalStatus: body.maritalStatus || null,
      membershipDate: body.membershipDate ? new Date(body.membershipDate) : null,
      membershipStatus: body.membershipStatus || "ACTIVE",
      notes: body.notes || null,
    },
  });

  return NextResponse.json(member, { status: 201 });
}
