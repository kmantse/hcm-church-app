import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const registrations = await prisma.registration.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(registrations);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const registration = await prisma.registration.create({
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
      howDidYouHear: body.howDidYouHear || null,
      prayerRequest: body.prayerRequest || null,
      status: "PENDING",
    },
  });

  return NextResponse.json(registration, { status: 201 });
}
